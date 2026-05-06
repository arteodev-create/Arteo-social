const { z } = require('zod');

/**
 * [AIS] Identification Validation Schemas
 * Standardized using Zod for ABS v14.1 Platinum.
 */

const authenticateSchema = z.object({
    identifier: z.string().min(1, 'Username hoặc Email không được để trống'),
    credential: z.string().optional(),
    password: z.string().optional(),
    language: z.string().optional()
}).refine(data => {
    const cred = data.credential || data.password;
    return !!cred && cred.length >= 6;
}, {
    message: 'Mật khẩu phải có ít nhất 6 ký tự',
    path: ['credential']
}).transform(data => {
    const cred = data.credential || data.password;
    return { ...data, credential: cred };
});

const establishSchema = z.object({
    username: z.string().min(3, 'Username phải có ít nhất 3 ký tự').max(30),
    email: z.string().email('Email không hợp lệ'),
    credential: z.string().optional(),
    password: z.string().optional(),
    fullName: z.string().min(2, 'Họ tên quá ngắn').max(100).optional(),
    full_name: z.string().optional(),
    language: z.string().optional()
}).transform(data => {
    const cred = data.credential || data.password;
    if (!cred) throw new Error('Mật khẩu không được để trống');
    if (cred.length < 8) throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
    
    return {
        ...data,
        credential: cred,
        fullName: data.fullName || data.full_name
    };
});

const verifySchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    code: z.string().min(4, 'Mã xác thực không hợp lệ'),
    language: z.string().optional()
});

const recoverySchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    language: z.string().optional()
});

const completeRecoverySchema = z.object({
    token: z.string().min(1, 'Token không hợp lệ'),
    credential: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
});

const rotateCredentialSchema = z.object({
    oldCredential: z.string().min(1, 'Mật khẩu cũ không được để trống'),
    newCredential: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
});

const updateProfileSchema = z.object({
    fullName: z.string().min(2, 'Họ tên quá ngắn').max(100).optional().nullable(),
    bio: z.string().max(500, 'Bio không được quá 500 ký tự').optional().nullable(),
    location: z.string().max(100, 'Vị trí không được quá 100 ký tự').optional().nullable(),
    avatar: z.string().optional().nullable(),
    website: z.string().max(255, 'Website không được quá 255 ký tự').optional().nullable(),
    headline: z.string().max(255, 'Headline không được quá 255 ký tự').optional().nullable(),
    pronouns: z.string().max(50, 'Danh xưng không được quá 50 ký tự').optional().nullable(),
    socialLinks: z.any().optional()
});

const revokeSessionSchema = z.object({
    sessionId: z.string().min(1, 'Cần cung cấp mã phiên làm việc (Session ID)')
});

module.exports = {
    authenticateSchema,
    establishSchema,
    verifySchema,
    recoverySchema,
    completeRecoverySchema,
    rotateCredentialSchema,
    updateProfileSchema,
    revokeSessionSchema
};
