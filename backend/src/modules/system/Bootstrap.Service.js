const Logger = require('../../infra/logging/Logger.Service');
const IdentificationRepository = require('../identity/Identification.Repository');
const Security = require('../../infra/security/SecurityEngine');
const { buildActorUri, buildInboxUrl, buildOutboxUrl } = require('../identity/IdentityHandle');

/**
 * BootstrapService
 * Trách nhiệm: Khởi tạo dữ liệu nền tảng khi máy chủ Arteo lần đầu hoạt động.
 */
class BootstrapService {
    async init() {
        try {
            Logger.info('[Bootstrap] Đang kiểm tra hiện trạng máy chủ...');

            const platformDomain = process.env.DOMAIN || 'arteosocial.com';
            Logger.info(`[Bootstrap] Single-server domain: ${platformDomain}`);

            // 2. Kiểm tra tài khoản Admin
            const adminCount = await IdentificationRepository.prisma.user.count({
                where: { isAdmin: true }
            });

            if (true) { // Always sync on bootstrap for Platinum consistency
                Logger.info('[Bootstrap] Đang đồng bộ tài khoản Quản trị tối cao (Force Sync)...');
                
                const adminUsername = 'admin';
                const adminDomain = String(platformDomain).toLowerCase();
                const adminEmail = `admin@${platformDomain}`;
                const defaultPass = 'ArteoAdmin@2026';
                
                const hashedPassword = await Security.hashCredential(defaultPass);

                const adminUser = await IdentificationRepository.prisma.user.upsert({
                    where: { username_identityDomain: { username: adminUsername, identityDomain: adminDomain } },
                    update: {
                        password: hashedPassword,
                        isAdmin: true,
                        isVerified: true,
                        emailVerified: true,
                        role: 'SUPER_ADMIN',
                        status: 'ACTIVE'
                    },
                    create: {
                        username: adminUsername,
                        identityDomain: adminDomain,
                        actorUri: buildActorUri(adminUsername, adminDomain),
                        inboxUrl: buildInboxUrl(adminUsername, adminDomain),
                        outboxUrl: buildOutboxUrl(adminUsername, adminDomain),
                        email: adminEmail,
                        password: hashedPassword,
                        fullName: 'Arteo Administrator',
                        isAdmin: true,
                        isVerified: true,
                        emailVerified: true,
                        role: 'SUPER_ADMIN',
                        status: 'ACTIVE'
                    }
                });

                Logger.info(`--- KHỞI TẠO ADMIN THÀNH CÔNG [ID: ${adminUser.uuid}] ---`);
                Logger.info(`Username: ${adminUsername} | Role: ${adminUser.role}`);
                Logger.info(`Email: ${adminEmail}`);
                Logger.info('---------------------------------');
            }
 else {
                Logger.info('[Bootstrap] Hệ thống đã có quản trị viên. Sẵn sàng vận hành.');
            }

        } catch (error) {
            Logger.error(`[Bootstrap] Thất bại khi khởi tạo hệ thống: ${error.message}`);
        }
    }
}

module.exports = new BootstrapService();
