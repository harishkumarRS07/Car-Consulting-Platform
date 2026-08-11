## 🚀 Setup Your Admin Dashboard

### ✅ Changes Made:

1. **Updated Navbar** - Changed "Admin Login" to "Login"
2. **Updated AdminLogin Page** - Credentials prefilled with your email
3. **Updated Seed Script** - Ready to create your admin user

### 📋 Next Steps:

**1. Run the seed script to create your admin account:**
```bash
cd d:\carconsult\backend
npm run seed
```

**2. Your Admin Credentials:**
These are configured in your `backend/.env` file:
- Email: `ADMIN_EMAIL` (default: `harishvicky07@gmail.com`)
- Password: `ADMIN_PASSWORD` (default: `123456`)

**3. Start Your Application:**
```bash
# Terminal 1 - Backend
cd d:\carconsult\backend
npm start

# Terminal 2 - Frontend
cd d:\carconsult\frontend
npm run dev
```

**4. Login:**
- Go to http://localhost:3000
- Click "Login" button in navbar
- Use your credentials (already filled in)
- You'll be redirected to your admin dashboard

### 🎨 Admin Dashboard Features:
- Real-time inventory stats
- Manage car listings
- View active listings and sold vehicles
- Track messages and inquiries
- Access control panel

---

**Notes:**
- Your admin account will allow you to access the admin dashboard
- The frontend and backend must be running
- MongoDB connection via Atlas is already configured
