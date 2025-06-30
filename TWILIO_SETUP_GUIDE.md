# 🛡️ SafeGuard Twilio SMS Setup Guide

## 📋 Complete Step-by-Step Setup

### 1. Create Twilio Account

1. **Go to Twilio**: Visit [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. **Sign Up**: Create a free account (you get $15 in free credits!)
3. **Verify Your Phone**: Twilio will send you a verification code
4. **Complete Setup**: Answer a few questions about your use case

### 2. Get Your Twilio Credentials

Once logged in to your Twilio Console:

1. **Find Your Account SID**:
   - Go to your [Twilio Console Dashboard](https://console.twilio.com/)
   - Copy your **Account SID** (starts with "AC...")

2. **Get Your Auth Token**:
   - On the same dashboard, click "Show" next to **Auth Token**
   - Copy the **Auth Token**

3. **Get a Phone Number**:
   - Go to **Phone Numbers** → **Manage** → **Buy a number**
   - Choose a number (free with trial account)
   - Copy your **Twilio Phone Number** (format: +1234567890)

### 3. Configure Your Backend

1. **Create Environment File**:
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Add Your Twilio Credentials** to `server/.env`:
   ```env
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   
   # Security
   API_KEY=your_secure_random_key_here
   
   # Server
   PORT=3001
   NODE_ENV=development
   ```

3. **Generate a Secure API Key**:
   ```bash
   # Use this command to generate a random API key
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### 4. Install and Start Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm run dev
```

You should see:
```
🛡️  SafeGuard Backend running on port 3001
📱 Twilio configured: true
📧 SendGrid configured: false
💬 WhatsApp configured: false
```

### 5. Update Frontend to Use Real Backend

Update your frontend's location sharing utility to call the real backend:

```javascript
// In src/utils/locationSharing.ts, replace the simulated calls with:

export const shareLocationViaSMS = async (contacts, location, userName, sessionData) => {
  const message = formatLocationMessage(location, userName, sessionData);
  
  for (const contact of contacts) {
    try {
      const response = await fetch('http://localhost:3001/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'your_api_key_here' // Use the same key from .env
        },
        body: JSON.stringify({
          to: contact.phone,
          message: message,
          priority: 'normal'
        })
      });
      
      if (!response.ok) {
        throw new Error(`SMS API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`✅ SMS sent to ${contact.name}:`, result);
      
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${contact.name}:`, error);
      throw error;
    }
  }
};
```

### 6. Test Your Setup

1. **Add a Contact** in SafeGuard with your own phone number
2. **Start a Companion Session**
3. **Check the Test Tab** to send a test message
4. **You should receive an SMS** with your location!

### 7. Twilio Trial Account Limitations

**Free Trial Restrictions**:
- ✅ $15 in free credits (enough for ~500 SMS messages)
- ⚠️ Can only send to **verified phone numbers**
- ⚠️ Messages include "Sent from your Twilio trial account"

**To Verify Additional Numbers**:
1. Go to **Phone Numbers** → **Manage** → **Verified Caller IDs**
2. Click **Add a new number**
3. Enter the phone number and verify with the code

### 8. Production Upgrade

When ready for production:

1. **Upgrade Your Account**:
   - Add billing information to remove trial restrictions
   - Remove the trial message prefix

2. **Add More Features**:
   - **Delivery Receipts**: Track message delivery status
   - **Two-Way SMS**: Handle replies from contacts
   - **Short Codes**: Use branded short codes instead of long numbers

### 9. Optional: Add SendGrid for Email

1. **Create SendGrid Account**: [https://sendgrid.com/](https://sendgrid.com/)
2. **Get API Key**: Go to Settings → API Keys → Create API Key
3. **Add to .env**:
   ```env
   SENDGRID_API_KEY=SG.your_api_key_here
   FROM_EMAIL=noreply@yourdomain.com
   ```

### 10. Optional: Add WhatsApp Business

1. **Apply for WhatsApp Business API**: [https://business.whatsapp.com/](https://business.whatsapp.com/)
2. **Get Access Token** and **Phone Number ID**
3. **Add to .env**:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_access_token
   ```

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid phone number"**:
   - Ensure phone numbers include country code (+1 for US)
   - Verify the number in Twilio Console for trial accounts

2. **"Authentication failed"**:
   - Double-check your Account SID and Auth Token
   - Make sure there are no extra spaces in .env file

3. **"Forbidden"**:
   - Verify your API key matches between frontend and backend
   - Check that your Twilio account has sufficient credits

4. **CORS errors**:
   - Make sure your backend is running on port 3001
   - Check that CORS is configured for your frontend URL

### Testing Commands:

```bash
# Test if backend is running
curl http://localhost:3001/health

# Test SMS endpoint (replace with your values)
curl -X POST http://localhost:3001/api/send-sms \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "to": "+1234567890",
    "message": "Test message from SafeGuard!",
    "priority": "normal"
  }'
```

## 🎉 Success!

Once everything is set up, your SafeGuard app will:
- ✅ Send real SMS messages to trusted contacts
- ✅ Share location with Google Maps links
- ✅ Handle emergency alerts
- ✅ Provide delivery confirmations
- ✅ Work reliably in production

Your contacts will receive professional, helpful messages that keep them informed about your safety! 🛡️💝