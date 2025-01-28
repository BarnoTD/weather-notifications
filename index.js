const express = require('express');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

const { startAlertConsumer } = require('./rabbitmq');
startAlertConsumer();

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Middleware to parse JSON
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Notification Service is running!');
});

app.post('/send-alert', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Missing "to" or "message" in request body' });
    }

    // Send SMS
    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    res.json({ 
      success: true, 
      sid: sms.sid,
      message: 'Alert sent successfully'
    });
  } catch (error) {
    console.error('Twilio Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send alert' 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Notification service listening on port ${port}`);
});