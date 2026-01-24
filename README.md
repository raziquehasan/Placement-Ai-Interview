# 🎯 Placement Buddy - AI Hiring Simulation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0055?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

> **A premium, enterprise-grade AI-powered hiring simulation platform** that conducts realistic multi-round interviews with cognitive analysis, real-time code execution, and high-conversion SaaS aesthetic.

---

---

## 🏆 Phase 2: Hiring Simulation System
Our latest update introduces the **Hiring Simulation GAUNTLET**—a full-cycle ecosystem that mirrors actual corporate hiring pipelines.

### 🏢 Realistic Company Blueprints
- **Targeted Simulations**: Pick a company (Google, Amazon, TCS) and experience their exact round structure (OA → Technical → Behavioral → Panel).
- **Tier-Based Calibration**: Difficulty and question patterns automatically adjust based on the company's market tier.

### 🎭 Multi-Persona AI Panel
- **Character AI Agents**: Interact with multiple AI personas simultaneously.
  - **Lead Engineer (@lead)**: Drills technical depth and optimization.
  - **Behavioral Judge (@behavioral)**: Evaluates culture fit and leadership principles.
  - **Silent Scorer (@scorer)**: Analyzes integrity and provides normalized feedback.
- **Interactive Chat**: A sophisticated, character-driven chat experience with real-time AI deliberation.

### 🧠 Post-Simulation Intelligence
- **Offer Probability Engine**: Calculates your hiring chance by normalizing scores across different rounds and penalizing integrity alerts.
- **AI Mentor Coach**: Receive a **4-week personalized study roadmap** and drill sets to bridge your specific skill gaps.
- **Recruiter Dashboard**: High-level analytics for admins to track funnel drop-offs, candidate rankings, and behavioral metrics.

---

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND (React + Framer Motion)             │
│  • Premium SaaS UI  • Glassmorphism  • Real-time SDKs       │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API + Firebase Auth
┌────────────────────▼────────────────────────────────────────┐
│                 BACKEND (Node.js/Express)                    │
│  • Firebase Admin  • AI Prompts Engine  • Security Middleware│
└────┬───────────┬────────────┬────────────┬─────────────────┘
     │           │            │            │
     ▼           ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐
│ MongoDB │ │  Redis  │ │ Gemini  │ │  Judge0  │
│   DB    │ │  Queue  │ │   AI    │ │   API    │
└─────────┘ └─────────┘ └─────────┘ └──────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB 6+
- Google Gemini API Key
- Firebase Project (for Auth)

### 2. Backend Setup
```bash
cd placement-buddy-backend
npm install
# Configure .env with MONGO_URI, GEMINI_API_KEY, and FIREBASE_SERVICE_ACCOUNT_PATH
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
# Configure .env with VITE_FIREBASE_* keys
npm run dev
```

---

## 🎨 Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Tailwind CSS, Framer Motion, Lucide Icons, Monaco Editor |
| **Backend** | Node.js, Express, Mongoose, Firebase Admin, BullMQ |
| **Database** | MongoDB, Redis (Jobs/Caching) |
| **AI/Services**| Google Gemini Pro, Judge0 (Code Execution) |
| **Styling** | Plus Jakarta Sans, Interactive Glassmorphism, Micro-animations |

---

## 🔐 Security & Privacy

- ✅ **Credential Isolation**: All keys moved to `.env` and `credentials/` (Git-ignored).
- ✅ **Sanitized Execution**: Code is run in a isolated RapidAPI/Judge0 sandbox.
- ✅ **Firebase Guard**: JWT verification on all protected backend routes.
- ✅ **CORS & Rate Limiting**: Hardened protection against automated attacks.

---

## 🤝 Contributing
Placement Buddy is an open-source project. If you'd like to contribute:
1. Fork the repo. 
2. Create your feature branch.
3. Commit your changes.
4. Open a Pull Request.

---

## 👥 Author
**Razique Hasan** — [GitHub](https://github.com/raziquehasan)

**⭐ Star this repo if you find it helpful!**
