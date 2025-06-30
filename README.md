# 🛡️ Niva - Your Safety Companion

A beautiful, caring safety companion app that keeps you connected with your trusted circle through intelligent location sharing and gentle check-ins.

## ✨ Features

- **🤝 Companion Mode** - Start a caring session that watches over you
- **👥 Trusted Circle** - Add the people who care about you most
- **📍 Smart Location Sharing** - Automatic location updates with Google Maps integration
- **🗺️ Route Planning** - Save your regular journeys for quick companion sessions
- **🔔 Gentle Check-ins** - Caring reminders that respect your space
- **🚨 Emergency Alerts** - Immediate notifications when you need help
- **🎨 Beautiful Design** - Thoughtful, warm interface with dark mode support
- **📱 Mobile-First** - Optimized for your phone with responsive design

## 🚀 Quick Start

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd niva-safety-companion
   npm install
   ```

2. **Start the App**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**: Visit `http://localhost:5173`

4. **Add Your Circle**: Go to the Circle tab and add trusted contacts

5. **Test Features**: Use the Test tab to see how location sharing works

## 🎯 Current Mode: Frontend-Only Simulation

Niva currently runs in **frontend-only simulation mode**, which means:

- ✅ **No backend required** - Just run `npm run dev`
- ✅ **All features work** - Through detailed console logging
- ✅ **Perfect for demos** - Show functionality without external services
- ✅ **Development-ready** - See exactly how messages would be formatted

### 🔍 How to See Simulations

1. **Open Developer Console**: Press `F12` in your browser
2. **Go to Console tab**: Click on "Console"
3. **Test features**: Use the Test tab to trigger simulations
4. **Watch the logs**: See detailed message formatting and delivery simulation

## 📱 How to Use

### 1. **Add Your Trusted Circle**
- Go to the **Circle** tab
- Add people who care about you
- Include their phone numbers and email addresses

### 2. **Start a Companion Session**
- Tap **"Start your journey"** on the home screen
- Choose a regular session or select a saved route
- Niva will begin watching over you

### 3. **Create Custom Sessions**
- Use **"Custom sessions"** for personalized experiences
- Set your preferred check-in frequency
- Choose specific contacts for different situations

### 4. **Save Your Routes**
- Go to **Routes** tab to save regular journeys
- Add multiple stops along your route
- Use for quick companion sessions

### 5. **Test Everything**
- Use the **Test** tab to see how messages work
- Check console logs for detailed simulations
- Perfect for understanding the system

## 🛠️ Technical Details

### Built With
- **React 18** with TypeScript
- **Tailwind CSS** for beautiful styling
- **Lucide React** for icons
- **Google Maps API** for location services
- **Vite** for fast development

### Key Components
- **Location Context** - Manages GPS tracking and location sharing
- **Session Context** - Handles companion session state
- **Theme Context** - Dark/light mode support
- **Message Simulation** - Detailed console logging for all communications

### File Structure
```
src/
├── components/          # React components
├── contexts/           # React contexts for state management
├── utils/              # Utility functions and location sharing
├── App.tsx             # Main application component
└── main.tsx           # Application entry point
```

## 🔧 Adding Real Backend (Optional)

When you're ready to add real messaging capabilities:

1. **Choose Services**:
   - **SMS**: Twilio
   - **Email**: SendGrid
   - **WhatsApp**: WhatsApp Business API

2. **Create Backend**:
   - Express.js server with API endpoints
   - Environment variables for service credentials
   - Rate limiting and security middleware

3. **Update Frontend**:
   - Replace simulation functions in `src/utils/locationSharing.ts`
   - Add API calls to your backend endpoints
   - Handle real responses and errors

## 🎨 Design Philosophy

Niva is designed with care and empathy:

- **Warm Colors** - Orange and rose gradients create a caring atmosphere
- **Gentle Language** - Every message is written with kindness
- **Thoughtful Interactions** - Smooth animations and micro-interactions
- **Accessible** - High contrast, clear typography, keyboard navigation
- **Mobile-First** - Optimized for the device you carry with you

## 🌙 Dark Mode

Niva includes beautiful dark mode support:
- Automatic system preference detection
- Manual toggle in Settings
- Smooth transitions between themes
- Optimized for low-light usage

## 📍 Location Features

- **High-Accuracy GPS** - Uses device's best location services
- **Google Maps Integration** - Shareable links and route planning
- **Privacy-Focused** - Location only shared when you choose
- **Battery-Aware** - Efficient location tracking

## 🔒 Privacy & Security

- **Local Storage** - All data stays on your device
- **No Tracking** - No analytics or user tracking
- **Consent-Based** - You control all sharing
- **Transparent** - Open source and auditable

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 💝 Support

If you need help or have questions:
- Check the console logs for detailed information
- Review the Test tab for feature demonstrations
- Open an issue on GitHub

---

**Niva** - Because everyone deserves to feel safe and cared for. 🛡️✨