# 🎯 Placement Buddy - AI Hiring Simulation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)

> **Enterprise-grade AI-powered hiring simulation platform** that conducts multi-round technical interviews with real code execution, behavioral analysis, and intelligent hiring decisions.

## 🌟 Features

### 🤖 AI-Powered Interview System
- **Multi-Round Pipeline**: Resume Screening → Technical → HR → Coding → Final Report
- **Real-time AI Evaluation**: Powered by Google Gemini & OpenAI GPT-4
- **Intelligent Question Generation**: Role-specific, difficulty-adaptive questions
- **STAR Method Analysis**: Behavioral interview evaluation
- **Personality Profiling**: Trait detection and cultural fit assessment

### 💻 Real Code Execution
- **Judge0 Integration**: Sandboxed code execution in 5 languages (JavaScript, Python, Java, C++, C)
- **Monaco Editor**: VS Code-powered code editor
- **Test Case Validation**: Automated testing with sample and hidden test cases
- **AI Code Review**: Comprehensive analysis of correctness, efficiency, readability, and edge cases
- **Complexity Analysis**: Time and space complexity evaluation

### 📊 Intelligent Hiring Decisions
- **Weighted Scoring**: Technical (40%) + HR (25%) + Coding (35%)
- **4-Tier Decisions**: Strong Hire, Hire, Consider, Reject
- **Probability Scoring**: Data-driven hiring confidence
- **Personalized Improvement Plans**: AI-generated learning roadmaps with 30/60/90 day phases

### 🔒 Enterprise Features
- **JWT Authentication**: Secure user sessions
- **Round Gating**: Strict sequential progression
- **Session Persistence**: Resume from any point
- **Background Processing**: BullMQ job queues
- **ATS Resume Analysis**: Automated resume scoring
- **PDF Reports**: Downloadable hiring reports

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  • Monaco Editor  • Real-time Polling  • State Management   │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                 BACKEND (Node.js/Express)                    │
│  • JWT Auth  • Interview Controller  • AI Services          │
└────┬───────────┬────────────┬────────────┬─────────────────┘
     │           │            │            │
     ▼           ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐
│ MongoDB │ │  Redis  │ │ Gemini  │ │  Judge0  │
│   DB    │ │  Queue  │ │   AI    │ │   API    │
└─────────┘ └─────────┘ └─────────┘ └──────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis (or Upstash Cloud Redis)
- Google Gemini API Key
- OpenAI API Key (optional, fallback)
- RapidAPI Key (for Judge0)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/raziquehasan/Placement-Ai-Interview.git
cd Placement-Ai-Interview
```

2. **Backend Setup**
```bash
cd placement-buddy-backend
npm install

# Create .env file
cp .env.example .env

# Add your API keys to .env:
# GEMINI_API_KEY=your_gemini_key
# OPENAI_API_KEY=your_openai_key
# RAPIDAPI_KEY=your_rapidapi_key
# MONGODB_URI=your_mongodb_uri
# REDIS_URL=your_redis_url
# JWT_SECRET=your_jwt_secret

# Start backend
npm run dev
```

3. **Frontend Setup**
```bash
cd ../client
npm install

# Start frontend
npm run dev
```

4. **Access the application**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 📁 Project Structure

```
Placement-Ai-Interview/
├── placement-buddy-backend/
│   ├── src/
│   │   ├── controllers/      # API endpoints
│   │   ├── models/           # MongoDB schemas
│   │   ├── services/         # Business logic
│   │   ├── prompts/          # AI prompts
│   │   ├── queues/           # BullMQ processors
│   │   ├── utils/            # Helper functions
│   │   ├── middleware/       # Auth, validation
│   │   └── routes/           # API routes
│   ├── uploads/              # Resume storage
│   └── server.js             # Entry point
│
└── client/
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/            # Page components
    │   ├── api/              # API wrapper
    │   ├── context/          # React context
    │   └── routes/           # React Router
    └── public/               # Static assets
```

## 🎯 Interview Flow

```
1. Resume Upload
   ↓ (ATS Score ≥ 60)
2. Technical Round (10 Questions)
   ↓ (AI Evaluation)
3. HR Round (8 Questions)
   ↓ (STAR Analysis + Personality Profiling)
4. Coding Round (1 Problem)
   ↓ (Judge0 Execution + AI Code Review)
5. Final Hiring Report
   ↓ (Weighted Score + Improvement Plan)
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/placementbuddy

# Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# AI Services
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

# Code Execution
RAPIDAPI_KEY=your_rapidapi_key

# Queue
REDIS_URL=redis://localhost:6379

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Interviews
- `POST /api/v1/interviews` - Create interview
- `GET /api/v1/interviews` - Get user interviews
- `GET /api/v1/interviews/:id` - Get interview details

### Technical Round
- `POST /api/v1/interviews/:id/technical/start` - Start technical round
- `POST /api/v1/interviews/:id/technical/answer` - Submit answer
- `GET /api/v1/interviews/:id/technical/evaluation/:questionId` - Get evaluation

### HR Round
- `POST /api/v1/interviews/:id/hr/start` - Start HR round
- `POST /api/v1/interviews/:id/hr/answer` - Submit answer
- `GET /api/v1/interviews/:id/hr/evaluation/:questionId` - Get evaluation

### Coding Round
- `POST /api/v1/interviews/:id/coding/start` - Start coding round
- `POST /api/v1/interviews/:id/coding/submit` - Submit code
- `GET /api/v1/interviews/:id/coding/results` - Get results

### Final Report
- `GET /api/v1/interviews/:id/report` - Generate hiring report

## 🧪 Testing

```bash
# Backend tests
cd placement-buddy-backend
npm test

# Frontend tests
cd client
npm test

# E2E tests
npm run test:e2e
```

## 🎨 Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Monaco Editor** - Code editor
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Redis** - Caching & queues
- **BullMQ** - Job processing
- **JWT** - Authentication
- **Multer** - File uploads

### AI & Services
- **Google Gemini** - Primary AI
- **OpenAI GPT-4** - Fallback AI
- **Judge0** - Code execution
- **PDF-Lib** - PDF generation

## 🔐 Security

- ✅ JWT authentication on all protected routes
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Sandboxed code execution
- ✅ Environment variable protection

## 📈 Performance

- ✅ Background job processing
- ✅ Redis caching
- ✅ Database indexing
- ✅ Async/await patterns
- ✅ Optimized AI prompts
- ✅ Lazy loading components

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Razique Hasan** - *Initial work* - [raziquehasan](https://github.com/raziquehasan)

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- OpenAI for GPT-4 integration
- Judge0 for code execution infrastructure
- Monaco Editor team for the amazing code editor

## 📞 Support

For support, email raziquehasan@example.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Video interview integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Interview scheduling
- [ ] Team collaboration features
- [ ] Mobile app
- [ ] Docker deployment
- [ ] CI/CD pipeline

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Technical Round
![Technical Round](docs/screenshots/technical-round.png)

### Coding Round
![Coding Round](docs/screenshots/coding-round.png)

### Hiring Report
![Hiring Report](docs/screenshots/hiring-report.png)

---

**Built with ❤️ by Razique Hasan**

**⭐ Star this repo if you find it helpful!**
