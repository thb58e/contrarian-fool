const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const AWS = require('aws-sdk');

// Declare SES
const ses = new AWS.SES({ region: 'eu-north-1' }); // IMPORTANT: Replace 'eu-north-1' with your AWS region

// Declare the email address that is verified with SES
// This should be the same email address you verified earlier
const SENDER_EMAIL = 'thb58e@icloud.com'; // IMPORTANT: Replace with your verified sender email

// declare the email address to which you want to receive messages
const RECIPIENT_EMAIL = 'thb58e@icloud.com'; // IMPORTANT: Replace with your desired recipient email

// declare the subject of the email that you receive
const EMAIL_SUBJECT = 'New Contact Form Submission from Your Website';

// declare the name of your website for the email content
const WEBSITE_NAME = 'Contrarian Fool';

// declare a placeholder for your website URL
const WEBSITE_URL = 'YOUR_WEBSITE_URL_HERE'; // IMPORTANT: Replace with your actual website URL

// declare a placeholder for the contact form URL
const CONTACT_FORM_URL = 'YOUR_CONTACT_FORM_URL_HERE'; // IMPORTANT: Replace with your actual contact form URL

// declare a placeholder for your copyright year
const COPYRIGHT_YEAR = '2024'; // IMPORTANT: Replace with the current year

// declare placeholders for your social media links
const TWITTER_URL = 'YOUR_TWITTER_URL_HERE'; // IMPORTANT: Replace with your Twitter URL
const LINKEDIN_URL = 'YOUR_LINKEDIN_URL_HERE'; // IMPORTANT: Replace with your LinkedIn URL
const GITHUB_URL = 'YOUR_GITHUB_URL_HERE'; // IMPORTANT: Replace with your GitHub URL

// declare placeholders for the email template
const EMAIL_TEMPLATE = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .header { background-color: #f8f8f8; padding: 10px 0; text-align: center; border-bottom: 1px solid #eee; }
            .content { padding: 20px 0; }
            .footer { background-color: #f8f8f8; padding: 10px 0; text-align: center; font-size: 0.9em; color: #777; border-top: 1px solid #eee; }
            .button { display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            ul { list-style-type: none; padding: 0; }
            ul li { margin-bottom: 10px; }
            .social-links a { margin: 0 5px; text-decoration: none; color: #007bff; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>New Message from ${WEBSITE_NAME} Contact Form</h2>
            </div>
            <div class="content">
                <p>You have received a new message from your website's contact form. Here are the details:</p>
                <ul>
                    <li><strong>Name:</strong> {name}</li>
                    <li><strong>Email:</strong> {email}</li>
                    <li><strong>Message:</strong> {message}</li>
                </ul>
                <p>Best regards,</p>
                <p>${WEBSITE_NAME} Team</p>
            </div>
            <div class="footer">
                <p>&copy; ${COPYRIGHT_YEAR} ${WEBSITE_NAME}. All rights reserved.</p>
                <p>${COMPANY_ADDRESS_LINE1}<br/>${COMPANY_ADDRESS_LINE2}</p>
                <div class="social-links">
                    <a href="${TWITTER_URL}">Twitter</a> |
                    <a href="${LINKEDIN_URL}">LinkedIn</a> |
                    <a href="${GITHUB_URL}">GitHub</a>
                </div>
                <p>If you no longer wish to receive these notifications, please manage your preferences <a href="${WEBSITE_URL}">here</a>.</p>
            </div>
        </div>
    </body>
    </html>
`;

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.post('/sendEmail', async (req, res) => { // NOTE: changed /sendEmails to /sendEmail to match path set during API creation
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields: name, email, or message.' });
    }

    // Replace placeholders in the email template
    let emailContent = EMAIL_TEMPLATE
        .replace('{name}', name)
        .replace('{email}', email)
        .replace('{message}', message);

    const params = {
        Source: SENDER_EMAIL,
        Destination: {
            ToAddresses: [RECIPIENT_EMAIL]
        },
        Message: {
            Subject: {
                Data: EMAIL_SUBJECT
            },
            Body: {
                Html: {
                    Data: emailContent
                }
            }
        }
    };

    try {
        await ses.sendEmail(params).promise();
        res.json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email.', error: error.message });
    }
});

app.listen(3000, () => {
    console.log("App started");
});

module.exports = app;