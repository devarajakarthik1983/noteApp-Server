const sgMail = require('@sendgrid/mail');
const sendgridAPIKey = '';

sgMail.setApiKey(sendgridAPIKey)

const sendFeedbackEmail =(email , firstname , lastname) => {
    sgMail.send({
        to: email,
        from: 'no-reply@noteapp.com',
        subject: 'Thankyou for your feedback',
        text:`Hello ${firstname} ${lastname} , we receieved your feedback. We will get back to you shortly`
    })
}


const sendActivationEmail =(email ,username ,token , encodedUrlEmail) => {
    sgMail.send({
        to: email,
        from: 'no-reply@noteapp.com',
        subject: 'Thankyou for your registering',
        text:`Hello ${username} , Thankyou for registering click the link to activate: http://localhost:3000/newuser/${encodedUrlEmail}/${token}`
    })
}


const sendActivationPassword =(email ,username ,token , encodedUrlEmail) => {
    sgMail.send({
        to: email,
        from: 'no-reply@noteapp.com',
        subject: 'Your Password activation link',
        text:`Hello ${username} , Hello here is you password link to activate: http://localhost:3000/passwordactivation/${encodedUrlEmail}/${token}`
    })
}


module.exports ={
    sendFeedbackEmail,
    sendActivationEmail,
    sendActivationPassword,
    
}
