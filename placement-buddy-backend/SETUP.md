# Placement Buddy Backend - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- MongoDB (local or Atlas)
- Redis (for background jobs)

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
Copy `.env.example` to `.env` and update:
```env
PORT=5000
MONGO_URI=mongodb+srv://placementbuddy:placement123@placement.jrfeawz.mongodb.net/placementbuddy
JWT_SECRET=placementbuddysecret
REDIS_HOST=localhost
REDIS_PORT=6379
```

3. **Install Redis** (if not already installed)

**Windows:**
```bash
choco install redis-64
# Or download from: https://github.com/microsoftarchive/redis/releases
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

4. **Start the Server**
```bash
npm start
```

The server will start on `http://localhost:5000`

---

## 📚 API Documentation

Visit `http://localhost:5000/docs` for interactive Swagger documentation.

### Base URLs
- **v1 (Recommended)**: `http://localhost:5000/api/v1`
- **Legacy**: `http://localhost:5000/api`

---

## 🎯 Key Features

### 1. Logging
- Winston logger with daily file rotation
- Logs stored in `logs/` directory
- Console logging in development mode

### 2. API Versioning
- All endpoints available at `/api/v1/*`
- Backward compatible with `/api/*`

### 3. Swagger Documentation
- Interactive API docs at `/docs`
- JWT authentication support
- Try endpoints directly from the UI

### 4. Background Jobs
- Resume parsing runs asynchronously
- Feedback generation runs asynchronously
- Redis-powered job queues with BullMQ

---

## 📁 Project Structure

```
placement-buddy-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── config.js
│   │   ├── redis.js          # NEW
│   │   └── swagger.js        # NEW
│   ├── models/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   │   └── logger.js         # NEW
│   ├── queues/               # NEW
│   │   ├── resumeQueue.js
│   │   ├── feedbackQueue.js
│   │   ├── workers.js
│   │   └── processors/
│   │       ├── resumeProcessor.js
│   │       └── feedbackProcessor.js
│   └── app.js
├── logs/                     # NEW (auto-created)
├── server.js
└── package.json
```

---

## 🧪 Testing

### Test Swagger Docs
```
http://localhost:5000/docs
```

### Test API Versioning
```bash
curl http://localhost:5000/api/v1/auth/login
```

### Test Background Jobs
Upload a resume and check logs for job processing:
```bash
tail -f logs/app-*.log
```

---

## 🔧 Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm run worker  # Start workers only (optional)
```

---

## 📊 Monitoring

- **Logs**: Check `logs/app-*.log` and `logs/error-*.log`
- **Redis**: Use `redis-cli` to monitor queues
- **API**: Use Swagger UI at `/docs`

---

## 🚀 Deployment

The backend is ready for deployment to:
- Heroku
- AWS (EC2, ECS)
- DigitalOcean
- Render
- Railway

Make sure to:
1. Set all environment variables
2. Use a production Redis instance (Redis Cloud, AWS ElastiCache)
3. Set `NODE_ENV=production`

---

## 📝 License

MIT
