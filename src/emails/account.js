// const sgMail = require('@sendgrid/mail')
// const nodemailer = require('nodemailer');

// const sendgridAPIKey = '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'

// sgMail.setApiKey(sendgridAPIKey)

// sgMail.send({
//     to: 'dmp160199@gmail.com',
//     from: 'dmp160199@gmail.com',
//     subject: 'This is my first creation!',
//     text: 'I hope this one actually get to you.'
// })


const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox529a4c09f3384fa68f6d43f63f1d4ce1.mailgun.org';
const api_key = '459c62ad4456b8c3cb3fdce3b2ee1c3c-135a8d32-80ff0bd5';
const mg = mailgun({apiKey: api_key, domain: DOMAIN});
const data = {
	from: 'dmp160199@gmail.com',
	to: 'dmp160199@gmail.com, YOU@YOUR_DOMAIN_NAME',
	subject: 'Hello',
	text: 'Testing some Mailgun awesomness!'
};
mg.messages().send(data, function (error, body) {
	console.log(body);
});