# Environment Variables Setup Guide

## Overview

This guide explains how to properly configure environment variables for development, staging, and production environments.

## CRITICAL SECURITY RULES

⚠️ **NEVER:**
- Commit `.env` files to version control
- Share `.env` files via email or chat
- Hardcode secrets in code
- Use weak or default passwords
- Log sensitive values

✅ **ALWAYS:**
- Use `.env.example` as template
- Generate strong, unique secrets per environment
- Rotate secrets periodically
- Use different values for dev/staging/production
- Store secrets in secure vaults

---

## Backend Environment Variables

### Development Setup (backend/.env)

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/car_marketplace

# Server
PORT=5000
NODE_ENV=development

# JWT (Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=development_secret_key_change_this_minimum_32_characters

# Cloudinary (Get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=123456
CLOUDINARY_API_SECRET=secret

# CORS (Allow development client URLs)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:3001

# Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Setup (backend/.env or environment variables)

```bash
# Database - Use MongoDB Atlas
MONGODB_URI=mongodb+srv://prod_user:STRONG_PASSWORD@cluster0.mongodb.net/car_marketplace?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=production

# JWT - Generate strong random string
JWT_SECRET=<generate using script below>

# Cloudinary - Production credentials
CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret

# CORS - Only production domains
CORS_ORIGINS=https://carconsult.com,https://www.carconsult.com

# Admin User - Strong password!
ADMIN_EMAIL=admin@carconsult.com
ADMIN_PASSWORD=<generate using script below>

# Rate Limiting - Stricter in production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

### Generating Strong Secrets

```bash
# Generate JWT Secret (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Admin Password (20 characters)
node -e "console.log(require('crypto').randomBytes(15).toString('hex').substring(0, 20))"

# Generate all secrets at once
cat > generate-secrets.js << 'EOF'
const crypto = require('crypto');
console.log('JWT_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('ADMIN_PASSWORD=' + crypto.randomBytes(15).toString('hex'));
console.log('MONGODB_URI_PASSWORD=' + crypto.randomBytes(20).toString('hex'));
EOF

node generate-secrets.js
```

---

## Frontend Environment Variables

### Development Setup (frontend/.env)

```bash
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Environment
VITE_ENV=development

# Optional Services
VITE_SENTRY_DSN=
VITE_ANALYTICS_ID=
```

### Production Setup (frontend/.env.production)

```bash
# API Configuration - Production domain
VITE_API_URL=https://api.carconsult.com

# Environment
VITE_ENV=production

# Error Tracking (Sentry)
VITE_SENTRY_DSN=https://your_sentry_id@sentry.io/project_id

# Analytics (Google Analytics, Mixpanel, etc.)
VITE_ANALYTICS_ID=UA-12345678-1
```

---

## Docker Environment Setup

### Using .env.docker File

Create `.env.docker` from template:

```bash
cp .env.docker.example .env.docker
```

Update with your values:

```bash
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=generate_strong_password

# Backend
NODE_ENV=production
JWT_SECRET=generate_strong_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGINS=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=generate_strong_password

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

Load environment file with docker-compose:

```bash
docker-compose --env-file .env.docker up -d
```

---

## Environment-Specific Configurations

### Directory Structure

```
.env                        # Current environment (not committed)
.env.example               # Template for all environments
.env.docker.example        # Docker-specific template
.env.development           # Development defaults
.env.staging              # Staging configuration
.env.production           # Production configuration
```

### Switching Environments

```bash
# Development
cp .env.development .env
npm run dev

# Staging
cp .env.staging .env
npm run build
npm run preview

# Production
cp .env.production .env
npm run build
# Deploy...
```

---

## Database Connection Strings

### MongoDB Local

```
MONGODB_URI=mongodb://localhost:27017/car_marketplace
```

### MongoDB Atlas (Recommended)

```
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/car_marketplace?retryWrites=true&w=majority
```

Requirements:
1. Create cluster in MongoDB Atlas
2. Create database user (not account user)
3. Add IP address to whitelist (0.0.0.0/0 for development, specific IPs for production)
4. Get connection string
5. Replace username and password in URI

### MongoDB Atlas Password Special Characters

If password contains special characters, URL encode them:

```javascript
// Example: password is "my@pass#123"
// URL encoded: "my%40pass%23123"

const password = "my@pass#123";
const encoded = encodeURIComponent(password);
console.log(encoded); // my%40pass%23123
```

---

## Security Best Practices

### 1. Environment Variable Validation

Backend validates on startup:

```javascript
// Backend automatically checks required vars
const required = ['MONGODB_URI', 'JWT_SECRET'];
missing = required.filter(v => !process.env[v]);
if (missing.length) process.exit(1);
```

### 2. Secrets Rotation

Schedule periodic rotation:

```bash
# Every 90 days
- JWT_SECRET (regenerate and update all signed tokens)
- Database passwords
- API keys
- Admin password
```

### 3. Access Control

- Use IAM roles for cloud deployments
- Different credentials for dev/staging/prod
- Service accounts for automated deployments
- API keys with limited scopes

### 4. Backup Secrets

Store in secure vault:
- 1Password / LastPass (team)
- AWS Secrets Manager (AWS)
- Google Secret Manager (GCP)
- Azure Key Vault (Azure)

**NEVER** store in:
- Shared documents
- Email
- Slack/Discord
- Plain text files

---

## Troubleshooting

### Backend won't start with "Missing required environment variables"

```bash
# Check if .env file exists
ls -la backend/.env

# Check values are set
cat backend/.env

# Verify specific variable
echo $JWT_SECRET  # Should not be empty

# Set manually if needed
export JWT_SECRET="your_secret_key"
npm start
```

### Frontend API calls fail with "Cannot reach API"

```bash
# Check VITE_API_URL
cat frontend/.env

# Test API connection
curl https://yourdomain.com/health

# Verify CORS settings in backend
# Check CORS_ORIGINS includes your frontend domain
```

### Docker containers exit with error

```bash
# Check logs
docker-compose logs backend

# Verify .env.docker exists
ls -la .env.docker

# Rebuild with fresh environment
docker-compose down
rm -rf .env.docker
cp .env.docker.example .env.docker
# Edit .env.docker
docker-compose build --no-cache
docker-compose up -d
```

---

## Deployment Checklist

Before deploying to each environment:

- [ ] All required environment variables defined
- [ ] Secrets are strong and unique
- [ ] No development values in production env
- [ ] Database connection tested
- [ ] API keys verified for current environment
- [ ] CORS origins match deployment domain
- [ ] `.env` files are git-ignored
- [ ] `.env.example` templates are up-to-date
- [ ] Team members have secure access to secrets
- [ ] Backup of previous secrets stored securely

---

## Quick Reference

| Variable | Environment | Example | Note |
|----------|-------------|---------|------|
| MONGODB_URI | All | `mongodb://...` | Must match environment DB |
| JWT_SECRET | All | `abc123...` | Must be 32+ characters, unique per env |
| NODE_ENV | All | `production` | Changes app behavior |
| CORS_ORIGINS | All | `https://domain.com` | Match deployment domain |
| PORT | All | `5000` | Change if port conflicts |
| VITE_API_URL | Frontend | `https://api.domain.com` | Must match backend domain |
| ADMIN_PASSWORD | All | Strong password | Change from default immediately |
| CLOUDINARY_* | All | From cloudinary.com | Separate credentials per env recommended |

---

## Additional Resources

- [Environment Variables Best Practices](https://12factor.net/config)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [MongoDB Connection Security](https://www.mongodb.com/docs/atlas/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
