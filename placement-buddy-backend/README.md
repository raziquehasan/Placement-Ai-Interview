# Placement Buddy - AI Interview Platform Backend

An intelligent AI-powered interview preparation platform with multi-round interviews (Technical, HR, Coding) featuring advanced quota management and caching systems.

## 🚀 Features

### Core Features
- **Resume Analysis**: ATS scoring with AI-powered feedback
- **Multi-Round Interviews**: Technical, HR, and Coding rounds
- **Real-time AI Evaluation**: Instant feedback on answers
- **Smart Question Generation**: Context-aware questions based on resume
- **Background Job Processing**: BullMQ for async AI operations

### Advanced Features ✨
- **AI Quota Management**: Rate limiting to prevent API exhaustion
- **Request Caching**: 40-60% reduction in API calls via Redis
- **Diverse Fallback Questions**: 15+ unique questions per category
- **Graceful Degradation**: Continues working even when APIs fail
- **Monitoring Dashboard**: Track API usage and cache performance

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Cache/Queue**: Redis + BullMQ
- **AI Providers**: Google Gemini 2.0 Flash, OpenAI GPT-4o-mini
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Code Execution**: Judge0 API

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance
- Redis instance
- Gemini API key
- OpenAI API key (optional fallback)

### Setup

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
Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/placementbuddy

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# AI APIs
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Rate Limiting (requests per minute)
GEMINI_RATE_LIMIT=15
OPENAI_RATE_LIMIT=3

# Caching (TTL in seconds)
AI_CACHE_TTL_QUESTIONS=86400
AI_CACHE_TTL_EVALUATIONS=3600

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Code Execution
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-judge0-api-key
```

4. **Start the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 🏗️ Architecture

### AI Quota Management System

The platform implements a sophisticated quota management system to handle API rate limits gracefully:

#### 1. **Rate Limiting**
- Token bucket algorithm with Redis
- Gemini: 15 requests/minute
- OpenAI: 3 requests/minute
- Prevents quota exhaustion

#### 2. **Request Caching**
- Redis-based caching for AI responses
- Question cache: 24-hour TTL
- Evaluation cache: 1-hour TTL
- 40-60% reduction in API calls

#### 3. **Fallback System**
- **Primary**: Google Gemini 2.0 Flash (fast & cheap)
- **Secondary**: OpenAI GPT-4o-mini
- **Tertiary**: Diverse fallback question library (15+ questions per category)

#### 4. **Graceful Degradation**
When both APIs fail:
- Returns "pending" evaluations instead of errors
- Uses diverse fallback questions (no repetition)
- Continues interview flow smoothly

#### 5. **Job Retry Logic**
- Max 3 retry attempts
- Exponential backoff: 5s → 10s → 20s
- No retries for quota errors (prevents infinite loops)

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Resumes
- `POST /api/v1/resumes` - Upload resume
- `GET /api/v1/resumes` - Get user resumes
- `GET /api/v1/resumes/:id` - Get resume details

### Interviews
- `POST /api/v1/interviews` - Create interview
- `GET /api/v1/interviews` - Get interview history
- `GET /api/v1/interviews/:id` - Get interview details

#### Technical Round
- `POST /api/v1/interviews/:id/technical/start` - Start technical round
- `POST /api/v1/interviews/:id/technical/answer` - Submit answer
- `GET /api/v1/interviews/:id/technical/evaluation/:questionId` - Get evaluation

#### HR Round
- `POST /api/v1/interviews/:id/hr/start` - Start HR round
- `POST /api/v1/interviews/:id/hr/answer` - Submit HR answer
- `GET /api/v1/interviews/:id/hr/evaluation/:questionId` - Get HR evaluation

#### Coding Round
- `POST /api/v1/interviews/:id/coding/start` - Start coding round
- `POST /api/v1/interviews/:id/coding/submit` - Submit code

### Admin & Monitoring
- `GET /api/v1/admin/api-usage` - Get API usage statistics
- `POST /api/v1/admin/clear-cache` - Clear all AI caches

### Health Check
- `GET /health` - Server health status

## 🔍 Monitoring

### API Usage Dashboard

Check current API usage and cache statistics:

```bash
curl http://localhost:5000/api/v1/admin/api-usage
```

Response:
```json
{
  "rateLimits": {
    "gemini": {
      "current": 12,
      "max": 15,
      "window": "60s",
      "utilization": "80.0%"
    },
    "openai": {
      "current": 2,
      "max": 3,
      "utilization": "66.7%"
    }
  },
  "caches": {
    "questions": { "entries": 45, "ttl": 86400 },
    "evaluations": { "entries": 120, "ttl": 3600 },
    "hrQuestions": { "entries": 32, "ttl": 86400 }
  }
}
```

### Clear Caches

```bash
curl -X POST http://localhost:5000/api/v1/admin/clear-cache
```

## 📊 Database Schema

### User
- Authentication and profile information
- Role-based access control

### Resume
- Parsed resume data
- ATS score and analysis
- Skills extraction

### Interview
- Multi-round interview tracking
- Overall scores and hiring decision

### TechnicalRound
- AI-generated questions
- Answer evaluations
- Score breakdown by category

### HRRound
- Behavioral questions
- Personality analysis
- Culture fit assessment

### CodingRound
- Programming problems
- Test case execution
- Code quality review

## 🚦 Background Jobs

Powered by BullMQ for reliable async processing:

### Job Types
- `evaluate-answer` - Evaluate technical answers
- `generate-question` - Generate next question
- `evaluate-hr-answer` - Evaluate HR responses
- `generate-hr-question` - Generate HR questions
- `execute-code-tests` - Run code test cases

### Job Configuration
- Max 3 retry attempts
- Exponential backoff (5s, 10s, 20s)
- Concurrency: 50 jobs
- Rate limit: 100 jobs per minute

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation
- Rate limiting on API endpoints
- Secure file upload validation

## 📝 Logging

- Winston logger for structured logging
- Different log levels (info, warn, error)
- File rotation for production
- Console logging in development

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🐛 Troubleshooting

### API Quota Exhausted
If you see "quota exceeded" errors:
1. Check usage: `GET /api/v1/admin/api-usage`
2. Wait for quota reset (typically 1 minute)
3. System will automatically use fallback questions
4. Consider upgrading to paid API tiers

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

## 📈 Performance Optimization

- **Caching**: 40-60% reduction in AI API calls
- **Rate Limiting**: Prevents quota exhaustion
- **Background Jobs**: Non-blocking async processing
- **Connection Pooling**: Efficient database connections
- **Compression**: Gzip compression for responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini API for fast AI responses
- OpenAI for GPT models
- Judge0 for code execution
- BullMQ for reliable job processing

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

---

**Built with ❤️ for better interview preparation**
