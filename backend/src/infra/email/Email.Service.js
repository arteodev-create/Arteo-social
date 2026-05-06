const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const Logger = require('../logging/Logger.Service');
const EmailLayout = require('./templates/EmailLayout');
const Queue = require('../queue/Queue.Service');

class EmailService {
    constructor() {
        const apiKey = process.env.SMTP_PASS;
        const isDummy = apiKey === 're_dummy_password';

        if (apiKey && apiKey.startsWith('re_') && !isDummy) {
            this.resend = new Resend(apiKey);
            Logger.info('[EmailService] Protocol: Resend SDK');
        } else {
            const host = process.env.SMTP_HOST || 'smtp.gmail.com';
            const port = parseInt(process.env.SMTP_PORT || '587', 10);
            const secure = port === 465 || process.env.SMTP_SECURE === 'true';

            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
            Logger.info('[EmailService] Protocol: SMTP');
        }
    }

    async enqueueVerificationEmail(to, otp, language = 'vi') {
        return Queue.enqueue({
            type: 'verification',
            data: { to, otp, language }
        }, { queue: 'email' });
    }

    async enqueuePasswordResetEmail(to, token, language = 'vi') {
        return Queue.enqueue({
            type: 'password_reset',
            data: { to, token, language }
        }, { queue: 'email' });
    }

    async sendVerificationEmail(to, otp, language = 'vi') {
        const subject = language === 'vi' ? 'Arteo account verification' : 'Arteo Account Verification';
        const content = `<div style="text-align:center"><h2>${subject}</h2><p>Your verification code is:</p><div style="font-size:32px;font-weight:bold">${otp}</div><p>This code expires in 5 minutes.</p></div>`;
        return this._send(to, subject, content);
    }

    async sendPasswordResetEmail(to, token, language = 'vi') {
        const subject = language === 'vi' ? 'Arteo password recovery' : 'Arteo Password Recovery';
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        const content = `<div style="text-align:center"><h2>${subject}</h2><p>We received a request to reset your password.</p><a href="${resetLink}" style="display:inline-block;padding:14px 28px;background:#000;color:#fff;text-decoration:none;border-radius:30px">Reset Password</a></div>`;
        return this._send(to, subject, content);
    }

    async _send(to, subject, htmlContent) {
        try {
            const fromAddress = process.env.EMAIL_FROM || `Arteo Platform <${process.env.SMTP_USER}>`;
            const finalHtml = EmailLayout.wrap(htmlContent);

            if (this.resend) {
                const { data, error } = await this.resend.emails.send({
                    from: fromAddress,
                    to,
                    subject,
                    html: finalHtml
                });
                if (error) throw error;
                Logger.info(`[EmailService:Resend] Email sent to ${to}: ${subject}`);
                return data;
            }

            const info = await this.transporter.sendMail({
                from: fromAddress,
                to,
                subject,
                html: finalHtml
            });

            Logger.info(`[EmailService:SMTP] Email sent to ${to}: ${subject}`);
            return info;
        } catch (error) {
            Logger.error(`[EmailService] Failed to send email to ${to}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();