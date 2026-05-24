# CarConsult - Used Car Marketplace Platform

A production-ready, full-stack used car marketplace web application with a premium dark UI, scalable architecture, and real-world features.

## 🎯 Features

- **Browse & Search**: Advanced filtering system for finding the perfect car
- **User Authentication**: Secure JWT-based authentication
- **Admin Panel**: Complete CRUD operations for managing car listings
- **Wishlist**: Save favorite cars
- **WhatsApp Integration**: Direct contact with sellers
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Premium UI**: Dark theme with glassmorphism effects
- **Real-time Filters**: useReducer-based state management
- **Performance Optimized**: useMemo, debouncing, lazy loading

## 📊 Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)
- Axios (API calls)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcryptjs (password hashing)

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Update .env with your values**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car_marketplace
   PORT=5000
   JWT_SECRET=your_super_secret_key_here_change_in_production
   NODE_ENV=development
   ```

5. **Seed database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

   Server will run on: http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Update .env**
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   App will run on: http://localhost:3000 or http://localhost:5173

## 📝 Project Structure

```
carconsult/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── cloudinary.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── carController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Car.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── carRoutes.js
│   │   ├── scripts/
│   │   │   └── seedData.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── CarCard.jsx
    │   │   ├── FilterSidebar.jsx
    │   │   ├── CheckboxFilter.jsx
    │   │   ├── FilterAccordion.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── AdminCarForm.jsx
    │   │   └── AdminCarList.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Cars.jsx
    │   │   ├── CarDetails.jsx
    │   │   ├── AdminLogin.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── hooks/
    │   │   ├── useFilterReducer.js
    │   │   └── useCustomHooks.js
    │   ├── services/
    │   │   └── api.js
    │   ├── context/
    │   │   └── store.js
    │   ├── styles/
    │   │   └── globals.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

## 🔐 Authentication

### Default Admin Credentials
- **Email**: `admin@carconsult.com`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change these credentials in production!

### User Roles
- **Admin**: Full access to dashboard, can create/edit/delete cars
- **User**: Can browse cars, add to wishlist, contact sellers

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Cars
- `GET /api/cars` - Get all cars with filters
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Create car (admin only)
- `PUT /api/cars/:id` - Update car (admin only)
- `DELETE /api/cars/:id` - Delete car (admin only)
- `GET /api/cars/featured` - Get featured cars
- `POST /api/cars/wishlist/add` - Add to wishlist
- `DELETE /api/cars/wishlist/remove/:carId` - Remove from wishlist

## 🔍 Filter Query Parameters

```
GET /api/cars?search=i20&brand=hyundai,maruti&fuelType=petrol,diesel&priceMin=300000&priceMax=900000&yearMin=2020&yearMax=2024&bodyType=sedan,suv&transmission=manual&page=1&limit=12
```

Supported filters:
- `search` - Search by title, brand, model, description
- `brand` - Filter by brand(s)
- `fuelType` - petrol, diesel, cng, electric, hybrid
- `transmission` - manual, automatic
- `priceMin`, `priceMax` - Price range
- `yearMin`, `yearMax` - Year range
- `bodyType` - sedan, suv, hatchback, muv
- `category` - budget, assured, luxury
- `owner` - 1st, 2nd, 3rd, more
- `location` - Location filter
- `page` & `limit` - Pagination

## 🎨 UI Color Scheme

```
Dark Background: #0F172A
Card Background: #1E293B
Border: #334155
Accent: #6366F1
Text: #F8FABC
```

## 📦 Building for Production

### Frontend Build
```bash
cd frontend
npm run build
```

Production build output: `dist/` folder

### Backend Production Ready
```bash
# Set environment variables in .env
NODE_ENV=production
```

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect GitHub to Vercel
3. Deploy automatically on push

### Backend (Render/Railway)
1. Push to GitHub
2. Connect GitHub to Render/Railway
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create cluster and database
3. Get connection string
4. Add to backend .env

## 📱 Features Breakdown

### Home Page
- Hero section with call-to-action
- Featured cars section
- Feature highlights
- CTA buttons

### Cars Listing Page
- Advanced filter sidebar
- Search bar with debouncing
- Car grid (12 cars per page)
- Pagination controls
- Wishlist toggle

### Car Details Page
- Image carousel
- Full specifications
- Similar cars recommendation
- WhatsApp share button
- Add/remove wishlist

### Admin Dashboard
- Stats overview
- Car management table
- Add/edit/delete forms
- Inventory tracking

## 🔧 Customization

### Change Admin Credentials
Edit `backend/src/scripts/seedData.js`:
```javascript
const admin = new User({
  email: 'your-email@gmail.com',
  password: 'your-secure-password',
  role: 'admin',
});
```

### Add More Car Brands
Edit `frontend/src/components/FilterSidebar.jsx`:
```javascript
const BRANDS = ['hyundai', 'maruti', 'honda', 'toyota', ...];
```

### Customize Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  dark: {
    bg: '#0F172A',
    card: '#1E293B',
  },
  accent: '#6366F1',
}
```

## 🎬 Demo Data

The application comes with 12 sample cars. To seed database:

```bash
cd backend
npm run seed
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

## 🐛 Troubleshooting

### Backend Connection Issues
```
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network access in MongoDB Atlas
```

### CORS Errors
```
- Ensure frontend URL is added to CORS in Express
- Check API_BASE_URL in frontend .env
```

### Port Already in Use
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

## 📄 License

MIT License - Free to use for personal and commercial projects

## 🤝 Contributing

Feel free to fork and submit pull requests for improvements

---

**Built by CarConsult Team** - Made with ❤️ for car enthusiasts
