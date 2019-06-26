const sgMail = require('@sendgrid/mail');
const sendgridAPIKey = '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';

sgMail.setApiKey(sendgridAPIKey)

const sendFeedbackEmail =(email , firstname , lastname) => {
    sgMail.send({
        to: email,
        from: 'no-reply@noteapp.com',
        subject: 'Thankyou for your feedback',
        text:`Hello ${firstname} ${lastname} , we receieved your feedback. We will get back to you shortly`
    })
}



module.exports ={
    sendFeedbackEmail
}
