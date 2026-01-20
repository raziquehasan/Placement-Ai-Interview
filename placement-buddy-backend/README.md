# Placement Buddy Backend

🚀 **Production-grade AI Interview Simulator Backend**

A scalable, secure, and microservices-ready backend system built with Node.js, Express, MongoDB, and JWT authentication. Designed to handle 100k+ users with clean architecture principles.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Deployment](#deployment)

---

## ✨ Features

- ✅ **User Authentication** - JWT-based registration and login
- ✅ **User Profile Management** - Update profile with college, degree, year
- ✅ **Resume Upload & Parsing** - PDF parsing with skill/education/experience extraction
- ✅ **AI Interview Simulator** - Generate questions based on job role and difficulty
- ✅ **Answer Submission** - Submit and store interview responses
- ✅ **AI Feedback Generation** - Detailed feedback with scores and improvements
- ✅ **Interview History** - Track all past interviews
- ✅ **Role-based Access Control** - Student and Admin roles
- ✅ **Input Validation** - Comprehensive validation on all endpoints
- ✅ **Error Handling** - Centralized error handling middleware
- ✅ **Scalable Architecture** - Clean architecture with service layer

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication |
| **Bcrypt** | Password hashing |
| **Multer** | File upload handling |
| **PDF-Parse** | Resume parsing |
| **Express-Validator** | Input validation |

---

## 📁 Project Structure

```
placement-buddy-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── config.js            # Environment config
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Resume.js            # Resume schema
│   │   ├── Interview.js         # Interview schema
│   │   └── Feedback.js          # Feedback schema
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── userController.js    # User management
│   │   ├── resumeController.js  # Resume operations
│   │   ├── interviewController.js # Interview logic
│   │   └── feedbackController.js  # Feedback logic
│   ├── services/
│   │   ├── authService.js       # Auth business logic
│   │   ├── resumeService.js     # Resume parsing
│   │   ├── interviewService.js  # Question generation
│   │   └── feedbackService.js   # Feedback generation
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── userRoutes.js        # User endpoints
│   │   ├── resumeRoutes.js      # Resume endpoints
│   │   ├── interviewRoutes.js   # Interview endpoints
│   │   └── feedbackRoutes.js    # Feedback endpoints
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── errorMiddleware.js   # Error handling
│   │   └── validationMiddleware.js # Input validation
│   ├── utils/
│   │   ├── jwtUtils.js          # JWT helpers
│   │   ├── responseUtils.js     # Response formatter
│   │   └── validators.js        # Validation schemas
│   └── app.js                   # Express app
├── server.js                    # Entry point
├── .env.example                 # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- Node.js >= 16.0.0
- MongoDB (local or Atlas)
- npm >= 8.0.0

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd placement-buddy-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB** (if running locally)
```bash
mongod
```

5. **Run the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

---

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/placement-buddy
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/placement-buddy

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# AI Services (Optional - for future integration)
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

### 🔐 Auth Endpoints

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

---

### 👤 User Endpoints

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "profile": {
        "phone": "1234567890",
        "college": "MIT",
        "degree": "B.Tech",
        "year": 3
      }
    }
  }
}
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "profile": {
    "phone": "1234567890",
    "college": "MIT",
    "degree": "B.Tech Computer Science",
    "year": 3
  }
}
```

---

### 📄 Resume Endpoints

#### Upload Resume
```http
POST /api/resumes/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `resume`: PDF file (max 10MB)

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded and parsed successfully",
  "data": {
    "resume": {
      "_id": "...",
      "userId": "...",
      "fileName": "resume.pdf",
      "fileUrl": "uploads/resumes/resume-123456.pdf",
      "parsedData": {
        "skills": ["JavaScript", "Python", "React", "Node.js"],
        "education": [...],
        "experience": [...]
      },
      "uploadedAt": "2024-01-20T10:00:00.000Z"
    }
  }
}
```

#### Get Resume by ID
```http
GET /api/resumes/:id
Authorization: Bearer <token>
```

#### Get All User Resumes
```http
GET /api/resumes/user/me
Authorization: Bearer <token>
```

---

### 🎤 Interview Endpoints

#### Start Interview
```http
POST /api/interviews/start
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "resumeId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "jobRole": "Software Engineer",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview started successfully",
  "data": {
    "interview": {
      "_id": "...",
      "userId": "...",
      "resumeId": "...",
      "jobRole": "Software Engineer",
      "difficulty": "medium",
      "questions": [
        {
          "questionId": "q1",
          "question": "Describe a challenging project...",
          "category": "behavioral"
        }
      ],
      "status": "in-progress",
      "startedAt": "2024-01-20T10:00:00.000Z"
    }
  }
}
```

#### Submit Answers
```http
POST /api/interviews/:id/submit
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "answer": "I worked on a real-time chat application..."
    },
    {
      "questionId": "q2",
      "answer": "I prioritize tasks and break them into smaller chunks..."
    }
  ]
}
```

#### Get Interview by ID
```http
GET /api/interviews/:id
Authorization: Bearer <token>
```

#### Get Interview History
```http
GET /api/interviews/user/me
Authorization: Bearer <token>
```

---

### 📊 Feedback Endpoints

#### Generate Feedback
```http
POST /api/feedback/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "interviewId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback generated successfully",
  "data": {
    "feedback": {
      "_id": "...",
      "userId": "...",
      "interviewId": "...",
      "overallScore": 75,
      "strengths": [
        "Completed all interview questions",
        "Provided detailed answers"
      ],
      "improvements": [
        "Focus on improving technical depth"
      ],
      "detailedFeedback": {
        "technical": {
          "score": 70,
          "comments": "Good technical knowledge..."
        },
        "communication": {
          "score": 80,
          "comments": "Clear communication..."
        },
        "problemSolving": {
          "score": 75,
          "comments": "Solid problem-solving approach..."
        },
        "confidence": {
          "score": 75,
          "comments": "Confident responses..."
        }
      },
      "generatedAt": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

#### Get Feedback by Interview ID
```http
GET /api/feedback/:interviewId
Authorization: Bearer <token>
```

---

## 🗄 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (student/admin),
  profile: {
    phone: String,
    college: String,
    degree: String,
    year: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Resumes Collection
```javascript
{
  userId: ObjectId (indexed),
  fileName: String,
  fileUrl: String,
  parsedData: {
    skills: [String],
    education: [Object],
    experience: [Object]
  },
  uploadedAt: Date
}
```

### Interviews Collection
```javascript
{
  userId: ObjectId (indexed),
  resumeId: ObjectId,
  jobRole: String,
  difficulty: String,
  questions: [Object],
  answers: [Object],
  status: String (indexed),
  startedAt: Date (indexed),
  completedAt: Date
}
```

### Feedback Collection
```javascript
{
  userId: ObjectId (indexed),
  interviewId: ObjectId (unique, indexed),
  overallScore: Number,
  strengths: [String],
  improvements: [String],
  detailedFeedback: Object,
  generatedAt: Date (indexed)
}
```

---

## 🔒 Security

### Implemented Security Features

✅ **JWT Authentication** - Secure token-based authentication  
✅ **Password Hashing** - Bcrypt with salt rounds  
✅ **Input Validation** - Express-validator on all endpoints  
✅ **Role-based Access Control** - Student and Admin roles  
✅ **CORS Protection** - Configured allowed origins  
✅ **File Upload Limits** - 10MB max file size  
✅ **Error Handling** - No sensitive data in error responses  
✅ **Environment Variables** - Secrets stored in .env  

### Recommended Enhancements for Production

- [ ] Rate limiting (express-rate-limit)
- [ ] Helmet.js for HTTP security headers
- [ ] Refresh token flow
- [ ] IP-based login alerts
- [ ] Cloud storage for resumes (AWS S3/Cloudinary)
- [ ] API request logging
- [ ] Database encryption at rest

---

## 🚢 Deployment

### Deploy to Heroku

1. Create Heroku app
```bash
heroku create placement-buddy-backend
```

2. Set environment variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=<your-mongodb-atlas-uri>
heroku config:set JWT_SECRET=<your-secret>
```

3. Deploy
```bash
git push heroku main
```

### Deploy to AWS/DigitalOcean

1. Set up Node.js environment
2. Install dependencies: `npm install --production`
3. Set environment variables
4. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name placement-buddy
pm2 save
pm2 startup
```

### Deploy to Vercel/Netlify

- Not recommended for this backend (requires serverless adaptation)
- Use Heroku, AWS, or DigitalOcean instead

---

## 🧪 Testing

### Manual Testing with Postman/Thunder Client

1. Import the API collection
2. Set environment variable: `BASE_URL=http://localhost:5000/api`
3. Test authentication flow:
   - Register user
   - Login user
   - Copy token
4. Test protected routes with token

### Sample Test Flow

1. **Register** → Get token
2. **Upload Resume** → Get resumeId
3. **Start Interview** → Get interviewId
4. **Submit Answers** → Complete interview
5. **Generate Feedback** → Get feedback report

---

## 🔮 Future Enhancements

### AI Integration (High Priority)

- [ ] Integrate OpenAI API for question generation
- [ ] Integrate Gemini API for feedback generation
- [ ] Add voice interview capability
- [ ] Real-time interview scoring

### Features

- [ ] Email verification
- [ ] Password reset flow
- [ ] Admin dashboard
- [ ] Interview scheduling
- [ ] Video interview recording
- [ ] Mock interview with peers
- [ ] Company-specific interview prep

### Infrastructure

- [ ] Redis caching
- [ ] WebSocket for real-time features
- [ ] Microservices architecture split
- [ ] GraphQL API
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

## 📝 License

MIT License - feel free to use this project for learning and portfolio purposes.

---

## 👨‍💻 Author

**Placement Buddy Team**

Built with ❤️ for college students preparing for placements.

---

## 🙏 Acknowledgments

- Clean Architecture principles
- Node.js best practices
- MongoDB indexing strategies
- JWT authentication patterns

---

**⭐ Star this repo if you find it helpful!**
