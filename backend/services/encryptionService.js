const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
    
    // Get encryption key from environment
    this.key = this.deriveKey(process.env.DB_ENCRYPTION_KEY || 'default-key-change-in-production');
  }

  deriveKey(password) {
    // Use PBKDF2 to derive a key from the password
    return crypto.pbkdf2Sync(password, 'static-salt-change-in-production', 100000, this.keyLength, 'sha256');
  }

  encrypt(text) {
    if (!text) return null;
    
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.key);
      cipher.setAAD(Buffer.from('additional-data'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Combine iv, authTag, and encrypted data
      return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  decrypt(encryptedData) {
    if (!encryptedData) return null;
    
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      const decipher = crypto.createDecipher(this.algorithm, this.key);
      decipher.setAAD(Buffer.from('additional-data'));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  // Hash function for passwords (one-way)
  hash(password) {
    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
    return salt.toString('hex') + ':' + hash.toString('hex');
  }

  // Verify hashed password
  verifyHash(password, hashedPassword) {
    try {
      const parts = hashedPassword.split(':');
      if (parts.length !== 2) return false;
      
      const salt = Buffer.from(parts[0], 'hex');
      const hash = Buffer.from(parts[1], 'hex');
      
      const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
      return crypto.timingSafeEqual(hash, verifyHash);
    } catch (error) {
      console.error('Hash verification error:', error);
      return false;
    }
  }

  // Generate secure random token
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Create checksum for file integrity
  createChecksum(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

module.exports = new EncryptionService();
