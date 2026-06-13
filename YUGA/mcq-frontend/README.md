# YUGA AI - Educational Platform

YUGA AI is a modern educational platform designed to enhance student learning experiences using AI-powered tools and an intuitive user interface.

## 🚀 Tech Stack

- **Frontend:** React 18, React Router DOM
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Linting & Formatting:** ESLint, TypeScript

## 📁 Project Structure (Common Assumption)

yuga-ai-educational-platform/
├── public/
├── src/
│ ├── assets/
│ ├── components/
│ ├── pages/
│ ├── routes/
│ ├── App.jsx
│ └── main.jsx
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
└── README.md

bash
Copy
Edit


## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/yuga-ai-educational-platform.git
   cd yuga-ai-educational-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   - `VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID`: Your GA4 Measurement ID
   - `VITE_API_BASE_URL`: Backend API URL

4. **Configure Google Analytics:**
   - Get your GA4 Measurement ID from [Google Analytics](https://analytics.google.com/)
   - Update the Measurement ID in both `.env` and `index.html`
   - See `ANALYTICS_SETUP.md` for detailed instructions

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## ✅ Features

- 🧑‍🏫 **AI-powered teaching assistant** - Interactive AI tutors with avatars
- 🧭 **Career guide and course navigator** - Subject-based career recommendations
- 📘 **Course modules and lessons** - Comprehensive learning materials
- 🎓 **Assessment and certificate options** - Earn certificates by completing assessments
- 📱 **Responsive and mobile-friendly design** - Works seamlessly on all devices
- 📊 **Google Analytics 4 Integration** - Comprehensive user behavior tracking
- 🔐 **User Authentication** - Secure login/signup with email
- 💬 **AI Chat Interface** - Real-time doubt solving with AI
- 📝 **Notes Management** - Create and organize study notes
- 🎬 **Media Library** - Videos and images for learning
- 🔄 **Spaced Repetition** - Scientific revision system

## 📌 To-Do / Future Enhancements

- [ ] Integrate advanced AI chat support (OpenAI / custom bot)
- [ ] Enable student progress analytics dashboard
- [ ] Add multi-language support
- [ ] Enhance onboarding experience
- [ ] Add social sharing features
- [ ] Implement real-time collaboration
- [ ] Advanced video player with annotations

## 📊 Analytics

This project includes comprehensive Google Analytics 4 (GA4) integration for tracking user behavior, engagement, and performance. 

### Tracked Events
- User authentication (login, signup, logout)
- Course interactions (view, start, complete)
- Assessment performance
- AI feature usage (chat, doubt solver)
- Search queries
- Media interactions (videos, images)
- Navigation patterns

For detailed analytics setup and configuration, see [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md).

🧑‍💻 Developer Notes
Make sure you have the following installed:

Node.js v18+

npm v9+