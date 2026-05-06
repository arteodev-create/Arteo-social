const IdentificationService = require('./Identification.Service');
const AsyncHandler = require('../../middleware/AsyncHandler');
const TransformUtils = require('../../utils/Transform.Utils');
const Logger = require('../../infra/logging/Logger.Service');
const { NotFoundError, BadRequestError } = require('../../core/Errors');
const MediaService = require('../media/Media.Service');
const {
    clearRefreshCookie,
    moveRefreshTokenToCookie,
    readRefreshCookie
} = require('./SessionCookie');

const { 
    authenticateSchema, establishSchema, verifySchema, 
    recoverySchema, completeRecoverySchema, rotateCredentialSchema,
    updateProfileSchema, revokeSessionSchema
} = require('./Identification.Validation');

/**
 * [AIS] IdentificationController
 * API Surface cho Arteo Identity System (AIS).
 * Chuẩn cấu trúc Senior ABS v14.1.
 */
class IdentificationController {
    
    /**
     * Xác thực danh tính qua Vector định danh/mật mã.
     */
    authenticate = AsyncHandler(async (req, res) => {
        const validated = authenticateSchema.parse(req.body);
        
        const ip = (req.ip || req.get('x-forwarded-for') || '127.0.0.1').replace(/^::ffff:/, '');
        const ua = req.get('User-Agent');

        Logger.info('Yêu cầu xác thực danh tính', { identifier: validated.identifier, ip });

        const result = await IdentificationService.authenticate({
            ...validated,
            ip, 
            ua,
            language: validated.language || req.get('Accept-Language') || 'vi'
        });

        res.success(moveRefreshTokenToCookie(res, result), { message: 'Xác thực danh tính thành công. Chào mừng bạn trở lại Arteo.' });
    });

    /**
     * Thiết lập danh tính sơ khởi (Đăng ký).
     */
    establish = AsyncHandler(async (req, res) => {
        const validated = establishSchema.parse(req.body);
        
        const language = validated.language || req.get('Accept-Language') || 'vi';

        Logger.info('Bắt đầu thiết lập danh tính mới', { email: validated.email });

        const result = await IdentificationService.establishIdentity({
            ...validated,
            language
        });

        res.created(result, { message: 'Khởi tạo danh tính thành công. Một mã xác thực định danh đã được gửi đến email của bạn.' });
    });

    /**
     * Truy xuất hồ sơ danh tính hiện tại (Cá nhân).
     */
    getProfile = AsyncHandler(async (req, res) => {
        const user = await IdentificationService.checkExists(req.user.uuid, req.user.uuid);
        if (!user) throw new NotFoundError('Hồ sơ danh tính không tồn tại trên mạng lưới Arteo.');

        res.success(TransformUtils.formatUser(user));
    });

    /**
     * Truy xuất hồ sơ công khai (Dùng cho trang cá nhân của người khác).
     */
    getPublicProfile = AsyncHandler(async (req, res) => {
        const identifier = req.params.uuid || req.params.identifier;
        const visitorId = req.user?.uuid || null;

        const user = await IdentificationService.checkExists(identifier, visitorId);
        if (!user) throw new NotFoundError('Không tìm thấy thông tin định danh yêu cầu.');

        res.success(TransformUtils.formatUser(user));
    });

    /**
     * Kiểm tra sự tồn tại của định danh (Username/Email).
     */
    checkIdentifier = AsyncHandler(async (req, res) => {
        const { identifier, username, email } = req.query;
        const key = identifier || username || email;
        const visitorId = req.user?.uuid || null;

        if (!key) throw new BadRequestError('Vui lòng cung cấp định danh để thực hiện truy vấn.');

        const user = await IdentificationService.checkExists(key, visitorId);
        
        res.success({ 
            exists: !!user, 
            user: user ? TransformUtils.formatUser(user) : null 
        }, { message: 'Truy vấn định danh hoàn tất.' });
    });

    /**
     * Xác thực email qua mã OTP.
     */
    verify = AsyncHandler(async (req, res) => {
        const validated = verifySchema.parse(req.body);
        
        const language = validated.language || req.get('Accept-Language') || 'vi';
        const ip = (req.ip || req.get('x-forwarded-for') || '127.0.0.1').replace(/^::ffff:/, '');
        const ua = req.get('User-Agent');

        const result = await IdentificationService.verifyIdentity(
            validated.email,
            validated.code,
            language,
            ip,
            ua
        );

        res.success(moveRefreshTokenToCookie(res, result), { message: 'Xác thực danh tính thành công. Tài khoản của bạn đã được kích hoạt trên toàn mạng lưới.' });
    });

