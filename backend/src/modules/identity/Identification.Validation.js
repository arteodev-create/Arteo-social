const { z } = require('zod');
const { DEFAULT_DOMAIN } = require('./IdentityHandle');

const authenticateSchema = z.object({
    identifier: z.string().min(1, 'Identifier is required'),
    domain: z.string().min(1).max(255).optional(),
    credential: z.string().optional(),
    password: z.string().optional(),
    language: z.string().optional()
}).refine(data => {
    const cred = data.credential || data.password;
    return !!cred && cred.length >= 6;
}, {
    message: 'Password must be at least 6 characters',
    path: ['credential']
}).transform(data => {
    const cred = data.credential || data.password;
    return { ...data, credential: cred };
});

const establishSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    domain: z.string().min(1).max(255).default(DEFAULT_DOMAIN).optional(),
    email: z.string().email('Invalid email'),
    credential: z.string().optional(),
    password: z.string().optional(),
    fullName: z.string().min(2, 'Full name is too short').max(100).optional(),
    full_name: z.string().optional(),
    language: z.string().optional()
}).transform(data => {
    const cred = data.credential || data.password;
    if (!cred) throw new Error('Password is required');
    if (cred.length < 8) throw new Error('Password must be at least 8 characters');

    return {
        ...data,
        credential: cred,
        fullName: data.fullName || data.full_name
    };
});

const verifySchema = z.object({
    email: z.string().email('Invalid email'),
    code: z.string().min(4, 'Invalid verification code'),
    language: z.string().optional()
});

const recoverySchema = z.object({
    email: z.string().email('Invalid email'),
    language: z.string().optional()
});

const completeRecoverySchema = z.object({
    token: z.string().min(1, 'Invalid token'),
    credential: z.string().min(8, 'New password must be at least 8 characters')
});

const rotateCredentialSchema = z.object({
    oldCredential: z.string().min(1, 'Old password is required'),
    newCredential: z.string().min(8, 'New password must be at least 8 characters')
});

const updateProfileSchema = z.object({
    fullName: z.string().min(2, 'Full name is too short').max(100).optional().nullable(),
    bio: z.string().max(500, 'Bio is too long').optional().nullable(),
    location: z.string().max(100, 'Location is too long').optional().nullable(),
    avatar: z.string().optional().nullable(),
    website: z.string().max(255, 'Website is too long').optional().nullable(),
    headline: z.string().max(255, 'Headline is too long').optional().nullable(),
    pronouns: z.string().max(50, 'Pronouns are too long').optional().nullable(),
    socialLinks: z.any().optional()
});

const revokeSessionSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required')
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
