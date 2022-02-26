'use strict';
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const welcomeMail = (userEmail, userName) => {
    sgMail.send({
        to: userEmail,
        from: `aalok.public@gmail.com`,
        subject: `Welcome to Task Manager Web App!`,
        html: `<h3>Hey ${userName}!</h3> <p>Thank you for choosing our Task Manager application 😃️</p>`
    })
}

const deletionMail = (userEmail, userName) => {
    sgMail.send({
        to: userEmail,
        from: `aalok.public@gmail.com`,
        subject: `Why soo early? 😕️`,
        html: `<h3>Goodbye ${userName}!</h3> <p>We have deleted all your account details as well as your Tasks from server</p>
        <p>It'll be great if let us know reason...</p>`
    })
}

module.exports = {
    welcomeMail,
    deletionMail
}