    /**
     * Gửi lại mã xác thực.
     */
    resendVerification = AsyncHandler(async (req, res) => {
        const { email, language } = req.body;
        if (!email) throw new BadRequestError('Cần cung cấp địa chỉ email để gửi lại mã xác thực.');

        const lang = language || req.get('Accept-Language') || 'vi';
        const result = await IdentificationService.resendVerification(email, lang);

        res.success(result, { message: 'Một mã xác thực định danh mới đã được gửi tới hòm thư của bạn.' });
    });

    /**
     * Khởi động quy trình khôi phục danh tính.
     */
    recover = AsyncHandler(async (req, res) => {
        const validated = recoverySchema.parse(req.body);
        
        const language = validated.language || req.get('Accept-Language') || 'vi';
        const ip = (req.ip || req.get('x-forwarded-for') || '127.0.0.1').replace(/^::ffff:/, '');

        Logger.info('Yêu cầu khôi phục danh tính', { email: validated.email, ip });

        const result = await IdentificationService.initiateRecovery(validated.email, language, ip);
        
        res.success(result, { message: 'Yêu cầu đã được ghi nhận. Vui lòng kiểm tra email để thực hiện quy trình khôi phục mật mã.' });
    });

    /**
     * Hoàn tất khôi phục mật mã.
     */
    completeRecovery = AsyncHandler(async (req, res) => {
        const validated = completeRecoverySchema.parse(req.body);
        
        const result = await IdentificationService.completeRecovery(validated.token, validated.credential);
        
        res.success(result, { message: 'Mật mã định danh đã được cập nhật thành công. Chào mừng bạn trở lại.' });
    });

    /**
     * Đổi mật mã định kỳ.
     */
    rotate = AsyncHandler(async (req, res) => {
        const validated = rotateCredentialSchema.parse(req.body);
        const result = await IdentificationService.rotateCredential(
            req.user.uuid,
            validated.oldCredential,
            validated.newCredential
        );

        res.success(result, { message: 'Thay đổi mật mã định danh thành công. Vui lòng ghi nhớ mật mã mới của bạn.' });
    });

    /**
     * Quản lý phiên làm việc: Liệt kê.
     */
    getSessions = AsyncHandler(async (req, res) => {
        const sessions = await IdentificationService.getActiveSessions(req.user.uuid);
        
        res.success({ sessions: sessions.map(s => TransformUtils.formatSession(s)) });
    });

    /**
     * Quản lý phiên làm việc: Thu hồi.
     */
    revokeSession = AsyncHandler(async (req, res) => {
        const validated = revokeSessionSchema.parse(req.body);
        await IdentificationService.revokeSession(req.user.uuid, validated.sessionId);
        
        res.success(null, { message: 'Phiên danh tính đã được chấm dứt an toàn.' });
    });

    /**
     * Làm mới Token (Refresh).
     */
    refresh = AsyncHandler(async (req, res) => {
        const refreshToken = readRefreshCookie(req) || req.body.refreshToken;
        if (!refreshToken) throw new BadRequestError('Cần cung cấp Refresh Token để tiếp tục phiên làm việc.');

        const result = await IdentificationService.refreshToken(refreshToken);
        
        res.success(moveRefreshTokenToCookie(res, result), { message: 'Phiên danh tính đã được gia hạn thành công.' });
    });

    /**
     * Cập nhật thông tin hồ sơ.
     */
    updateProfile = AsyncHandler(async (req, res) => {
        const validated = updateProfileSchema.parse(req.body);
        
        let avatarUrl = validated.avatar;
        if (req.files && (req.files.avatar || req.files.image)) {
            const file = (req.files.avatar || req.files.image)[0];
            avatarUrl = MediaService.resolveFileUrl(file);
        }

        const result = await IdentificationService.updateProfile(req.user.uuid, {
            ...validated,
            avatar: avatarUrl
        });

        res.success(result, { message: 'Thông tin hồ sơ danh tính của bạn đã được cập nhật.' });
    });

    /**
     * Kết thúc phiên làm việc (Đăng xuất).
     */
    logout = AsyncHandler(async (req, res) => {
        if (req.user?.sid) {
            await IdentificationService.revokeSession(req.user.uuid, req.user.sid);
        }
        clearRefreshCookie(res);
        
        res.success(null, { message: 'Đã đăng xuất an toàn khỏi mạng lưới Arteo.' });
    });

    /**
     * Truy xuất gợi ý kết nối (Who to follow).
     */
    getSuggestions = AsyncHandler(async (req, res) => {
        const limit = parseInt(req.query.limit) || 3;
        const visitorId = req.user?.uuid || null;

        const users = await IdentificationService.getSuggestions(visitorId, limit);
        
        res.success(users.map(u => TransformUtils.formatUser(u)));
    });

}

module.exports = new IdentificationController();
