const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-email-password', // Replace with your email password or app password
    },
});

// Twilio Configuration
const accountSid = 'your-twilio-account-sid'; // Replace with your Twilio Account SID
const authToken = 'your-twilio-auth-token'; // Replace with your Twilio Auth Token
const client = twilio(accountSid, authToken);

// Booking Endpoint
app.post('/book', (req, res) => {
    const { name, email, dob, date, time, guests } = req.body;

    // Send Email
    const mailOptions = {
        from: 'your-email@gmail.com', // Replace with your email
        to: 'info@levelsclubpokhara.com',
        subject: 'New Table Booking',
        text: `A new table booking has been made:
        Name: ${name}
        Email: ${email}
        Date of Birth: ${dob}
        Booking Date: ${date}
        Booking Time: ${time}
        Number of Guests: ${guests}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending email');
        }

        console.log('Email sent:', info.response);

        // Send SMS
        client.messages
            .create({
                body: `New Booking: ${name}, ${guests} guests on ${date} at ${time}.`,
                from: '+1234567890', // Replace with your Twilio phone number
                to: '+9826105262', // Replace with the recipient's phone number
            })
            .then((message) => {
                console.log('SMS sent:', message.sid);
                res.status(200).send('Booking confirmed and notifications sent');
            })
            .catch((err) => {
                console.error('Error sending SMS:', err);
                res.status(500).send('Error sending SMS');
            });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});