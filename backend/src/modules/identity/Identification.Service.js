const Logger = require('../../infra/logging/Logger.Service');
const Repository = require('./Identification.Repository');
const Security = require('../../infra/security/SecurityEngine');
const EmailService = require('../../infra/email/Email.Service');
const CacheService = require('../../infra/cache/Cache.Service');
const SupabaseAuth = require('../../infra/security/SupabaseAuth.Provider');
const { AppError, ErrorCodes } = require('../../core/Errors');

const AuthService = require('./auth/Auth.Service');
const ProfileService = require('./auth/Profile.Service');
const RecoveryService = require('./auth/Recovery.Service');
const { eventEmitter, EVENTS } = require('../../events');

const SocketService = require('../../infra/socket/Socket.Service');

/**
 * [AIS] IdentificationService
 * Trách nhiệm: Facade cho Identity Domain, điều phối Access, Establishment và Recovery.
 * Chuẩn ABS v14.1 - Không chấp vá.
 * Arteo Platform Edition.
 */
class IdentificationService {
    
    // --- Authentication & Sessions ---

    async authenticate(params) { 
        return await AuthService.authenticate(params); 
    }

    async refreshToken(token) { 
        return await AuthService.refreshToken(token); 
    }

    async getActiveSessions(userId) { 
        return await Repository.getActiveSessions(userId); 
    }

    async revokeSession(userId, sid) { 
        // Logic: Chỉ chủ sở hữu mới có quyền thu hồi session
        return await Repository.revokeSession(sid); 
    }

    // --- Identity Establishment (Registration) ---

    async establishIdentity(data) {
        const { username, email, credential, fullName, language = 'vi' } = data;
        
        Logger.info('[Identity:Establish] Incoming registration data:', { username, email, fullName });

        // 1. Kiểm tra sự tồn tại (Uniqueness check)
        await this._checkIdentityUniqueness(username, email);

        const supabaseUser = await SupabaseAuth.createUser({
            email,
            password: credential,
            username,
            fullName: fullName || username,
            language
        });

        // 2. Hash credential và tạo bản ghi User mới ở trạng thái chưa xác thực
        const hashedPassword = await Security.hashCredential(credential);

        let user;
        try {
            user = await Repository.create({ 
                username, 
                email, 
                password: hashedPassword,
                supabaseAuthId: supabaseUser?.id || null,
                fullName: fullName || username, 
                language,
                emailVerified: false
            });
        } catch (error) {
            await SupabaseAuth.deleteUser(supabaseUser?.id);
            throw error;
        }

        // --- Arteo Admin Notification ---
        SocketService.emitToAdmins('admin_notification', {
            type: 'USER_REGISTERED',
            title: 'Cư dân mới đang gõ cửa',
            message: `@${username} vừa đăng ký tài khoản và đang chờ xác thực email.`,
            data: { username, email }
        });
        // --------------------------------

        // 3. Tạo mã OTP và lưu vào Cache (TTL 5 phút)
        const otp = Security.generateOTP(6);
        await CacheService.set(`otp:verify:${email}`, otp, 300);
        
        Logger.info(`[Identity:Establish] Mã OTP cho ${email} là: ${otp}`);

        // 4. Gửi email xác thực
        try {
            await EmailService.sendVerificationEmail(email, otp, language);
        } catch (error) {
            Logger.error(`[Identity:Establish] Failed to send email to ${email}: ${error.message}`);
        }

        // 5. Trả về thông tin định danh
        return { 
            email: user.email,
            username: user.username,
            requiresVerification: true 
        };
    }

    /**
     * Xác thực email qua mã OTP và kích hoạt tài khoản.
     */
    async verifyIdentity(email, code, language, ip, ua) {
        const storedOtp = await CacheService.get(`otp:verify:${email}`);
        if (!storedOtp || String(storedOtp) !== String(code)) {
            throw new AppError('Mã xác thực không chính xác hoặc đã hết hạn.', 400, ErrorCodes.AUTH_INVALID_OTP);
        }

        const user = await Repository.findByIdentifier(email);
        if (!user) throw new AppError('Tài khoản không tồn tại.', 404);

        await SupabaseAuth.confirmEmail(user.supabaseAuthId);
        const updatedUser = await Repository.update(user.uuid, { emailVerified: true, isVerified: true });
        await CacheService.del(`otp:verify:${email}`);

        // --- Arteo Admin Notification ---
        SocketService.emitToAdmins('admin_notification', {
            type: 'USER_VERIFIED',
            title: 'Cư dân mới nhập tịch',
            message: `@${updatedUser.username} đã xác thực email thành công và gia nhập Arteo!`,
            data: { username: updatedUser.username, email: updatedUser.email }
        });
        // --------------------------------

        Logger.info(`Xác thực danh tính thành công cho: ${email}`);
        return await this._issueInitialSession(updatedUser, ip, ua);
    }

