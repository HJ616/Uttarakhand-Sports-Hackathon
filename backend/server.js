const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Import routes
const authRoutes = require('./routes/auth');
const athleteRoutes = require('./routes/athletes');
const assessmentRoutes = require('./routes/assessments');
const videoRoutes = require('./routes/videos');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');

// Import middleware
const { authenticate: authMiddleware } = require('./middleware/auth');
const validationMiddleware = require('./middleware/validation');
const securityMiddleware = require('./middleware/security');

// Import services
const VideoProcessor = require('./services/VideoProcessor');
const MLService = require('./services/MLService');
const NotificationService = require('./services/NotificationService');
const DataEncryption = require('./utils/encryption');

// Simple in-memory storage for video records (replace with database in production)
const videoStorage = new Map();

// Initialize Express app
const app = express();

// Load environment variables
require('dotenv').config();

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sai-assessment-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit sensitive operations
  message: {
    error: 'Too many attempts, please try again later.'
  },
  skipSuccessfulRequests: true
});

app.use('/api/auth/login', strictLimiter);
app.use('/api/auth/register', strictLimiter);
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Database connection
const MockDatabase = require('./services/MockDatabase');
let db;

// Try to connect to MongoDB first
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sai-assessment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}).then(() => {
  logger.info('Connected to MongoDB');
  db = mongoose.connection;
}).catch((err) => {
  logger.error('MongoDB connection failed:', err.message);
  logger.info('Falling back to Mock Database for development');
  db = new MockDatabase();
  db.connect();
});

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(uploadsDir, req.user?.id || 'temp');
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const encryptedName = crypto.createHash('sha256').update(uniqueSuffix.toString()).digest('hex');
    cb(null, encryptedName + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mov|avi|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: fileFilter
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = db ? (db.readyState === 1 ? 'connected' : 'disconnected') : 'unknown';
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: dbStatus,
    databaseType: db instanceof MockDatabase ? 'mock' : 'mongodb'
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'SAI Assessment Platform API',
    version: '1.0.0',
    description: 'API for AI-powered sports talent assessment platform',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/refresh': 'Refresh JWT token',
        'POST /api/auth/logout': 'Logout user',
        'POST /api/auth/forgot-password': 'Request password reset',
        'POST /api/auth/reset-password': 'Reset password'
      },
      athletes: {
        'GET /api/athletes/profile': 'Get athlete profile',
        'PUT /api/athletes/profile': 'Update athlete profile',
        'GET /api/athletes/:id/assessments': 'Get athlete assessments',
        'GET /api/athletes/leaderboard': 'Get leaderboard data'
      },
      assessments: {
        'POST /api/assessments': 'Create new assessment',
        'GET /api/assessments': 'Get user assessments',
        'GET /api/assessments/:id': 'Get assessment details',
        'PUT /api/assessments/:id': 'Update assessment',
        'DELETE /api/assessments/:id': 'Delete assessment'
      },
      videos: {
        'POST /api/videos/upload': 'Upload assessment video',
        'GET /api/videos/:id': 'Get video details',
        'POST /api/videos/:id/analyze': 'Request video analysis',
        'GET /api/videos/:id/results': 'Get analysis results'
      },
      analytics: {
        'GET /api/analytics/dashboard': 'Get dashboard analytics',
        'GET /api/analytics/trends': 'Get performance trends',
        'GET /api/analytics/comparisons': 'Get performance comparisons',
        'GET /api/analytics/export': 'Export analytics data'
      },
      admin: {
        'GET /api/admin/users': 'Get all users (admin only)',
        'GET /api/admin/assessments': 'Get all assessments (admin only)',
        'GET /api/admin/analytics': 'Get admin analytics',
        'PUT /api/admin/users/:id': 'Update user (admin only)',
        'DELETE /api/admin/users/:id': 'Delete user (admin only)'
      }
    },
    security: {
      authentication: 'JWT tokens',
      rateLimiting: 'Enabled on all endpoints',
      encryption: 'TLS 1.3, AES-256',
      dataProtection: 'GDPR compliant'
    }
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/athletes', authMiddleware, athleteRoutes);
app.use('/api/assessments', authMiddleware, assessmentRoutes);
app.use('/api/videos', authMiddleware, videoRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// File upload endpoint with security middleware
app.post('/api/upload/video', 
  authMiddleware, 
  upload.single('video'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      const { assessmentId, testType } = req.body;
      
      if (!assessmentId || !testType) {
        return res.status(400).json({ error: 'Assessment ID and test type are required' });
      }

      // Encrypt file before processing
      const encryptedPath = await DataEncryption.encryptFile(req.file.path);
      
      // Create video record in database
      const videoRecord = {
        id: crypto.randomUUID(),
        userId: req.user.id,
        assessmentId: assessmentId,
        testType: testType,
        originalName: req.file.originalname,
        encryptedPath: encryptedPath,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date(),
        status: 'uploaded',
        analysisStatus: 'pending'
      };

      // Store video record (in real app, this would be database)
      videoStorage.set(videoRecord.id, videoRecord);

      // Queue video for processing
      const videoProcessor = new VideoProcessor();
      await videoProcessor.queueVideo(videoRecord);

      logger.info(`Video uploaded successfully: ${videoRecord.id}`, {
        userId: req.user.id,
        assessmentId: assessmentId,
        testType: testType,
        fileSize: req.file.size
      });

      res.json({
        success: true,
        videoId: videoRecord.id,
        message: 'Video uploaded successfully and queued for analysis',
        estimatedProcessingTime: '2-5 minutes'
      });

    } catch (error) {
      logger.error('Video upload error:', error);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  }
);

// Video analysis endpoint
app.post('/api/analyze/video/:videoId', authMiddleware, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { testType, parameters } = req.body;

    // Retrieve video record
    const video = videoStorage.get(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Verify ownership
    if (video.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Initialize ML service
    const mlService = new MLService();
    
    // Decrypt video file
    const decryptedPath = await DataEncryption.decryptFile(video.encryptedPath);
    
    // Perform analysis based on test type
    let analysisResults;
    
    switch (testType) {
      case '100m-dash':
        analysisResults = await mlService.analyze100mDash(decryptedPath, parameters);
        break;
      case 'sit-ups':
        analysisResults = await mlService.analyzeSitUps(decryptedPath, parameters);
        break;
      case 'sit-reach':
        analysisResults = await mlService.analyzeSitReach(decryptedPath, parameters);
        break;
      case '600m-run':
        analysisResults = await mlService.analyze600mRun(decryptedPath, parameters);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported test type' });
    }

    // Update video record with analysis results
    video.analysisStatus = 'completed';
    video.analysisResults = analysisResults;
    video.analyzedAt = new Date();
    
    videoStorage.set(videoId, video);

    // Clean up decrypted file
    await fs.promises.unlink(decryptedPath);

    logger.info(`Video analysis completed: ${videoId}`, {
      userId: req.user.id,
      testType: testType,
      results: analysisResults
    });

    res.json({
      success: true,
      videoId: videoId,
      analysisResults: analysisResults,
      message: 'Video analysis completed successfully'
    });

  } catch (error) {
    logger.error('Video analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze video' });
  }
});

// Real-time notifications endpoint
app.get('/api/notifications', authMiddleware, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const notificationService = new NotificationService();
  const userId = req.user.id;

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to notification service' })}\n\n`);

  // Set up notification listener
  const notificationListener = (notification) => {
    res.write(`data: ${JSON.stringify(notification)}\n\n`);
  };

  notificationService.subscribe(userId, notificationListener);

  // Handle client disconnect
  req.on('close', () => {
    notificationService.unsubscribe(userId, notificationListener);
  });

  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details || err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: 'Video file size exceeds 100MB limit'
    });
  }
  
  if (err.message && err.message.includes('Only video files')) {
    return res.status(415).json({
      error: 'Unsupported media type',
      message: err.message
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`SAI Assessment Platform API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`API docs: http://localhost:${PORT}/api/docs`);
});

module.exports = app;