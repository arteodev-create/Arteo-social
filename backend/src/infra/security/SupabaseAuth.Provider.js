const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/Registry');
const Logger = require('../logging/Logger.Service');
const { AppError, AuthorizationError, ConflictError, ConfigurationError, ErrorCodes } = require('../../core/Errors');

class SupabaseAuthProvider {
    constructor() {
        const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey, supabaseAuthEnabled } = config.db;
        this.url = supabaseUrl;
        this.anonKey = supabaseAnonKey;
        this.serviceRoleKey = supabaseServiceRoleKey;
        const disabledForTest = config.infra.env === 'test';
        const explicitlyDisabled = supabaseAuthEnabled === false;
        const hasCredentials = Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey);
        this.disabledForTest = disabledForTest;

        if (!disabledForTest && !explicitlyDisabled && !hasCredentials) {
            throw new ConfigurationError(
                'Supabase Auth is enabled but SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY is missing.'
            );
        }

        this.enabled = Boolean(!disabledForTest && !explicitlyDisabled && hasCredentials);

        this.publicClient = this.enabled
            ? createClient(supabaseUrl, supabaseAnonKey, {
                auth: { persistSession: false, autoRefreshToken: false }
            })
            : null;

        this.adminClient = this.enabled
            ? createClient(supabaseUrl, supabaseServiceRoleKey, {
                auth: { persistSession: false, autoRefreshToken: false }
            })
            : null;

        if (!this.enabled) {
            const reason = config.infra.env === 'test'
                ? 'disabled in test environment'
                : 'disabled by SUPABASE_AUTH_ENABLED=false';
            Logger.warn(`[SupabaseAuth] ${reason}.`);
        }
    }

    isEnabled() {
        return this.enabled;
    }

    async createUser({ email, password, username, fullName, language }) {
        if (this.disabledForTest) return null;
        if (!this.enabled) {
            throw new ConfigurationError('Supabase Auth is required for registration but is currently disabled.');
        }

        const { data, error } = await this.adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: false,
            user_metadata: {
                username,
                full_name: fullName || username,
                language
            }
        });

        if (error) {
            if (this._isAlreadyRegistered(error)) {
                throw new ConflictError('Email đã tồn tại trong Supabase Auth.');
            }
            throw new AppError(`Supabase register failed: ${error.message}`, 502, ErrorCodes.AUTH_USER_MIGRATED);
        }

        return data.user;
    }

    async deleteUser(userId) {
        if (!this.enabled || !userId) return;

        const { error } = await this.adminClient.auth.admin.deleteUser(userId);
        if (error) Logger.warn('[SupabaseAuth] Failed to rollback auth user.', { userId, error: error.message });
    }

    async authenticate(email, password) {
        if (this.disabledForTest) return null;
        if (!this.enabled) {
            throw new ConfigurationError('Supabase Auth is required for login but is currently disabled.');
        }

        const { data, error } = await this.publicClient.auth.signInWithPassword({ email, password });
        if (error) {
            if (String(error.message || '').toLowerCase().includes('email not confirmed')) {
                throw new AuthorizationError('Email chưa được xác thực trên Supabase Auth.', {
                    code: ErrorCodes.AUTH_NOT_VERIFIED
                });
            }

            throw new AuthorizationError('Email hoặc mật khẩu không đúng trên Supabase Auth.', {
                code: ErrorCodes.AUTH_INVALID_CREDS
            });
        }

        return data;
    }

    async confirmEmail(userId) {
        if (!this.enabled || !userId) return null;

        const { data, error } = await this.adminClient.auth.admin.updateUserById(userId, {
            email_confirm: true
        });

        if (error) {
            throw new AppError(`Supabase email confirmation failed: ${error.message}`, 502, ErrorCodes.AUTH_NOT_VERIFIED);
        }

        return data.user;
    }

    async updatePassword(userId, password) {
        if (!this.enabled || !userId) return null;

        const { data, error } = await this.adminClient.auth.admin.updateUserById(userId, { password });
        if (error) {
            throw new AppError(`Supabase password update failed: ${error.message}`, 502, ErrorCodes.AUTH_USER_MIGRATED);
        }

        return data.user;
    }

    async ensureUserForLegacyAccount(user, password) {
        if (this.disabledForTest) return user?.supabaseAuthId || null;
        if (!this.enabled) {
            throw new ConfigurationError('Supabase Auth is required for account migration but is currently disabled.');
        }
        if (user.supabaseAuthId) return user.supabaseAuthId;

        const authUser = await this.createUser({
            email: user.email,
            password,
            username: user.username,
            fullName: user.fullName,
            language: user.language
        });

        if (user.emailVerified) await this.confirmEmail(authUser.id);
        return authUser.id;
    }

    _isAlreadyRegistered(error) {
        const message = String(error?.message || '').toLowerCase();
        return message.includes('already') || message.includes('registered') || message.includes('exists');
    }
}

module.exports = new SupabaseAuthProvider();
