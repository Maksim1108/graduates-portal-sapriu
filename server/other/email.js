const email_config = require("../appConfig").email_config;
const nodemailer = require('nodemailer');

exports.sendMessageToEmail = (email, text) => {

    let smtpTransport = nodemailer.createTransport(email_config)

    let mailOptions = {
        from: email_config.auth.user,
        to:  email,
        subject: 'Подтверждение аккаунта',
        text: text,
        html: ""
    }
    
    return smtpTransport.sendMail(mailOptions)
}