const path = require('path');
require('dotenv').config();

module.exports = {
    app_url: process.env.APP_URL,
    salt: process.env.SESSION_SECRET,
    db_url: process.env.MONGODB_URL,
    admin_email: "some@email.ru",
    email_config: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),  
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS 
        }
    },
    gallery_path: `${path.resolve(__dirname)}/other/gallery/`,
    reports_path: `${path.resolve(__dirname)}/other/reports/`,
    fonts_path: `${path.resolve(__dirname)}/other/fonts/`
}
