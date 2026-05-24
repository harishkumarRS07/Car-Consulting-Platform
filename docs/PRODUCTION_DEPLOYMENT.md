# Production Deployment Guide

## Overview
This guide covers deploying the CarConsult application to production environments.

## Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (for local deployments)
- Environment variables configured
- MongoDB Atlas account (or self-hosted MongoDB)
- Cloudinary account (for image uploads)

---

## 1. Environment Configuration

### Copy Environment Files

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env

# Docker (optional, for containerized deployment)
cp .env.docker.example .env.docker
```

### Configure Required Variables

#### Backend (backend/.env)

```bash
# CRITICAL - Generate strong values
JWT_SECRET=<generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
ADMIN_PASSWORD=<strong password, 16+ chars>

# MongoDB Atlas URL
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/car_marketplace

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# Production domains
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Production settings
NODE_ENV=production
PORT=5000
```

#### Frontend (frontend/.env)

```bash
VITE_API_URL=https://api.yourdomain.com
VITE_ENV=production
```

---

## 2. Deployment Options

### Option A: Docker Compose (Recommended for most deployments)

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Option B: Traditional Node.js Deployment

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Build (if needed)
npm run build

# Start server (using PM2 for process management)
npm install -g pm2
pm2 start src/server.js --name "carconsult-api"
pm2 save
pm2 startup
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve using Node server
npm install -g serve
serve -s dist -l 3000
```

### Option C: Cloud Deployment (Heroku, AWS, Google Cloud, etc.)

#### Heroku Example

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET="<strong_secret>"
heroku config:set MONGODB_URI="<atlas_url>"
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

---

## 3. Database Setup

### MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Create database user with strong password
4. Whitelist IP addresses
5. Get connection string
6. Update `MONGODB_URI` in `.env`

### MongoDB Indexes (Recommended)

Create indexes for better performance:

```javascript
// Run in MongoDB shell or Atlas UI
db.cars.createIndex({ "status": 1 });
db.cars.createIndex({ "price": 1 });
db.cars.createIndex({ "createdAt": -1 });
db.users.createIndex({ "email": 1 }, { "unique": true });
db.sellrequests.createIndex({ "status": 1 });
```

---

## 4. Security Verification Checklist

Before going live:

```bash
# Backend - Verify no hardcoded secrets
grep -r "api_key" backend/src/ --exclude-dir=node_modules
grep -r "api_secret" backend/src/ --exclude-dir=node_modules
grep -r "default_secret" backend/src/ --exclude-dir=node_modules

# Ensure .env files are in .gitignore
cat .gitignore | grep ".env"

# Run security audit
npm audit --audit-level=moderate
```

---

## 5. SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)

```bash
# Using Certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to your deployment
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./certs/
```

### Auto-renewal

```bash
# Add to crontab
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 6. Nginx Configuration (Reverse Proxy)

```nginx
# /etc/nginx/sites-available/carconsult

upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/carconsult /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 7. Monitoring & Logging

### Application Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-auto-pull
pm2 install pm2-logrotate

# View status
pm2 monit
```

### Log Aggregation (Optional)

```bash
# View combined logs
docker-compose logs -f

# Or use ELK stack for centralized logging
```

---

## 8. Backup Strategy

### MongoDB Backup

```bash
# Full backup
mongodump --uri "mongodb+srv://user:password@cluster.mongodb.net/car_marketplace" --out ./backups

# Restore backup
mongorestore --uri "mongodb+srv://user:password@cluster.mongodb.net/car_marketplace" ./backups

# Automated daily backup (add to crontab)
0 2 * * * mongodump --uri "mongodb+srv://user:password@cluster.mongodb.net/car_marketplace" --out /backups/$(date +\%Y\%m\%d)
```

---

## 9. Performance Optimization

### Frontend

- Enable gzip compression
- Use CDN for static assets
- Implement service workers for offline support
- Lazy load images and components

### Backend

- Enable database query caching
- Implement API response caching
- Use read replicas for MongoDB
- Set up load balancing if needed

---

## 10. Post-Deployment Verification

```bash
# Check health endpoint
curl -i https://yourdomain.com/health

# Verify HTTPS/SSL
curl -I https://yourdomain.com

# Check frontend loads
curl -I https://yourdomain.com/

# Test API endpoint
curl https://yourdomain.com/api/cars

# Verify security headers
curl -I https://yourdomain.com | grep -i "strict-transport"
```

---

## 11. Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check environment variables are set
printenv | grep JWT_SECRET

# Check MongoDB connection
mongosh "your_mongodb_uri"
```

**Frontend can't connect to API:**
```bash
# Check VITE_API_URL in frontend/.env
# Verify backend is running
curl http://backend:5000/health
```

**Docker containers won't start:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild images
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 12. Maintenance Schedule

| Task | Frequency | Owner |
|------|-----------|-------|
| Security updates | Weekly | DevOps |
| Database backups | Daily | DBA |
| Log cleanup | Monthly | DevOps |
| SSL renewal | 30 days before expiry | Auto (Certbot) |
| Dependency updates | Monthly | Development |
| Security audit | Quarterly | Security Team |
| Disaster recovery test | Quarterly | DevOps |

---

## Support & Contact

For deployment issues, contact the DevOps team or refer to:
- [Express.js Deployment Guide](https://expressjs.com/en/advanced/best-practice-deployment.html)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Docker Documentation](https://docs.docker.com/)
