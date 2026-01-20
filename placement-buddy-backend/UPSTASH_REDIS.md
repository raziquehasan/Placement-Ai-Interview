# Upstash Redis Setup Guide

## ✅ Configuration Complete

Your backend is now configured to use **Upstash Redis** (cloud-hosted Redis with TLS).

---

## 🔧 What Was Changed

### 1. **Updated Files:**

- ✅ [`src/config/redis.js`](file:///C:/Users/asus/OneDrive/Desktop/Placement/placement-buddy-backend/src/config/redis.js) - Added TLS support for Upstash
- ✅ [`src/config/config.js`](file:///C:/Users/asus/OneDrive/Desktop/Placement/placement-buddy-backend/src/config/config.js) - Added REDIS_URL option
- ✅ [`.env`](file:///C:/Users/asus/OneDrive/Desktop/Placement/placement-buddy-backend/.env) - Added your Upstash credentials
- ✅ [`.env.example`](file:///C:/Users/asus/OneDrive/Desktop/Placement/placement-buddy-backend/.env.example) - Updated template

### 2. **Your Upstash Configuration:**

```env
REDIS_URL=rediss://default:AS1XAAIncDJjMTEyYjYwMjkxNjE0ZDM0YjMwOTdiNzg0OTcyZDhlOHAyMTE2MDc@aware-caiman-11607.upstash.io:6379
```

**Details:**
- **Endpoint**: `aware-caiman-11607.upstash.io`
- **Port**: `6379`
- **TLS**: Enabled (`rediss://`)
- **Region**: Mumbai, India (ap-south-1)

---

## 🚀 How It Works

### Redis Connection Logic

The updated `redis.js` now supports **two modes**:

**Mode 1: Cloud Redis (Upstash) - Using URL**
```javascript
// Detects rediss:// protocol
// Automatically enables TLS
// Uses full connection string
```

**Mode 2: Local Redis - Using Host/Port**
```javascript
// Falls back to REDIS_HOST and REDIS_PORT
// For local development
```

---

## ✅ Testing Your Setup

### 1. Start the Server

```bash
npm start
```

### 2. Check Logs

You should see:
```
✅ Redis connected successfully
🔗 Redis ready for operations
```

### 3. Test Background Jobs

**Upload a Resume:**
```bash
POST /api/v1/resumes/upload
# Should return: { jobId: "...", status: "processing" }
```

**Check Logs:**
```bash
tail -f logs/app-*.log
# Should show: "Resume job X queued"
```

---

## 🔄 Switching Between Local and Cloud Redis

### Use Upstash (Current Setup)
```env
REDIS_URL=rediss://default:your_password@your-redis.upstash.io:6379
```

### Use Local Redis
```env
# Comment out REDIS_URL
# REDIS_URL=

# Uncomment these:
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

## 📊 Upstash Dashboard

Access your Redis instance:
- **Console**: https://console.upstash.com/redis/63518210-aefe-47a1-928f-9dd79dd27ff9
- **Database**: `placement_buddy`
- **Region**: Mumbai, India
- **Plan**: Free Tier

**Features Available:**
- ✅ TLS/SSL encryption
- ✅ Global replication
- ✅ REST API access
- ✅ Monitoring dashboard

---

## 🐛 Troubleshooting

### Issue: Connection Timeout

**Solution:**
```javascript
// Already configured in redis.js
tls: {
  rejectUnauthorized: false // Required for Upstash
}
```

### Issue: Authentication Failed

**Check:**
1. Password is correct in REDIS_URL
2. URL format: `rediss://default:PASSWORD@HOST:PORT`
3. No extra spaces in .env file

### Issue: Jobs Not Processing

**Debug:**
```bash
# Check Redis connection
docker exec -it placement-buddy-api sh
node -e "const Redis = require('ioredis'); const r = new Redis(process.env.REDIS_URL); r.ping().then(console.log)"
```

---

## 🎯 Benefits of Upstash

✅ **No Installation Required** - Cloud-hosted  
✅ **TLS Encryption** - Secure by default  
✅ **Global Replication** - Low latency  
✅ **Auto-Scaling** - Handles traffic spikes  
✅ **Free Tier** - 10,000 commands/day  
✅ **Monitoring** - Built-in dashboard  

---

## 📝 Next Steps

1. ✅ Redis configured with Upstash
2. 🔜 Test background job processing
3. 🔜 Monitor queue performance in Upstash dashboard
4. 🔜 Set up alerts for queue failures

---

## 🔐 Security Notes

⚠️ **Important:**
- Never commit `.env` to Git
- Rotate Redis password periodically
- Use environment variables in production
- Enable IP whitelisting in Upstash (optional)

---

## 📖 Additional Resources

- **Upstash Docs**: https://docs.upstash.com/redis
- **BullMQ Docs**: https://docs.bullmq.io/
- **IORedis Docs**: https://github.com/redis/ioredis
