# CarConsult Environment Setup Guide

## 🚀 Complete Setup Instructions

### Step 1: Clone/Setup Project

```bash
# Create project directory
mkdir carconsult && cd carconsult

# Backend setup
mkdir backend && cd backend
npm init -y
npm install express mongoose dotenv bcryptjs jsonwebtoken cors multer cloudinary express-validator

# Copy .env.example to .env and update values
cp .env.example .env

cd ..

# Frontend setup
npx create-vite frontend --template react
cd frontend
npm install
npm install axios react-router-dom tailwindcss framer-motion react-icons lucide-react zustand

# Copy .env.example to .env
cp .env.example .env

cd ..
```

### Step 2: MongoDB Setup

#### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project
4. Create a cluster
5. Add database user (username/password)
6. Get connection string
7. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car_marketplace?retryWrites=true&w=majority
   ```

#### Option B: Local MongoDB
```bash
# Install MongoDB Community Edition
# On Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# On Mac: brew install mongodb-community
# On Linux: apt-get install -y mongodb

# Start MongoDB
mongod
```

### Step 3: Environment Variables

**Backend (.env)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car_marketplace
PORT=5000
JWT_SECRET=your_very_secret_key_change_this_in_production_12345
NODE_ENV=development
ADMIN_EMAIL=admin@carconsult.com
ADMIN_PASSWORD=admin123
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Seed Database

```bash
cd backend
npm run seed
```

### Step 5: Run Servers

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

## 🌐 Access Application

- **Frontend**: http://localhost:3000 or http://localhost:5173
- **Backend**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 📋 Default Credentials

```
Admin Email: admin@carconsult.com
Admin Password: admin123
```

## ✅ Checklist

- [ ] Node.js installed (v14+)
- [ ] MongoDB Atlas account created
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Dependencies installed
- [ ] Database seeded
- [ ] Backend running on :5000
- [ ] Frontend running on :3000
- [ ] Can login as admin
- [ ] Can browse cars

## 🚀 Production Deployment

### Backend Deployment (Render)

1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Set environment variables:
   - MONGODB_URI
   - JWT_SECRET
   - NODE_ENV=production
6. Deploy

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Import GitHub project
4. Add environment variable:
   - VITE_API_URL=https://your-backend.onrender.com/api
5. Deploy

### Database Backup

MongoDB Atlas automatically backs up your data. You can also manually export:

```bash
# Export database
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/car_marketplace"

# Import database
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net" dump
```

## 🔍 Monitoring & Logs

**Backend Logs**
```bash
npm run dev  # Shows real-time logs
```

**Frontend Browser Console**
```
Press F12 → Console tab
```

## 🐛 Common Issues & Solutions

### Issue: Cannot connect to MongoDB
```
Solution:
1. Check internet connection
2. Verify MONGODB_URI
3. Check IP whitelist in MongoDB Atlas (should allow all: 0.0.0.0/0)
4. Verify database user credentials
```

### Issue: Port 5000 already in use
```
Solution: Change port in backend .env or kill existing process
```

### Issue: CORS error in browser
```
Solution: Update CORS origins in backend/src/server.js
```

### Issue: Changes not reflected
```
Solution: 
- Clear browser cache (Ctrl+Shift+Delete)
- Restart both servers
- Check .env variables
```

## 📞 Support

For issues:
1. Check console/terminal for error messages
2. Verify all .env variables are correct
3. Ensure MongoDB is running/accessible
4. Check internet connection
5. Try restarting both servers

---

**Ready to build something amazing with CarConsult!** 🚗✨
