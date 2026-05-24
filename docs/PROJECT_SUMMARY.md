# CarConsult - Used Car Marketplace

## 📁 Project Overview

This is a production-ready, full-stack used car marketplace application similar to Spinny/Cars24. The platform includes a premium dark UI, advanced filtering system, admin panel for inventory management, and real-world features.

## ✨ What's Included

### Backend (Node.js + Express + MongoDB)
✅ Complete REST API with authentication
✅ MongoDB models for Cars and Users
✅ JWT-based authentication system
✅ Advanced car filtering with AND/OR logic
✅ Admin CRUD operations
✅ Wishlist functionality
✅ Database seeding with 12 sample cars
✅ Dashboard statistics
✅ Error handling & validation

### Frontend (React + Vite + Tailwind)
✅ Beautiful dark theme UI with glassmorphism
✅ Advanced filter sidebar with accordion design
✅ Real-time search and filtering (useReducer)
✅ Car browsing with pagination
✅ Car details page with image carousel
✅ Admin dashboard with complete CRUD
✅ Responsive design (mobile-first)
✅ Wishlist (localStorage-based)
✅ Smooth animations (Framer Motion)
✅ Performance optimized (memoization, lazy loading)

## 🎯 Key Features

### User Features
- 👀 Browse thousands of verified cars
- 🔍 Advanced multi-filter search system
- ❤️ Add cars to wishlist
- 📱 WhatsApp contact integration
- 🎬 Image carousel on car details
- ⭐ Car ratings and reviews
- 🔐 User authentication
- 📍 Location-based filtering

### Admin Features
- 📊 Dashboard with statistics
- ➕ Add new car listings
- ✏️ Edit car details
- 🗑️ Delete listings
- 📈 Inventory management
- 📋 Sales tracking

## 🚀 Quick Start

```bash
# Backend
cd backend
npm install
npm run seed  # Populate database
npm run dev   # Start on port 5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev   # Start on port 3000
```

**Note**: Copy .env.example to .env and update with your MongoDB URI

## 📊 Filter Capabilities

The application supports intelligent filtering:
- Price range (₹50K - ₹50L)
- Brand (12+ brands)
- Fuel type (Petrol, Diesel, CNG, Electric)
- Transmission (Manual, Automatic)
- Body type (Sedan, SUV, Hatchback, MUV)
- Year range
- Owner type (1st, 2nd, 3rd, More)
- Category (Budget, Assured+, Luxury)
- Location-based search
- Text search (title, model, description)

## 🎨 Design System

**Color Palette**
- Primary Dark: #0F172A
- Card Dark: #1E293B
- Accent: #6366F1 (Indigo)
- Text: #F8FABC

**Components**
- Glassmorphism cards
- Smooth hover animations
- Loading skeletons
- Modal forms
- Responsive grids

## 📱 Pages

1. **Home** (/) - Hero, featured cars, benefits
2. **Cars** (/cars) - Browse with filters
3. **Car Details** (/cars/:id) - Full specs, similar cars
4. **Admin Login** (/admin/login) - Auth
5. **Admin Dashboard** (/admin) - Manage listings

## 🔐 Authentication

**Default Credentials**
- Email: `admin@carconsult.com`
- Password: `admin123`

Change in production!

## 📦 Tech Stack Summary

Frontend:
- React 18, Vite, Tailwind CSS
- Framer Motion, Zustand, Axios

Backend:
- Node.js, Express.js, MongoDB
- Mongoose, JWT, Bcryptjs

## 🌐 API Routes

```
Auth:
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/profile

Cars:
- GET  /api/cars (with filters)
- GET  /api/cars/:id
- POST /api/cars
- PUT  /api/cars/:id
- DELETE /api/cars/:id
- GET  /api/cars/featured
- POST /api/cars/wishlist/add
- DELETE /api/cars/wishlist/remove/:id
```

## 🚢 Deployment Ready

**Frontend**: Optimized for Vercel
**Backend**: Ready for Render/Railway
**Database**: MongoDB Atlas compatible

## 📝 File Structure

```
backend/
├── src/
│   ├── config/        # Database & services config
│   ├── controllers/    # Business logic
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth, validation
│   ├── scripts/       # Database seeding
│   └── server.js      # Entry point
├── package.json
└── .env.example

frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Route pages
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API integration
│   ├── context/       # State management
│   ├── styles/        # Global CSS
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## ✅ Production Checklist

- [ ] Change admin credentials
- [ ] Update JWT_SECRET
- [ ] Configure CORS properly
- [ ] Use environment-specific configs
- [ ] Enable error logging
- [ ] Set up monitoring
- [ ] Optimize images
- [ ] Add rate limiting
- [ ] Implement input sanitization
- [ ] Add database backups

## 🎓 Learning Resources

This project demonstrates:
- REST API design
- Database schema design
- Component composition
- State management
- Authentication & authorization
- Responsive design
- Performance optimization
- Advanced filtering logic

## 🤝 Contributing

Feel free to fork and contribute improvements!

## 📄 License

MIT - Free for personal and commercial use

---

**Ready to launch your car marketplace!** 🚗✨

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)
For complete documentation, see [README.md](README.md)
