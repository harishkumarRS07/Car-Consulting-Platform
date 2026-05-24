# Troubleshooting Guide - CarConsult

## Common Issues & Solutions

### 🔴 BACKEND ISSUES

#### Issue 1: MongoDB Connection Error
```
Error: "connect ECONNREFUSED" or "Cannot connect to MongoDB"
```

**Solutions:**
1. **Check MongoDB URI**
   ```bash
   # Verify in .env file
   cat backend/.env | grep MONGODB_URI
   ```
   - Correct format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
   - Replace username/password with actual values
   - Remove angle brackets if present

2. **MongoDB Atlas Issues**
   - Check IP Whitelist: `https://cloud.mongodb.com` → Security → Network Access
   - Should allow `0.0.0.0/0` (all IPs) for development
   - Verify database user has "readWrite" permissions

3. **Local MongoDB**
   ```bash
   # Check if MongoDB service is running
   brew services list  # Mac
   systemctl status mongod  # Linux
   # Windows: Check Services app
   
   # Start MongoDB
   mongod  # this creates data directory
   ```

4. **Connection String Issues**
   ```bash
   # If special characters in password, URL encode them:
   # Password: myP@ssw0rd!
   # Encoded: myP%40ssw0rd%21
   
   # Correct: mongodb+srv://user:myP%40ssw0rd%21@cluster.mongodb.net
   ```

---

#### Issue 2: Port 5000 Already in Use
```
Error: "EADDRINUSE: address already in use :::5000"
```

**Solutions:**
```bash
# Mac/Linux - Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
# Edit backend/.env
PORT=5001
```

**Windows:**
```bash
# Find process
netstat -ano | findstr :5000

# Kill it
taskkill /PID <PID> /F

# Or change port in .env
```

---

#### Issue 3: Server Starts But No Routes Work
```
Error: 404 for all API calls
```

**Solutions:**
1. Ensure routes are properly imported in server.js
2. Check order of middleware (should be: body parser → CORS → routes → error handler)
3. Verify route paths in authRoutes.js and carRoutes.js
4. Check for typos in route definitions

```javascript
// server.js - Correct order
app.use(express.json());         // 1. Body parser
app.use(cors());                 // 2. CORS
app.get('/health', ...);         // 3. Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use((err, req, res, next) => {...}); // 4. Error handler
```

---

#### Issue 4: JWT Token Issues
```
Error: "Invalid or expired token" for protected routes
```

**Solutions:**
1. **Verify JWT_SECRET**
   ```bash
   # .env should have a long random string
   JWT_SECRET=aVeryLongRandomSecret123456789
   ```

2. **Check token format**
   ```
   Client must send: Authorization: Bearer <token>
   Not: Authorization: <token>
   ```

3. **Token expired**
   - Default expiry is 30 days
   - Re-login to get new token

4. **Admin-only route not working**
   - Verify user role is "admin" in database
   - Check isAdmin middleware is applied

```javascript
// Correct order of middleware
router.post('/', verifyToken, isAdmin, createCar);
```

---

#### Issue 5: Seeding Database Fails
```
Error: "Cannot seed database" or duplicate key error
```

**Solutions:**
```bash
# Clear existing data first
db.users.deleteMany({})
db.cars.deleteMany({})

# Then run seed
npm run seed

# Or manually add admin user in MongoDB:
db.users.insertOne({
  email: "admin@carconsult.com",
  password: bcrypt.hashSync("admin123", 10),
  role: "admin"
})
```

---

### 🔴 FRONTEND ISSUES

#### Issue 1: Cannot Connect to Backend
```
Error: "Network Error" or "Failed to fetch"
```

**Solutions:**
1. **Check VITE_API_URL**
   ```bash
   # frontend/.env
   VITE_API_URL=http://localhost:5000/api
   ```
   Note: Must match backend port exactly

2. **Check backend is running**
   ```bash
   # Terminal 1
   cd backend
   npm run dev
   # Should see: "Server running on http://localhost:5000"
   ```

3. **Check CORS errors**
   - Look at browser console (F12)
   - Frontend request blocked by CORS?
   - Verify backend has CORS enabled for frontend URL

   ```javascript
   // backend/src/server.js
   app.use(cors({
     origin: ['http://localhost:3000', 'http://localhost:5173'],
     credentials: true,
   }));
   ```

4. **Test API manually**
   ```bash
   curl http://localhost:5000/health
   # Should return: {"success":true,"message":"Server is running"}
   ```

---

#### Issue 2: Page Stuck in Loading State
```
Car list never loads, skeleton keeps showing
```

**Solutions:**
1. **Check browser console (F12)**
   - Network tab → Check API calls
   - Console tab → Look for errors
   - Look for "401 Unauthorized" or "404 Not Found"

2. **Verify API response**
   ```bash
   curl "http://localhost:5000/api/cars?limit=1"
   # Should return cars array
   ```

3. **Check fetch returns data**
   - Add debug logs in Cars.jsx
   - Check response.data.cars exists
   - Verify pagination object exists

4. **Increase timeout**
   ```javascript
   // frontend/src/services/api.js
   const apiClient = axios.create({
     baseURL: API_BASE_URL,
     timeout: 10000, // 10 seconds
   });
   ```

