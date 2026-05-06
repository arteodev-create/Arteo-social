class EmailLayout {
    static wrap(content) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8f9fa; color: #000000; }
                    .container { max-width: 500px; margin: 40px auto; padding: 40px; background-color: #ffffff; border-radius: 24px; border: 1px solid #eaeaea; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
                    .header { text-align: center; margin-bottom: 40px; }
                    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #999999; border-top: 1px solid #f1f1f1; padding-top: 24px; text-transform: uppercase; letter-spacing: 1px; }
                    .logo { font-size: 28px; font-weight: 800; letter-spacing: -1.5px; color: #000000; }
                    .content { font-size: 15px; color: #333333; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">Arteo</div>
                    </div>
                    <div class="content">
                        ${content}
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Arteo Platform • Arteo Platform</p>
                        <p>Nơi sự riêng tư trở thành nghệ thuật</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = EmailLayout;
