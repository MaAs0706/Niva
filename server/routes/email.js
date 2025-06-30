const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Initialize email transporter
let emailTransporter = null;
try {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    emailTransporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
} catch (error) {
  console.error('Failed to initialize email transporter:', error.message);
}

// Send single email
router.post('/send', async (req, res) => {
  try {
    const { to, subject, message, type = 'regular' } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Email address, subject, and message are required'
      });
    }

    if (!emailTransporter) {
      return res.status(503).json({
        success: false,
        error: 'Email service not configured. Please check email credentials.'
      });
    }

    // Add emergency styling for emergency emails
    let finalSubject = subject;
    let htmlMessage = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">`;
    
    if (type === 'emergency') {
      finalSubject = `🚨 EMERGENCY ALERT - ${subject}`;
      htmlMessage += `
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚨 EMERGENCY ALERT 🚨</h1>
        </div>
        <div style="background-color: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="color: #1f2937; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #dc2626;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This is an automated emergency message from SafeGuard.
          </p>
        </div>
      `;
    } else {
      htmlMessage += `
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🛡️ SafeGuard</h1>
        </div>
        <div style="background-color: #f8fafc; border: 2px solid #3b82f6; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="color: #1f2937; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
    }
    
    htmlMessage += `</div>`;

    const mailOptions = {
      from: `"SafeGuard" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: finalSubject,
      text: message,
      html: htmlMessage
    };

    const result = await emailTransporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${to}. Message ID: ${result.messageId}`);

    res.json({
      success: true,
      messageId: result.messageId,
      to: to,
      subject: finalSubject
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email'
    });
  }
});

// Send bulk email
router.post('/send-bulk', async (req, res) => {
  try {
    const { contacts, subject, message, type = 'regular' } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contacts array is required'
      });
    }

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Subject and message are required'
      });
    }

    if (!emailTransporter) {
      return res.status(503).json({
        success: false,
        error: 'Email service not configured. Please check email credentials.'
      });
    }

    const results = [];
    const errors = [];

    for (const contact of contacts) {
      try {
        if (!contact.email) {
          errors.push({
            contact: contact.name,
            error: 'No email address provided',
            success: false
          });
          continue;
        }

        // Add emergency styling for emergency emails
        let finalSubject = subject;
        let htmlMessage = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">`;
        
        if (type === 'emergency') {
          finalSubject = `🚨 EMERGENCY ALERT - ${subject}`;
          htmlMessage += `
            <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🚨 EMERGENCY ALERT 🚨</h1>
            </div>
            <div style="background-color: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 0 0 8px 8px;">
              <p style="color: #1f2937; margin: 0 0 10px 0;">Dear ${contact.name},</p>
              <div style="color: #1f2937; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #dc2626;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This is an automated emergency message from SafeGuard.
              </p>
            </div>
          `;
        } else {
          htmlMessage += `
            <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🛡️ SafeGuard</h1>
            </div>
            <div style="background-color: #f8fafc; border: 2px solid #3b82f6; padding: 20px; border-radius: 0 0 8px 8px;">
              <p style="color: #1f2937; margin: 0 0 10px 0;">Dear ${contact.name},</p>
              <div style="color: #1f2937; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
          `;
        }
        
        htmlMessage += `</div>`;

        const mailOptions = {
          from: `"SafeGuard" <${process.env.EMAIL_USER}>`,
          to: contact.email,
          subject: finalSubject,
          text: `Dear ${contact.name},\n\n${message}`,
          html: htmlMessage
        };

        const result = await emailTransporter.sendMail(mailOptions);

        results.push({
          contact: contact.name,
          email: contact.email,
          messageId: result.messageId,
          success: true
        });

        console.log(`Email sent to ${contact.name} (${contact.email}). Message ID: ${result.messageId}`);

        // Add delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to send email to ${contact.name}:`, error);
        errors.push({
          contact: contact.name,
          email: contact.email,
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
    console.error('Bulk email error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send bulk email'
    });
  }
});

module.exports = router;