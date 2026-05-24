# CarConsult Architecture Document

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│              (React + Tailwind + Framer Motion)            │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS/HTTP
                 │ (Axios)
┌────────────────▼────────────────────────────────────────────┐
│              API GATEWAY / LOAD BALANCER                     │
│                   (Optional - Production)                   │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│              EXPRESS.JS BACKEND SERVER                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Routes (Auth, Cars, Admin)                          │   │
│  │ Middleware (Auth, Validation, CORS)                 │   │
│  │ Controllers (Business Logic)                        │   │
│  │ Models (DataSchema)                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌─────────┐  ┌──────────┐  ┌─────────────┐
│ MongoDB │  │  Session │  │  (Optional) │
│ Database│  │  Storage │  │ Cloudinary  │
└─────────┘  └──────────┘  └─────────────┘
```

## 📋 Data Flow

### 1. User Browsing Flow
```
User Visits Home
    ↓
Load Featured Cars (API Call)
    ↓
Display Cars on Frontend
    ↓
User Clicks "Browse Cars"
    ↓
Navigate to /cars page
    ↓
Apply Filters (useReducer updates state)
    ↓
API Call with Filter Params
    ↓
Backend Filters MongoDB
    ↓
Return Filtered Results
    ↓
Display in Grid
    ↓
User Can Paginate or View Details
```

### 2. Admin Car Management Flow
```
Admin Login (/admin/login)
    ↓
POST /api/auth/login
    ↓
Backend Validates Credentials (bcryptjs)
    ↓
Generate JWT Token
    ↓
Store Token in localStorage
    ↓
Redirect to /admin Dashboard
    ↓
Load Car Statistics
    ↓
Display Car List & Management Options
    ↓
Admin Creates/Edits/Deletes Car
    ↓
API Calls with JWT Token
    ↓
Backend Validates Admin Role
    ↓
MongoDB CRUD Operation
    ↓
Return Response to Frontend
    ↓
Update UI & Show Success Message
```

## 🔌 API Request/Response Cycle

```
Frontend (React)
    │
    ├─→ Axios Instance
    │       │
    │       ├─→ Add JWT Token to Header
    │       ├─→ Set Base URL
    │       └─→ Handle Interceptors
    │
    ├─→ HTTP Request
    │       │
    │       └─→ Backend (Express)
    │           │
    │           ├─→ CORS Middleware
    │           ├─→ Auth Middleware (verify JWT)
    │           ├─→ Validation Middleware
    │           ├─→ Controller Logic
    │           {
    │               - Query Parameters Processing
    │               - Database Query Building
    │               - Filtering Logic (AND/OR)
    │               - Data Transformation
    │           }
    │           ├─→ MongoDB Query
    │           └─→ Response to Frontend
    │
    └─← JSON Response
        │
        ├─→ Handle Response (Success/Error)
        ├─→ Update Zustand Store
        ├─→ Re-render Components
        └─→ User Sees Updated UI
