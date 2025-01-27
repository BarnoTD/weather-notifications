require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const app = express();
const PORT = 3001;

// Middleware to parse JSON request bodies
app.use(express.json());

// Twilio credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const client = twilio(accountSid, authToken);

// Endpoint to send SMS notifications
app.post('/notify', async (req, res) => {
    const { message, phoneNumber } = req.body;
    if (!message || !phoneNumber) {
        return res.status(400).json({ error: 'Message and phoneNumber are required' });
    }

    try {
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE, 
            to: phoneNumber,
        });
        res.json({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Notification Service running on http://localhost:${PORT}`);
});