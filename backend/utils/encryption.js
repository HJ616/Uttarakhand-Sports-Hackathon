const crypto = require('crypto');

class DataEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
    this.saltLength = 64; // 512 bits
    
    // Get encryption key from environment or generate a fallback
    this.masterKey = this.deriveKey(
      process.env.ENCRYPTION_KEY || 'fallback-encryption-key-2024',
      process.env.ENCRYPTION_SALT || 'fallback-salt-2024'
    );
  }

  // Derive encryption key from password and salt
  deriveKey(password, salt) {
    try {
      return crypto.pbkdf2Sync(
        password,
        salt,
        100000, // iterations
        this.keyLength,
        'sha256'
      );
    } catch (error) {
      console.error('Key derivation error:', error);
      throw new Error('Failed to derive encryption key');
    }
  }

  // Generate cryptographically secure random bytes
  generateSecureRandom(length) {
    try {
      return crypto.randomBytes(length);
    } catch (error) {
      console.error('Random generation error:', error);
      throw new Error('Failed to generate secure random bytes');
    }
  }

  // Encrypt data
  encrypt(data) {
    try {
      // Convert data to string if it's an object
      const plaintext = typeof data === 'object' ? JSON.stringify(data) : String(data);
      
      // Generate random IV
      const iv = this.generateSecureRandom(this.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, this.masterKey);
      
      // Encrypt the data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get the authentication tag
      const tag = cipher.getAuthTag();
      
      // Combine IV, tag, and encrypted data
      const result = {
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        data: encrypted
      };
      
      return Buffer.from(JSON.stringify(result)).toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data
  decrypt(encryptedData) {
    try {
      // Decode from base64
      const encryptedString = Buffer.from(encryptedData, 'base64').toString('utf8');
      const encrypted = JSON.parse(encryptedString);
      
      // Extract components
      const iv = Buffer.from(encrypted.iv, 'hex');
      const tag = Buffer.from(encrypted.tag, 'hex');
      const data = encrypted.data;
      
      // Create decipher
      const decipher = crypto.createDecipher(this.algorithm, this.masterKey);
      
      // Set the authentication tag
      decipher.setAuthTag(tag);
      
      // Decrypt the data
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Try to parse as JSON, otherwise return as string
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Hash password with salt
  hashPassword(password, salt = null) {
    try {
      if (!salt) {
        salt = this.generateSecureRandom(this.saltLength).toString('hex');
      }
      
      const hash = crypto.pbkdf2Sync(
        password,
        salt,
        100000,
        this.keyLength,
        'sha256'
      );
      
      return {
        hash: hash.toString('hex'),
        salt: salt
      };
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new Error('Failed to hash password');
    }
  }

  // Verify password
  verifyPassword(password, hash, salt) {
    try {
      const result = this.hashPassword(password, salt);
      return result.hash === hash;
    } catch (error) {
      console.error('Password verification error:', error);
      throw new Error('Failed to verify password');
    }
  }

  // Generate secure API key
  generateApiKey() {
    try {
      const prefix = 'sai_';
      const randomBytes = this.generateSecureRandom(32);
      return prefix + randomBytes.toString('hex');
    } catch (error) {
      console.error('API key generation error:', error);
      throw new Error('Failed to generate API key');
    }
  }

  // Generate secure token
  generateSecureToken(length = 32) {
    try {
      return this.generateSecureRandom(length).toString('hex');
    } catch (error) {
      console.error('Token generation error:', error);
      throw new Error('Failed to generate secure token');
    }
  }

  // Create HMAC signature
  createHmacSignature(data, key = null) {
    try {
      const signingKey = key || this.masterKey;
      const hmac = crypto.createHmac('sha256', signingKey);
      
      const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
      hmac.update(dataString);
      
      return hmac.digest('hex');
    } catch (error) {
      console.error('HMAC creation error:', error);
      throw new Error('Failed to create HMAC signature');
    }
  }

  // Verify HMAC signature
  verifyHmacSignature(data, signature, key = null) {
    try {
      const expectedSignature = this.createHmacSignature(data, key);
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('HMAC verification error:', error);
      throw new Error('Failed to verify HMAC signature');
    }
  }

  // Encrypt sensitive fields in an object
  encryptSensitiveFields(data, fieldsToEncrypt) {
    try {
      const encryptedData = { ...data };
      
      fieldsToEncrypt.forEach(field => {
        if (encryptedData[field]) {
          encryptedData[field] = this.encrypt(encryptedData[field]);
        }
      });
      
      return encryptedData;
    } catch (error) {
      console.error('Field encryption error:', error);
      throw new Error('Failed to encrypt sensitive fields');
    }
  }

  // Decrypt sensitive fields in an object
  decryptSensitiveFields(data, fieldsToDecrypt) {
    try {
      const decryptedData = { ...data };
      
      fieldsToDecrypt.forEach(field => {
        if (decryptedData[field]) {
          decryptedData[field] = this.decrypt(decryptedData[field]);
        }
      });
      
      return decryptedData;
    } catch (error) {
      console.error('Field decryption error:', error);
      throw new Error('Failed to decrypt sensitive fields');
    }
  }

  // Generate secure filename for uploaded files
  generateSecureFilename(originalFilename) {
    try {
      const timestamp = Date.now();
      const randomString = this.generateSecureRandom(16).toString('hex');
      const extension = originalFilename.split('.').pop();
      
      return `${timestamp}_${randomString}.${extension}`;
    } catch (error) {
      console.error('Secure filename generation error:', error);
      throw new Error('Failed to generate secure filename');
    }
  }

  // Create secure hash for file integrity
  createFileHash(fileBuffer) {
    try {
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } catch (error) {
      console.error('File hash creation error:', error);
      throw new Error('Failed to create file hash');
    }
  }

  // Generate secure session ID
  generateSessionId() {
    try {
      const timestamp = Date.now().toString();
      const randomBytes = this.generateSecureRandom(16);
      const combined = Buffer.concat([Buffer.from(timestamp), randomBytes]);
      
      return crypto.createHash('sha256').update(combined).digest('hex');
    } catch (error) {
      console.error('Session ID generation error:', error);
      throw new Error('Failed to generate session ID');
    }
  }

  // Health check
  healthCheck() {
    try {
      // Test encryption/decryption
      const testData = { test: 'data', timestamp: Date.now() };
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted);
      
      const encryptionWorking = JSON.stringify(testData) === JSON.stringify(decrypted);
      
      return {
        status: encryptionWorking ? 'healthy' : 'unhealthy',
        algorithm: this.algorithm,
        keyLength: this.keyLength,
        encryptionWorking,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const dataEncryption = new DataEncryption();

module.exports = dataEncryption;