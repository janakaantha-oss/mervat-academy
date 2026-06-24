const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendWhatsApp(toNumber, message) {
  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: toNumber,
      body: message
    });
    console.log(`✅ WhatsApp sent to ${toNumber}`);
  } catch (err) {
    console.log('❌ WhatsApp error:', err.message);
  }
}

module.exports = { sendWhatsApp };