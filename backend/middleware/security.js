const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests from this IP') => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Specific rate limiters for different endpoints
const rateLimiters = {
  // Authentication endpoints
  auth: createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts, please try again later'),
  
  // Password reset
  passwordReset: createRateLimiter(60 * 60 * 1000, 3, 'Too many password reset attempts, please try again later'),
  
  // General API
  general: createRateLimiter(15 * 60 * 1000, 100, 'Too many requests from this IP'),
  
  // Upload endpoints
  upload: createRateLimiter(60 * 60 * 1000, 10, 'Too many uploads, please try again later'),
  
  // Admin endpoints
  admin: createRateLimiter(15 * 60 * 1000, 50, 'Too many admin requests from this IP')
};

// Encryption utilities
const encryption = {
  // Simple encryption for sensitive data
  encrypt: (text, key = process.env.ENCRYPTION_KEY) => {
    if (!key) {
      console.warn('No encryption key provided, using fallback');
      key = 'fallback-encryption-key-32-characters';
    }
    
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      iv: iv.toString('hex'),
      data: encrypted
    };
  },
  
  decrypt: (encryptedData, key = process.env.ENCRYPTION_KEY) => {
    if (!key) {
      console.warn('No encryption key provided, using fallback');
      key = 'fallback-encryption-key-32-characters';
    }
    
    const algorithm = 'aes-256-cbc';
    const decipher = crypto.createDecipher(algorithm, key);
    
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
};

// Input sanitization
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (typeof value === 'string') {
          // Remove potential XSS and SQL injection patterns
          sanitized[key] = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/['";]/g, (char) => {
              const escapeMap = { "'": "''", '"': '""', ';': '' };
              return escapeMap[char] || char;
            })
            .trim();
        } else if (typeof value === 'object') {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
    
    return sanitized;
  };
  
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';");
  
  // Strict Transport Security (HTTPS only)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// API key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-Key') || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // In a real application, you would validate against a database of API keys
  const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
  
  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

// Audit logging
const auditLogger = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      console.log(`[AUDIT] ${new Date().toISOString()} - ${action} - User: ${req.user?.email || 'anonymous'} - IP: ${req.ip} - Status: ${res.statusCode}`);
      
      // Call the original send method
      originalSend.call(this, data);
    };
    
    next();
  };
};

// IP whitelist/blacklist middleware
const ipFilter = (options = {}) => {
  const { whitelist = [], blacklist = [] } = options;
  
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Check blacklist first
    if (blacklist.length > 0 && blacklist.includes(clientIP)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check whitelist if provided
    if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
};

module.exports = {
  rateLimiters,
  encryption,
  sanitizeInput,
  securityHeaders,
  validateApiKey,
  auditLogger,
  ipFilter
};