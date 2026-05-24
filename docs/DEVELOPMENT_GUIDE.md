# Development Guide - CarConsult

## 🎯 Development Workflow

### Setting Up Your Development Environment

1. **Clone/Setup the project**
   ```bash
   cd carconsult
   chmod +x setup.sh      # On Mac/Linux
   ./setup.sh             # Or setup.bat on Windows
   ```

2. **Start both servers**
   - Terminal 1: `cd backend && npm run dev`
   - Terminal 2: `cd frontend && npm run dev`

3. **Open in browser**: `http://localhost:3000`

## 🏗️ Adding New Features

### Example: Add a New Filter Option

**1. Backend - Add to Car Model**
```javascript
// backend/src/models/Car.js
carSchema = {
  // ... existing fields
  transmissionType: {
    type: String,
    enum: ['manual', 'automatic', 'cvt'],  // Add 'cvt'
  }
}
```

**2. Backend - Update Controller**
```javascript
// backend/src/controllers/carController.js
export const getCars = async (req, res) => {
  const { transmissionType } = req.query;
  
  if (transmissionType) {
    const types = transmissionType.split(',');
    filter.transmissionType = { $in: types };
  }
  // ... rest of code
}
```

**3. Frontend - Add to Filter Sidebar**
```javascript
// frontend/src/components/FilterSidebar.jsx

const TRANSMISSION_TYPES = ['manual', 'automatic', 'cvt'];

// In component:
<FilterAccordion title="Transmission Type">
  {TRANSMISSION_TYPES.map((type) => (
    <CheckboxFilter
      key={type}
      label={type}
      checked={filters.transmissionType?.includes(type)}
      onChange={() => handleTransmissionTypeToggle(type)}
    />
  ))}
</FilterAccordion>
```

**4. Frontend - Update Filter Reducer**
```javascript
// frontend/src/hooks/useFilterReducer.js

const initialState = {
  // ... existing
  transmissionType: [],
};

const filterReducer = (state, action) => {
  switch(action.type) {
    case 'SET_TRANSMISSION_TYPE':
      return { ...state, transmissionType: action.payload, page: 1 };
    // ...
  }
}

// Export method
export const setTransmissionType = useCallback(
  (type) => dispatch({ type: 'SET_TRANSMISSION_TYPE', payload: type }),
  []
);
```

---

### Example: Add a New Admin Feature

**Add Export to CSV**

**1. Backend - Add Export Route**
```javascript
// backend/src/routes/carRoutes.js
router.get('/export/csv', verifyToken, isAdmin, async (req, res) => {
  try {
    const cars = await Car.find({});
    
    // Convert to CSV
    const csv = cars.map(car => 
      `${car.title},${car.price},${car.location}`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=cars.csv');
    res.send(csv);
  } catch(error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

**2. Frontend - Add Export Button**
```javascript
// frontend/src/pages/AdminDashboard.jsx

const handleExport = async () => {
  try {
    const response = await carsAPI.exportCSV();
    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cars.csv');
    document.body.appendChild(link);
    link.click();
  } catch(error) {
    console.error('Export failed:', error);
  }
};

// Add button:
<button onClick={handleExport} className="btn-secondary">
  📥 Export CSV
</button>
```

---

## 🔧 Common Development Tasks

### Adding a New API Endpoint

**Pattern:**
```
1. Create route in routes/
2. Create controller method in controllers/
3. Add validation if needed
4. Add to api.js service
5. Use in component with error handling
```

---

### Adding a New Page

**1. Create page component**
```javascript
// frontend/src/pages/NewPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function NewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Your content */}
    </motion.div>
  );
}
```

**2. Add route**
```javascript
// frontend/src/App.jsx
import NewPage from './pages/NewPage';

<Route path="/newpage" element={<NewPage />} />
```

**3. Add navigation**
```javascript
// frontend/src/components/Navbar.jsx
<Link to="/newpage">New Page</Link>
```

---

### Using Zustand Store

**In your component:**
```javascript
import { useCarsStore } from '../context/store';

function MyComponent() {
  const { cars, setCars, addToWishlist } = useCarsStore();

  return (
    <button onClick={() => addToWishlist(car)}>
      Add to Wishlist
    </button>
  );
}
```

---

### Making API Calls

**Pattern:**
```javascript
import { carsAPI } from '../services/api';

const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const fetchData = async () => {
  setLoading(true);
  setError('');
  try {
    const response = await carsAPI.getCars({ limit: 10 });
    // Use response.data
  } catch(err) {
    setError(err.response?.data?.message || 'Error');
  } finally {
    setLoading(false);
  }
};
```

---

### Adding Form Validation

**Frontend:**
```javascript
const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.title) errors.title = 'Title is required';
  if (formData.price < 0) errors.price = 'Invalid price';
  
  return errors;
};

