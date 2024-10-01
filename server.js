const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Detailed CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // This should be your frontend URL
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/send-email', async (req, res) => {
  console.log('Received form data:', req.body);

  try {
    const { firstName, surname, email, phone, subject, message } = req.body;

    if (!firstName || !surname || !email || !phone || !subject || !message) {
      throw new Error('Missing required fields');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL, // Use the recipient email from .env
      subject: `New Contact Form Submission: ${subject}`,
      text: `
        Name: ${firstName} ${surname}
        Email: ${email}
        Phone: ${phone}
        Subject: ${subject}
        Message: ${message}
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: 'Error sending email', details: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

const PORT = process.env.PORT || 3002; // Change this to 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Log any unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});