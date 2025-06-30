const express = require('express');
const router = express.Router();

// Initialize Twilio client for WhatsApp
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.error('Failed to initialize Twilio client for WhatsApp:', error.message);
}

// Send single WhatsApp message
router.post('/send', async (req, res) => {
  try {
    const { to, message, type = 'regular' } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }

    if (!twilioClient) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp service not configured. Please check Twilio credentials.'
      });
    }

    if (!process.env.WHATSAPP_PHONE_NUMBER) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp phone number not configured.'
      });
    }

    // Format phone number for WhatsApp
    const formattedPhone = to.startsWith('whatsapp:') ? to : `whatsapp:${to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`}`;

    // Add emergency prefix for emergency messages
    let finalMessage = message;
    if (type === 'emergency') {
      finalMessage = `🚨 *EMERGENCY ALERT* 🚨\n\n${message}\n\n_This is an automated emergency message from SafeGuard._`;
    }

    const result = await twilioClient.messages.create({
      body: finalMessage,
      from: process.env.WHATSAPP_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`WhatsApp message sent successfully to ${formattedPhone}. SID: ${result.sid}`);

    res.json({
      success: true,
      messageId: result.sid,
      to: formattedPhone,
      status: result.status
    });

  } catch (error) {
    console.error('WhatsApp sending error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send WhatsApp message'
    });
  }
});

// Send bulk WhatsApp messages
router.post('/send-bulk', async (req, res) => {
  try {
    const { contacts, message, type = 'regular' } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contacts array is required'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (!twilioClient) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp service not configured. Please check Twilio credentials.'
      });
    }

    if (!process.env.WHATSAPP_PHONE_NUMBER) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp phone number not configured.'
      });
    }

    const results = [];
    const errors = [];

    // Add emergency prefix for emergency messages
    let finalMessage = message;
    if (type === 'emergency') {
      finalMessage = `🚨 *EMERGENCY ALERT* 🚨\n\n${message}\n\n_This is an automated emergency message from SafeGuard._`;
    }

    for (const contact of contacts) {
      try {
        if (!contact.phone) {
          errors.push({
            contact: contact.name,
            error: 'No phone number provided',
            success: false
          });
          continue;
        }

        const formattedPhone = contact.phone.startsWith('whatsapp:') ? contact.phone : `whatsapp:${contact.phone.startsWith('+') ? contact.phone : `+1${contact.phone.replace(/\D/g, '')}`}`;
        
        const result = await twilioClient.messages.create({
          body: finalMessage,
          from: process.env.WHATSAPP_PHONE_NUMBER,
          to: formattedPhone
        });

        results.push({
          contact: contact.name,
          phone: formattedPhone,
          messageId: result.sid,
          status: result.status,
          success: true
        });

        console.log(`WhatsApp message sent to ${contact.name} (${formattedPhone}). SID: ${result.sid}`);

        // Add delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Failed to send WhatsApp message to ${contact.name}:`, error);
        errors.push({
          contact: contact.name,
          phone: contact.phone,
          error: error.message,
          success: false
        });
      }
    }

    res.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results: results,
      errors: errors
    });

  } catch (error) {
    console.error('Bulk WhatsApp error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send bulk WhatsApp messages'
    });
  }
});

// Get WhatsApp message status
router.get('/status/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!twilioClient) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp service not configured'
      });
    }

    const message = await twilioClient.messages(messageId).fetch();

    res.json({
      success: true,
      messageId: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    });

  } catch (error) {
    console.error('WhatsApp status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check WhatsApp message status'
    });
  }
});

module.exports = router;