// In form submission:
const errors = validateForm(formData);
if (Object.keys(errors).length > 0) {
  setFormErrors(errors);
  return;
}
```

**Backend:**
```javascript
import { body, validationResult } from 'express-validator';

router.post('/cars', 
  body('title').notEmpty().withMessage('Title required'),
  body('price').isNumeric().withMessage('Price must be number'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    // Continue with logic
  }
);
```

---

## 🎨 Styling Guidelines

### Using Tailwind Classes

```javascript
// Good practices
<div className="bg-dark-card text-white rounded-lg p-4 border border-dark-border">
  Content
</div>

// Use predefined classes
className="btn-primary"      // Custom class
className="input-field"      // Custom class
className="card"            // Custom class

// Responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Hover effects
className="hover:bg-dark-bg transition-colors duration-300"

// State-based styling
className={isActive ? 'bg-accent text-white' : 'bg-dark-card'}
```

### Color System

```
Dark Background: #0F172A (dark.bg)
Card: #1E293B (dark.card)
Border: #334155 (dark.border)
Accent: #6366F1
Text Primary: #F8FABC
Text Secondary: #94A3B8 (slate-400)
```

---

## 🚀 Performance Tips

### Frontend Performance

1. **Memoization**
   ```javascript
   // Expensive computation
   const filteredCars = useMemo(() => {
     return cars.filter(car => car.price > minPrice);
   }, [cars, minPrice]);
   ```

2. **Lazy Loading**
   ```javascript
   const MyCom = lazy(() => import('./MyComponent'));
   <Suspense fallback={<Loading />}>
     <MyCom />
   </Suspense>
   ```

3. **Debouncing**
   ```javascript
   const handleSearch = useCallback(
     debounce((term) => {
       setSearch(term);
       onFilterChange();
     }, 500),
     [onFilterChange]
   );
   ```

### Backend Performance

1. **Database Indexes**
   ```javascript
   carSchema.index({ brand: 1, price: 1 });
   carSchema.index({ title: 'text' });
   ```

2. **Pagination**
   ```javascript
   const limit = Math.min(req.query.limit, 100);
   const skip = (page - 1) * limit;
   Car.find().skip(skip).limit(limit);
   ```

3. **Projection (Select fields)**
   ```javascript
   Car.find({}, 'title price brand -_id');
   ```

---

## 🧪 Testing Your Code

### Manual Testing Checklist

- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] Filters work correctly
- [ ] Search is case-insensitive
- [ ] Pagination works
- [ ] Admin routes are protected
- [ ] Forms validate input
- [ ] Error messages display
- [ ] Loading states appear
- [ ] Responsive design works
- [ ] No console errors

### API Testing

```bash
# Test endpoint
curl -X GET "http://localhost:5000/api/cars?limit=1"
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@carconsult.com","password":"admin123"}'
```

---

## 📚 Code Organization

### File Structure Best Practices

```
Feature Component:
├── MyFeature.jsx       (Component logic)
├── MyFeature.module.css (Scoped styles - optional)
└── MyFeature.test.js   (Tests - optional)

API Integration:
├── cars/
│   ├── useCars.js      (Custom hook)
│   ├── carsSlice.js    (State if using Redux)
│   └── carsAPI.js      (API calls)
```

### Import Organization

```javascript
// 1. React & Libraries
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// 2. Components
import Navbar from '../components/Navbar';

// 3. Hooks & Context
import { useCarsStore } from '../context/store';
import { useFilterReducer } from '../hooks/useFilterReducer';

// 4. Services & Utils
import { carsAPI } from '../services/api';

// 5. Styles
import './MyComponent.css';
```

---

## 🐛 Debugging Tips

### Frontend

**Enable Redux DevTools**
```javascript
// If using Redux (future enhancement)
const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__?.());
```

**Console Logging**
```javascript
// Good: Structured logging
console.log('🔄 Fetching cars:', { filters, page });
console.log('✅ Cars loaded:', cars.length);
console.error('❌ Error:', err.message);
```

### Backend

**Request Logging**
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.query);
  next();
});
```

---

## 📤 Deploying Changes

### Local to Production

```bash
# Backend
cd backend
npm run build (if applicable)
git push heroku main

# Frontend
cd frontend
npm run build
# Deploy 'dist' folder to Vercel
```

---

## 🤝 Code Review Checklist

Before committing code:

- [ ] No console.log statements (except dev)
- [ ] Error handling present
- [ ] Mobile responsive
- [ ] Accessibility considered
- [ ] Performance optimized
- [ ] No unused imports
- [ ] Code follows project style
- [ ] Comments for complex logic
- [ ] Tests pass
- [ ] No breaking changes

---

## 📖 Additional Resources

- [React Patterns](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MongoDB Indexing](https://docs.mongodb.com/manual/indexes/)

---

**Happy developing! 🚀**
