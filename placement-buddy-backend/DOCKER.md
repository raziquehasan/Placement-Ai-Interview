# 🐳 Docker Deployment Guide - Placement Buddy Backend

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

---

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd placement-buddy-backend
```

### 2. Configure Environment

```bash
# Copy Docker environment file
cp .env.docker .env

# Edit .env and update:
# - JWT_SECRET (required)
# - CORS_ORIGIN (your frontend URL)
# - API keys (optional)
```

### 3. Build and Start

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Verify

```bash
# API Health Check
curl http://localhost:5000/

# Swagger Docs
open http://localhost:5000/docs
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Docker Network (Bridge)          │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │   API    │  │  Worker  │  │ Redis  ││
│  │  :5000   │  │          │  │ :6379  ││
│  └────┬─────┘  └────┬─────┘  └───┬────┘│
│       │             │             │     │
│       └─────────────┴─────────────┘     │
│                     │                   │
│              ┌──────┴──────┐            │
│              │   MongoDB   │            │
│              │   :27017    │            │
│              └─────────────┘            │
└─────────────────────────────────────────┘
```

---

## 📦 Services

### API Server
- **Port**: 5000
- **Container**: placement-buddy-api
- **Health Check**: HTTP GET /
- **Volumes**: logs, uploads

### Background Worker
- **Container**: placement-buddy-worker
- **Command**: `node src/queues/workers.js`
- **Volumes**: logs, uploads

### Redis
- **Port**: 6379
- **Image**: redis:7-alpine
- **Persistence**: AOF enabled
- **Volume**: redis_data

### MongoDB
- **Port**: 27017
- **Image**: mongo:6
- **Database**: placementbuddy
- **Volumes**: mongo_data, mongo_config

---

## 🔧 Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f worker
```

### Scale Workers
```bash
docker-compose up -d --scale worker=3
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Clean Everything
```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes (⚠️ deletes data)
docker-compose down -v
```

---

## 🔍 Debugging

### Access Container Shell
```bash
docker exec -it placement-buddy-api sh
```

### Check MongoDB
```bash
docker exec -it placement-buddy-mongo mongosh
```

### Check Redis
```bash
docker exec -it placement-buddy-redis redis-cli
```

### View Resource Usage
```bash
docker stats
```

---

## 🌐 Production Deployment

### Environment Variables

Create `.env.production`:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://mongo:27017/placementbuddy
JWT_SECRET=<strong-secret-here>
REDIS_HOST=redis
CORS_ORIGIN=https://yourdomain.com
```

### Use Production Compose File

Create `docker-compose.prod.yml`:
```yaml
version: "3.9"

services:
  api:
    image: your-registry/placement-buddy-api:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Deploy
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 📊 Monitoring

### Health Checks

All services have health checks:
```bash
docker-compose ps
```

### Logs

Logs are persisted in `./logs` directory:
```bash
tail -f logs/app-*.log
tail -f logs/error-*.log
```

---

## 🔐 Security Best Practices

✅ **Implemented:**
- Non-root user in containers
- Multi-stage builds (smaller images)
- Health checks
- Resource limits ready
- Network isolation
- Volume persistence

🔜 **Recommended:**
- Use secrets management (Docker Secrets)
- Enable TLS for MongoDB
- Use Redis password
- Implement rate limiting
- Add reverse proxy (Nginx)

---

## 🚢 CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t placement-buddy-api .
      
      - name: Push to registry
        run: docker push your-registry/placement-buddy-api:latest
```

---

## 🐛 Troubleshooting

### Issue: Containers won't start

```bash
# Check logs
docker-compose logs

# Check if ports are in use
netstat -an | grep 5000
netstat -an | grep 27017
```

### Issue: MongoDB connection failed

```bash
# Check MongoDB health
docker exec placement-buddy-mongo mongosh --eval "db.adminCommand('ping')"

# Check network
docker network inspect placement-buddy-backend_placement-buddy-network
```

### Issue: Redis connection failed

```bash
# Check Redis
docker exec placement-buddy-redis redis-cli ping
```

---

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale API servers
docker-compose up -d --scale api=3

# Scale workers
docker-compose up -d --scale worker=5
```

### Load Balancing

Add Nginx reverse proxy:
```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
  depends_on:
    - api
```

---

## 🎯 Next Steps

1. ✅ Docker setup complete
2. 🔜 Add Nginx reverse proxy
3. 🔜 Implement Docker Swarm/Kubernetes
4. 🔜 Add monitoring (Prometheus + Grafana)
5. 🔜 Setup CI/CD pipeline

---

## 📝 Notes

- **Data Persistence**: MongoDB and Redis data are stored in Docker volumes
- **Logs**: Application logs are mounted to `./logs` on host
- **Uploads**: File uploads are mounted to `./uploads` on host
- **Network**: All services communicate via `placement-buddy-network`

---

## 🆘 Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Verify health: `docker-compose ps`
3. Review environment: `docker-compose config`