```

## 🗄️ Database Schema

### User Collection
```
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  wishlist: [ObjectId] (references to Car),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- email (unique)
- role
```

### Car Collection
```
{
  _id: ObjectId,
  title: String,
  brand: String,
  model: String,
  price: Number,
  fuelType: String (enum),
  transmission: String (enum),
  kmsDriven: Number,
  year: Number,
  bodyType: String (enum),
  color: String,
  seats: Number,
  owner: String,
  location: String,
  rto: String,
  description: String,
  features: [String] (enum),
  category: String (enum),
  availability: String (enum),
  images: [String] (URLs),
  rating: Number,
  reviews: Number,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- brand, price, year (compound)
- title, description (text search)
- location
- availability
- createdAt (-1)
```

## 🔐 Authentication Flow

```
User provides credentials
    ↓
POST /api/auth/login
    ↓
Backend finds user by email
    ↓
Compare password with bcryptjs
    ↓
if valid:
  - Generate JWT Token
    {
      payload: { id, role },
      secret: JWT_SECRET,
      expires: 30d
    }
  - Return token + user data
else:
  - Return 401 Unauthorized
    ↓
Frontend stores token in localStorage
    ↓
All subsequent requests include:
  Header: Authorization: Bearer token
    ↓
Backend verifies token
    ↓
if valid:
  - Attach user data to request
  - Allow access to protected routes
else:
  - Return 403 Unauthorized
```

## 🔍 Advanced Filtering Logic

### Filter Query Processing
```
Client sends query params:
  ?brand=hyundai,maruti&fuelType=petrol,diesel&priceMin=300000&priceMax=900000

Backend processes:
  {
    brand: {$in: ['hyundai', 'maruti']},           // OR within category
    fuelType: {$in: ['petrol', 'diesel']},         // OR within category
    price: {$gte: 300000, $lte: 900000},
    availability: {$ne: 'booked'}                  // Default filter
  }

MongoDB Query:
  Car.find(filterObject)
    .skip((page-1)*limit)
    .limit(limit)

Result:
  Returns cars matching ALL filters (AND between categories)
```

### useReducer Filter State Management
```
Initial State:
{
  search: '',
  brand: [],
  fuelType: [],
  transmission: [],
  priceMin: 0,
  priceMax: 5000000,
  yearMin: 2000,
  yearMax: 2024,
  bodyType: [],
  owner: [],
  location: '',
  category: [],
  page: 1
}

Actions:
- SET_SEARCH: Update search term
- SET_BRAND: Toggle brands (add/remove)
- SET_FUEL_TYPE: Toggle fuel types
- SET_PRICE_RANGE: Update price slider
- SET_PAGE: Update pagination
- RESET: Clear all filters

Computed:
- queryParams: useMemo generates URL params from state
```

## ⚡ Performance Optimizations

### Frontend
```
1. useMemo for Query Params
   - Prevents unnecessary API calls
   - Only recalculates when filters change

2. Debounce Search Input
   - Wait 500ms before API call
   - Reduces server load
   - Better UX

3. Lazy Image Loading
   - Images load only when visible
   - Intersection Observer API
   - Better initial load time

4. Code Splitting
   - Vite bundle optimization
   - Dynamic imports for routes

5. Component Memoization
   - useMemo for heavy calculations
   - useCallback for event handlers
```

### Backend
```
1. Database Indexing
   - Index on brand, price, year
   - Index on text search fields
   - Faster query execution

2. Pagination
   - Default 12 items per page
   - Max 100 items
   - Prevents huge data transfers

3. Caching (Optional)
   - Redis for featured cars
   - Session storage

4. Query Optimization
   - Select only needed fields
   - Avoid N+1 queries
   - Aggregate operations where possible

5. Rate Limiting (Optional)
   - Prevent abuse
   - 100 requests/min per IP
```

## 🔄 State Management

### Zustand Stores

#### useAuthStore
```
State:
- user: Current user object
- token: JWT token
- isLoading: Login loading state

Methods:
- setUser(user): Save user to state & localStorage
- setToken(token): Save token to localStorage
- logout(): Clear auth state
- setLoading(bool): Update loading state
```

#### useCarsStore
```
State:
- cars: Current car list
- selectedCar: Active car detail
- wishlist: User's wishlist
- totalCars: Total count

Methods:
- setCars(cars): Update car list
- setSelectedCar(car): Set active car
- addToWishlist(car): Add car & persist
- removeFromWishlist(carId): Remove & persist
- setTotalCars(total): Update count
```

## 📱 Component Hierarchy

```
App
├── Router
│   ├── Navbar (sticky)
│   │   ├── Logo
│   │   ├── Navigation Links
│   │   ├── Auth Section
│   │   └── Mobile Menu
│   │
│   ├── Routes
│   │   ├── Home (/)
│   │   │   ├── Hero Section
│   │   │   ├── Features Grid
│   │   │   ├── Featured Cars
│   │   │   └── CTA Section
│   │   │
│   │   ├── Cars (/cars)
│   │   │   ├── Header
│   │   │   ├── Main Layout
│   │   │   │   ├── Sidebar
│   │   │   │   │   └── FilterSidebar
│   │   │   │   │       ├── FilterAccordion (multiple)
│   │   │   │   │       └── CheckboxFilter (multiple)
│   │   │   │   │
│   │   │   │   └── Content
│   │   │   │       ├── Car Grid
│   │   │   │       │   └── CarCard (multiple)
│   │   │   │       └── Pagination
│   │   │   │
│   │   ├── CarDetails (/cars/:id)
│   │   │   ├── Header
│   │   │   ├── Content
│   │   │   │   ├── Image Carousel
│   │   │   │   ├── Specs Grid
│   │   │   │   ├── Features List
│   │   │   │   └── Description
│   │   │   │
│   │   │   ├── Sidebar
│   │   │   │   ├── Price Card
│   │   │   │   ├── Action Buttons
│   │   │   │   └── Info Card
│   │   │   │
│   │   │   └── Similar Cars
│   │   │
│   │   ├── AdminLogin (/admin/login)
│   │   │
│   │   └── AdminDashboard (/admin) [Protected]
│   │       ├── Header
│   │       ├── Stats Grid
│   │       ├── Tabs
│   │       │   └── Listings Tab
│   │       │       ├── AdminCarForm (conditionally)
│   │       │       └── AdminCarList
│   │       │           └── AdminCarList.Table
│   │       │
│   │       └── ProtectedRoute [wrapper]
```

## 🔐 Security Measures

```
Frontend:
- JWT tokens in localStorage
- Protected routes
- CORS validation
- Input sanitization

Backend:
- Password hashing (bcryptjs)
- JWT verification
- Role-based access control
- Input validation (express-validator)
- CORS middleware
- Environment variables for secrets
- NoSQL injection prevention (Mongoose)
- XSS protection

Production:
- HTTPS only
- Rate limiting
- Helmet.js for headers
- Database backups
- Error logging (non-sensitive)
- API key management
```

## 🚀 Deployment Architecture

### Development
```
localhost:3000 ←→ localhost:5000 ←→ MongoDB Local
```

### Production (AWS/GCP/Azure Example)
```
CloudFront (CDN)
    ↓
Vercel (Frontend)
    ↓
API Gateway
    ↓
Render/Railway (Backend)
    ↓
MongoDB Atlas (Cloud Database)
    ↓
S3/GCS (Images/Media)
```

## 📊 Request/Response Examples

### Get Cars with Filters
```
Request:
GET /api/cars?brand=hyundai,maruti&fuelType=petrol&priceMin=300000&priceMax=900000&page=1&limit=12

Response Time: ~200ms
Data Size: ~50KB

Response:
{
  success: true,
  cars: [...],
  pagination: {
    currentPage: 1,
    totalPages: 10,
    totalCars: 120,
    limit: 12
  }
}
```

### Create Car (Admin)
```
Request:
POST /api/cars
Headers: Authorization: Bearer token
Content-Type: application/json
Body: {title, brand, model, price, ...}

Processing:
- Validate JWT token (5ms)
- Check admin role (5ms)
- Validate input (10ms)
- Hash features array (5ms)
- Save to MongoDB (50-100ms)

Response Time: ~200ms
Response: {success: true, car: {...}}
```

## 🔧 Error Handling

```
Frontend:
- Axios interceptors catch errors
- Display user-friendly messages
- Log to console (dev only)
- Redirect on 401 (unauthenticated)

Backend:
- Express error middleware
- Validation errors (400)
- Auth errors (401/403)
- Not found (404)
- Server errors (500)
- Log with timestamps
```

## 📈 Scalability Considerations

```
If traffic increases:

1. Database
   - Add read replicas
   - Enable sharding
   - Redis caching layer

2. Backend
   - Load balancer (NGINX)
   - Multiple server instances
   - Message queue (RabbitMQ)
   - CDN for static assets

3. Frontend
   - Service workers
   - Web workers
   - Progressive enhancement

4. Infrastructure
   - Auto-scaling groups
   - API gateway rate limiting
   - CloudFlare DDoS protection
```

---

**This architecture provides:**
- ✅ Scalability
- ✅ Performance
- ✅ Security
- ✅ Maintainability
- ✅ Extensibility
