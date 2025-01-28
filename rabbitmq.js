const amqp = require('amqplib');

async function startAlertConsumer() {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
  await channel.assertQueue('weather-alerts');

  console.log('Waiting for alerts...');

  channel.consume('weather-alerts', async (message) => {
    if (message !== null) {
      const alert = JSON.parse(message.content.toString());
      console.log('Received alert:', alert);

      // Send SMS (reuse the existing POST /send-alert logic)
      const axios = require('axios');
      try {
        await axios.post('http://localhost:3002/send-alert', alert);
        channel.ack(message); // Acknowledge the message (remove it from the queue)
      } catch (error) {
        console.error('Failed to send alert:', error);
        channel.nack(message); // Re-queue the message for retry
      }
    }
  });
}

module.exports = { startAlertConsumer };