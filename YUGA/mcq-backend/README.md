# Yuga AI Backend

This is the backend server for the **Yuga AI** platform. It provides RESTful APIs for managing users, authentication, and various data-driven features related to NCERT-based education and AI tools.

## 🚀 Features

- User registration and login (JWT-based)
- Google OAuth integration
- Role-based access control (Admin, User)
- Course and lesson APIs (NCERT 10th-grade)
- Secure password reset with email
- Modular controller-service architecture
- MongoDB with Mongoose
- Error handling and input validation

## 📦 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Nodemailer** for email notifications
- **Google OAuth2**
- **dotenv** for environment configuration

## 📁 Project Structure

yuga-ai-backend/
├── controllers/
├── routes/
├── models/
├── middleware/
├── utils/
├── config/
├── .env
└── server.js

## ⚙️ Setup Instructions

1. **Clone the repo**:
   ```bash
   git clone https://github.com/Yuga-Ai-1125/yuga-ai-backend.git
   cd yuga-ai-backend
   ```

Install dependencies:
npm install

.env file
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

Strat the server
npm run dev

## Qwen3-TTS English Migration

English TTS now supports Qwen primary with automatic Google fallback, while non-English stays on Google TTS.

### Backend env vars

Add these to your backend environment:

```env
TTS_PROVIDER=qwen
TTS_GOOGLE_FALLBACK=true
QWEN_TTS_URL=http://127.0.0.1:8001
QWEN_TTS_MODEL=Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
QWEN_TTS_SPEAKER=Ryan
QWEN_TTS_INSTRUCT_ENGLISH=Speak like a warm Indian-English tutor: clear, medium pace, natural intonation, student-friendly emphasis, and concise pauses between concepts.
QWEN_TTS_TIMEOUT_MS=12000
```

### Start backend + Qwen service

Install Python dependencies once:

```bash
pip install -r services/qwen_tts_service/requirements.txt
```

Run in two terminals:

```bash
npm run dev
```

```bash
npm run dev:qwen-service
```

Or run both from one command:

```bash
npm run dev:with-qwen
```