---

#### Issue 3: Authentication Not Working
```
Error: "Cannot read property 'role' of null" or undefined
```

**Solutions:**
1. **Verify login endpoint works**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@carconsult.com","password":"admin123"}'
   ```

2. **Check token is saved**
   ```javascript
   // Browser Console
   localStorage.getItem('authToken')
   // Should show token, not null
   ```

3. **Verify token in requests**
   ```javascript
   // Add debug log in api.js
   console.log('Token:', localStorage.getItem('authToken'));
   ```

4. **Clear localStorage on issues**
   ```javascript
   // Browser Console
   localStorage.clear()
   // Then refresh page
   ```

---

#### Issue 4: Forms Not Submitting
```
Error: Form submits but nothing happens
```

**Solutions:**
1. **Check for validation errors**
   - Ensure all required fields have values
   - Check type mismatches (number vs string)

2. **Add error handling**
   ```javascript
   // In AdminCarForm.jsx
   try {
     await apiClient.post('/cars', formData);
   } catch(err) {
     console.error('Error:', err.response?.data);
     setError(err.response?.data?.message);
   }
   ```

3. **Verify token is still valid**
   - 30-day expiry might have passed
   - Re-login if needed

4. **Check image URLs**
   - Ensure images property is array of URLs strings
   - Not file objects

---

#### Issue 5: Styling Not Applied
```
Tailwind classes not working, page looks broken
```

**Solutions:**
1. **Rebuild Tailwind**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Check tailwind.config.js**
   ```javascript
   // Should include src files
   content: [
     './index.html',
     './src/**/*.{js,jsx}',  // Important!
   ]
   ```

3. **Clear cache**
   ```bash
   rm -rf .vite
   npm run dev
   ```

4. **Check CSS file is imported**
   ```javascript
   // src/main.jsx or App.jsx
   import './styles/globals.css'
   ```

---

### 🟡 COMMON MISTAKES

#### 1. Forgetting to Copy .env.example
```bash
# WRONG - run from backend folder
cp backend/.env.example backend/.env

# RIGHT
cd backend
cp .env.example .env
```

#### 2. Not Updating MongoDB URI
```
# .env still has default/placeholder values
# Must update with real MongoDB Atlas connection string
```

#### 3. Running Both Servers on Same Port
```
# Should be different ports!
Backend: localhost:5000
Frontend: localhost:3000 (default Vite) or 5173
```

#### 4. Case Sensitivity in Routes
```javascript
// WRONG - mismatched case
router.get('/Cars', ...)  // Route defined as /Cars
fetch('/api/cars')         // Request to /cars - 404!

// RIGHT
router.get('/cars', ...)
fetch('/api/cars')
```

#### 5. Forgetting to Add Bearer Token
```javascript
// WRONG
headers: { Authorization: token }

// RIGHT
headers: { Authorization: `Bearer ${token}` }
```

---

### 🟢 DEBUG CHECKLIST

Before asking for help, verify:

```
Backend:
☐ MongoDB is running
☐ .env file exists with correct values
☐ npm install ran successfully
☐ 'npm run dev' starts without errors
☐ http://localhost:5000/health returns 200
☐ All routes can be accessed
☐ Token is valid after login

Frontend:
☐ npm install ran successfully
☐ .env file exists with correct API URL
☐ 'npm run dev' starts without errors
☐ Can see app at http://localhost:3000
☐ localStorage shows authToken after login
☐ Network requests appear in DevTools
☐ No console errors (F12)
☐ CORS errors don't appear

Integration:
☐ Can ping backend from frontend
☐ Login works (get token)
☐ Admin dashboard loads
☐ Add car form submits
☐ Filter changes update car list
```

---

### 🆘 Getting Help

**If still stuck:**

1. **Enable Debug Mode**
   ```javascript
   // In api.js
   apiClient.interceptors.response.use(
     res => {
       console.log('Response:', res);
       return res;
     },
     err => {
       console.error('Error:', err);
       return Promise.reject(err);
     }
   );
   ```

2. **Check Logs**
   ```bash
   # Backend
   npm run dev
   # Look at server output for errors

   # Frontend
   npm run dev
   # Check terminal and browser console (F12)
   ```

3. **Test Endpoints Directly**
   ```bash
   # Terminal
   curl http://localhost:5000/api/cars?limit=1
   
   # Browser Console
   fetch('http://localhost:5000/api/cars').then(r => r.json()).then(console.log)
   ```

4. **Re-initialize Project**
   ```bash
   # Clean reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm install # yes, twice
   npm run dev
   ```

---

## FAQ

**Q: How to change admin password?**
A: Delete admin user from MongoDB and run seed again with new credentials

**Q: Can I use different database than MongoDB?**
A: Yes, but you'll need to rewrite models using different ORM

**Q: How to add payment integration?**
A: Add payment controller, routes, and integrate Stripe/Razorpay API

**Q: How to deploy to production?**
A: See DEPLOYMENT.md or README.md for detailed steps

---

**Still having issues?** Check browser DevTools and server logs - 90% of issues are visible there!
