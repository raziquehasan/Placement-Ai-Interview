# Placement Buddy - AI Interview Engine 🚀

Placement Buddy is a full-stack, AI-powered interview preparation platform designed to help students and job seekers ace their dream jobs. The platform provides a realistic interview experience with real-time feedback, behavioral analysis, and technical evaluation.

![Project Banner](https://img.shields.io/badge/Placement-Buddy-blue?style=for-the-badge&logo=rocket)
![Tech Stack](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge&logo=mongodb)
![AI Engine](https://img.shields.io/badge/AI-Google_Gemini-orange?style=for-the-badge&logo=google)

## 🎥 Features

### 1. Resume Analysis & ATS Scoring 📄
- Upload your resume (PDF/DOCX) for a deep dive analysis.
- Get an instant **ATS Score** and detailed feedback on improvements.
- AI-driven suggestions for keywords, formatting, and content.

### 2. Technical Interview Round (Phase 2.1) 💻
- Real-time technical interview with an **AI Persona** (Senior Software Engineer).
- Dynamic question generation based on your resume and job role.
- Real-time evaluation of answers with feedback on core CS, DSA, and System Design.
- Interactive **Timer** and **Progress Tracker**.

### 3. HR Behavioral Round (Phase 2.2) 🤝
- **Behavioral Interviews** focusing on the **STAR Method** (Situation, Task, Action, Result).
- **Personality Profiling** and cultural fit analysis.
- Real-time soft-skills evaluation (Communication, Leadership, Problem Solving).
- Conversational AI persona providing an empathetic yet professional experience.

### 4. Advanced Results Dashboard 📊
- Multi-round performance overview.
- Detailed breakdown of technical knowledge pillars.
- Personality trait visualization and "Soft Skill Pulse".
- Actionable recommendations for improvement.

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Context API
- **Networking**: Axios

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (Mongoose)
- **Background Jobs**: BullMQ + Redis (Upstash)
- **AI Integration**: Google Gemini AI (OpenAI Fallback)
- **Logging**: Winston & Morgan
- **Documentation**: Swagger/OpenAPI

## 📁 Project Structure

```
Placement/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # UI Components
│   │   ├── pages/                   # Application Pages
│   │   ├── services/                # API Services
│   │   └── context/                 # State Management
├── placement-buddy-backend/         # Node.js Backend API
│   ├── src/
│   │   ├── models/                  # Database Schemas
│   │   ├── controllers/             # Business Logic
│   │   ├── services/                # AI & External Integrations
│   │   └── queues/                  # Background Worker
└── README.md                        # Project Overview
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB
- Redis (Upstash recommended)
- Google Gemini API Key or OpenAI API Key

### Backend Setup
1. `cd placement-buddy-backend`
2. `npm install`
3. `cp .env.example .env` (Add your API keys)
4. `npm start`

### Frontend Setup
1. `cd client`
2. `npm install`
3. `npm run dev`

## 👨‍💻 Roadmap
- [x] Phase 1: Core Authentication & Resume Analysis
- [x] Phase 2.1: Technical Round AI
- [x] Phase 2.2: HR Round Behavioral Analysis
- [ ] Phase 2.3: Live Coding Round (Coming Soon)
- [ ] Phase 2.4: Hiring Decision Intelligence & PDF Reports

## 📝 License
MIT License. Created by the Placement Buddy Team.
