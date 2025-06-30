const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Key middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or missing API key'
    });
  }
  
  next();
};

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API status endpoint (no auth required)
app.get('/api/status', (req, res) => {
  const twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
  const emailConfigured = !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
  const whatsappConfigured = !!(process.env.WHATSAPP_PHONE_NUMBER);
  
  res.json({
    success: true,
    services: {
      sms: twilioConfigured,
      email: emailConfigured,
      whatsapp: whatsappConfigured
    },
    timestamp: new Date().toISOString()
  });
});

// Protected API routes
app.use('/api/sms', authenticateApiKey, require('./routes/sms'));
app.use('/api/email', authenticateApiKey, require('./routes/email'));
app.use('/api/whatsapp', authenticateApiKey, require('./routes/whatsapp'));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🛡️  SafeGuard Backend running on port ${PORT}`);
  console.log(`📱 Twilio configured: ${!!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)}`);
  console.log(`📧 Email configured: ${!!(process.env.EMAIL_HOST && process.env.EMAIL_USER)}`);
  console.log(`💬 WhatsApp configured: ${!!(process.env.WHATSAPP_PHONE_NUMBER)}`);
  console.log(`🔑 API Key: ${process.env.API_KEY ? 'Set' : 'Missing'}`);
  console.log(`🚀 Ready to send messages!`);
});

module.exports = app;