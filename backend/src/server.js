import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import sellRoutes from './routes/sellRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import { getActiveBrands } from './controllers/sellController.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ===== ENVIRONMENT VALIDATION =====
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// ===== SECURITY MIDDLEWARE =====
// Helmet - Set security HTTP headers
app.use(helmet());

// CORS Configuration - Allow specified origins & local network IPs in development
const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'];
const configuredOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
const corsOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile native app, curl, or same-origin)
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') {
      // In development/staging, allow local IP & localhost connections
      return callback(null, true);
    }
    if (corsOrigins.includes(origin) || corsOrigins.includes('*')) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy violation for origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Rate Limiting - Prevent abuse
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: 'Too many login attempts, please try again after 15 minutes.',
});

// ===== REQUEST PARSING & COMPRESSION =====
app.use(compression()); // Enable gzip compression
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ===== REQUEST LOGGING =====
// Use morgan for HTTP request logging
const morganFormat = process.env.NODE_ENV === 'production' 
  ? 'combined' // Detailed logging in production
  : 'dev'; // Concise colored logging in development
app.use(morgan(morganFormat));

// ===== DATABASE CONNECTION =====
connectDB();

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ===== API ROUTES =====
app.get('/api/brands', getActiveBrands); // Alias for sell brands list
app.use('/api/auth', authLimiter, authRoutes); // Stricter limiting for auth
app.use('/api/cars', carRoutes);
app.use('/api/sell', sellRoutes);
app.use('/api/testimonials', testimonialRoutes);

// ===== ERROR HANDLING MIDDLEWARE =====
// Global error handler
app.use((err, req, res, _next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  
  // Express body-parser PayloadTooLargeError (entity.too.large)
  if (err.type === 'entity.too.large' || err.name === 'PayloadTooLargeError') {
    statusCode = 413;
    message = 'Payload too large. Please reduce image sizes or upload fewer images.';
    err.isOperational = true;
  }

  console.error(`[${new Date().toISOString()}] Error:`, {
    status: statusCode,
    message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Preserve descriptive message for 4xx client errors (400, 401, 403, 404, 413, 422) or operational errors
  const clientFacingMessage = (process.env.NODE_ENV === 'production' && !err.isOperational && statusCode >= 500)
    ? 'Server error' // Only mask unhandled 500 internal server errors in production
    : message;

  res.status(statusCode).json({
    success: false,
    message: clientFacingMessage,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// ===== UNHANDLED REJECTION HANDLER =====
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`🚀 Server running on port ${PORT} [${nodeEnv}]`);
  console.log(`📊 CORS enabled for: ${corsOrigins.join(', ')}`);
  console.log(`🔒 Security headers enabled (Helmet)`);
  console.log(`⚡ Compression enabled`);
  console.log(`🛡️  Rate limiting enabled`);
});