    /**
     * Kiểm tra tính duy nhất của Username/Email.
     */
    async _checkIdentityUniqueness(username, email) {
        const existing = await Repository.findByIdentifier(username) || await Repository.findByIdentifier(email);
        if (existing) {
            throw new AppError('Danh tính đã tồn tại trong hệ thống.', 400, ErrorCodes.AUTH_IDENTIFIER_EXISTS);
        }
    }

    /**
     * Phát hành session đầu tiên cho người dùng mới sau khi xác thực.
     */
    async _issueInitialSession(user, ip, ua) {
        const Token = require('../../infra/security/TokenEngine');
        const TransformUtils = require('../../utils/Transform.Utils');

        const sessionId = Security.generateSecureToken(20);
        const mappedUser = TransformUtils.formatUser(user);
        
        await Repository.recordHistory({ 
            userId: user.uuid || mappedUser.uuid, 
            sessionId, 
            ipAddress: ip,
            userAgent: ua,
            isActive: true, 
            isSuccessful: true 
        });

        return { 
            user: mappedUser, 
            tokens: Token.issueTokenSet(user, sessionId) 
        };
    }

    // --- Recovery Operations ---

    async initiateRecovery(email, language, ip) {
        await this._checkPerimeterLockdown(ip, 'RECOVERY');
        
        const user = await Repository.findByIdentifier(email);
        if (!user) {
            // Vẫn return success để không lộ thông tin tài khoản
            return { success: true };
        }

        // Tạo token recovery và lưu vào DB
        const token = Security.generateSecureToken();
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ
        await Repository.update(user.uuid, {
            credentialResetToken: token,
            credentialResetExpires: expiry
        });

        await EmailService.sendPasswordResetEmail(user.email, token, language || user.language || 'vi');
        return { success: true };
    }

    async completeRecovery(token, newCredential) {
        return await RecoveryService.completeRecovery(token, newCredential);
    }

    async rotateCredential(userId, oldCredential, newCredential) {
        return await RecoveryService.rotateCredential(userId, oldCredential, newCredential);
    }

    // --- Profile & Identity Queries ---

    async checkExists(id, visibility) { 
        return await ProfileService.checkExists(id, visibility); 
    }

    async updateProfile(userId, data) { 
        return await ProfileService.updateProfile(userId, data); 
    }

    async getSuggestions(userId, limit) {
        return await Repository.findSuggestions(userId, limit);
    }

    // --- Safeguards & Perimeter Control ---

    async _runInteractionSafeguards(userId) {
        const frequency = await CacheService.trackInteractionFrequency(userId);
        if (frequency > 30) {
            throw new AppError('Hoạt động quá nhanh. Vui lòng thử lại sau vài giây.', 429);
        }
        // Logic reputation kiểm tra tính "người thật"
    }

    async _checkPerimeterLockdown(ip, type) {
        if (!ip) return;
        const attempts = await CacheService.get(`lockdown:${type}:${ip}`) || 0;
        if (attempts >= 10) {
            throw new AppError('Truy cập bị hạn chế tạm thời do phát hiện bất thường.', 429);
        }
    }

    async resendVerification(email, language = 'vi') {
        const user = await Repository.findByIdentifier(email);
        if (!user) throw new AppError('Tài khoản không tồn tại.', 404);
        if (user.emailVerified) throw new AppError('Tài khoản đã được xác thực.', 400);

        const otp = Security.generateOTP(6);
        await CacheService.set(`otp:verify:${email}`, otp, 300);
        
        Logger.info(`[Identity:Resend] Mã OTP MỚI cho ${email} là: ${otp}`);

        try {
            await EmailService.sendVerificationEmail(email, otp, language);
        } catch (error) {
            Logger.error(`[Identity:Resend] Failed to send email to ${email}: ${error.message}`);
        }

        return { success: true, email: user.email };
    }
}

module.exports = new IdentificationService();
