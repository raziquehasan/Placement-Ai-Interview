# Placement - AI Interview Simulator

A full-stack AI-powered interview preparation platform for college students.

## 📁 Project Structure

```
Placement/
├── client/                          # Frontend (Coming Soon)
└── placement-buddy-backend/         # Node.js Backend API
    ├── src/
    │   ├── config/                  # Configuration files
    │   ├── models/                  # Mongoose models
    │   ├── controllers/             # Request handlers
    │   ├── services/                # Business logic
    │   ├── routes/                  # API routes
    │   ├── middleware/              # Custom middleware
    │   ├── utils/                   # Utility functions
    │   └── queues/                  # Background job queues
    ├── Dockerfile                   # Docker configuration
    ├── docker-compose.yml           # Multi-container setup
    └── server.js                    # Entry point
```

## 🚀 Backend Features

- ✅ RESTful API with Express.js
- ✅ MongoDB database with Mongoose
- ✅ JWT authentication
- ✅ Background job processing (BullMQ + Redis)
- ✅ Winston logging with daily rotation
- ✅ Swagger API documentation
- ✅ Docker containerization
- ✅ API versioning (v1)
- ✅ Production-ready architecture

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MongoDB 6
- **Cache/Queue**: Redis 7 (Upstash)
- **Authentication**: JWT
- **File Upload**: Multer
- **Logging**: Winston + Morgan
- **Documentation**: Swagger UI
- **Background Jobs**: BullMQ
- **Containerization**: Docker

## 📚 Documentation

- [Backend Setup Guide](./placement-buddy-backend/SETUP.md)
- [Docker Deployment](./placement-buddy-backend/DOCKER.md)
- [API Documentation](http://localhost:5000/docs) (when running)

## 🚀 Quick Start

### Backend

```bash
cd placement-buddy-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start server
npm start

# Or with Docker
docker-compose up -d
```

### Access Points

- **API**: http://localhost:5000/api/v1
- **Swagger Docs**: http://localhost:5000/docs
- **Health Check**: http://localhost:5000/

## 🔐 Security

- Environment variables for sensitive data
- JWT token-based authentication
- Password hashing with bcrypt
- Input validation on all endpoints
- CORS protection
- Rate limiting ready

## 📝 License

MIT

## 👨‍💻 Author

Placement Buddy Team
