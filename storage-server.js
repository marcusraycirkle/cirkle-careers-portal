#!/usr/bin/env node

/**
 * Employer Suite Storage Server
 * 
 * This server handles file storage for the Employer Suite application.
 * It runs on a Lubuntu machine and provides secure file upload/download capabilities.
 * 
 * Features:
 * - Secure API key authentication
 * - Per-user storage quotas (10GB default)
 * - File upload/download/delete
 * - Storage usage tracking
 * - Rate limiting
 * - CORS support
 * - Comprehensive logging
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const morgan = require('morgan');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config({ path: './storage-server.env' });

// Configuration
const CONFIG = {
  port: process.env.PORT || 3100,
  storagePath: process.env.STORAGE_PATH || '/var/employersuit/storage',
  apiKey: process.env.API_KEY || '',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600, // 100MB
  maxUserStorage: 10 * 1024 * 1024 * 1024, // 10GB
  corsOrigin: process.env.CORS_ORIGIN || '*',
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Validate configuration
if (!CONFIG.apiKey) {
  console.error('❌ API_KEY not set in environment variables!');
  process.exit(1);
}

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: CONFIG.corsOrigin,
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));
app.use(express.json());

// Rate limiter
const rateLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 60, // per 60 seconds
});

// Rate limiting middleware
const rateLimiterMiddleware = async (req, res, next) => {
  try {
    const key = req.ip;
    await rateLimiter.consume(key);
    next();
  } catch (error) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: error.msBeforeNext / 1000
    });
  }
};

app.use(rateLimiterMiddleware);

// API Key authentication middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== CONFIG.apiKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  
  next();
};

// Apply API key authentication to all /api routes
app.use('/api', authenticateApiKey);

// Ensure storage directory exists
async function ensureStorageDirectory() {
  try {
    await fs.access(CONFIG.storagePath);
  } catch {
    await fs.mkdir(CONFIG.storagePath, { recursive: true });
    console.log(`📁 Created storage directory: ${CONFIG.storagePath}`);
  }
}

// Get user storage path
function getUserStoragePath(userId) {
  return path.join(CONFIG.storagePath, userId);
}

// Calculate directory size recursively
async function getDirectorySize(dirPath) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    let size = 0;
    
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        size += await getDirectorySize(filePath);
      } else {
        const stats = await fs.stat(filePath);
        size += stats.size;
      }
    }
    
    return size;
  } catch (error) {
    return 0;
  }
}

// Get user's current storage usage
async function getUserStorageUsage(userId) {
  const userPath = getUserStoragePath(userId);
  
  try {
    await fs.access(userPath);
    return await getDirectorySize(userPath);
  } catch {
    return 0;
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userId = req.body.userId || req.headers['x-user-id'];
    
    if (!userId) {
      return cb(new Error('User ID is required'));
    }
    
    const userPath = getUserStoragePath(userId);
    
    try {
      await fs.mkdir(userPath, { recursive: true });
      cb(null, userPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename while preserving extension
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(4).toString('hex');
    cb(null, `${nameWithoutExt}-${timestamp}-${randomStr}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: CONFIG.maxFileSize
  },
  fileFilter: async (req, file, cb) => {
    const userId = req.body.userId || req.headers['x-user-id'];
    
    if (!userId) {
      return cb(new Error('User ID is required'));
    }
    
    // Check if user has enough storage space
    const currentUsage = await getUserStorageUsage(userId);
    
    if (currentUsage >= CONFIG.maxUserStorage) {
      return cb(new Error('Storage quota exceeded'));
    }
    
    // Check if this file would exceed quota
    if (currentUsage + file.size > CONFIG.maxUserStorage) {
      return cb(new Error('File too large - would exceed storage quota'));
    }
    
    cb(null, true);
  }
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    storage: {
      path: CONFIG.storagePath,
      maxUserStorage: CONFIG.maxUserStorage,
      maxFileSize: CONFIG.maxFileSize
    }
  });
});

// Get storage info for a user
app.get('/api/storage/info', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const used = await getUserStorageUsage(userId);
    const max = CONFIG.maxUserStorage;
    const available = max - used;
    const percentage = (used / max) * 100;
    
    res.json({
      userId,
      used,
      max,
      available,
      percentage: Math.round(percentage * 100) / 100,
      files: await listUserFiles(userId)
    });
  } catch (error) {
    console.error('Error getting storage info:', error);
    res.status(500).json({ error: 'Failed to get storage info' });
  }
});

// List files for a user
async function listUserFiles(userId) {
  const userPath = getUserStoragePath(userId);
  
  try {
    await fs.access(userPath);
    const files = await fs.readdir(userPath, { withFileTypes: true });
    
    const fileList = await Promise.all(
      files
        .filter(file => file.isFile())
        .map(async (file) => {
          const filePath = path.join(userPath, file.name);
          const stats = await fs.stat(filePath);
          
          return {
            name: file.name,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            type: path.extname(file.name).slice(1)
          };
        })
    );
    
    return fileList;
  } catch {
    return [];
  }
}

app.get('/api/files/list', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const files = await listUserFiles(userId);
    res.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Upload file
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const userId = req.body.userId || req.headers['x-user-id'];
    const currentUsage = await getUserStorageUsage(userId);
    
    res.json({
      success: true,
      file: {
        name: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: path.extname(req.file.originalname).slice(1),
        path: req.file.path,
        uploaded: new Date().toISOString()
      },
      storage: {
        used: currentUsage,
        max: CONFIG.maxUserStorage,
        available: CONFIG.maxUserStorage - currentUsage
      }
    });
    
    console.log(`✅ File uploaded: ${req.file.filename} by user ${userId}`);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

// Download file
app.get('/api/files/download/:userId/:filename', async (req, res) => {
  try {
    const { userId, filename } = req.params;
    const filePath = path.join(getUserStoragePath(userId), filename);
    
    // Security check: ensure the file is within user's directory
    const normalizedPath = path.normalize(filePath);
    const userDir = getUserStoragePath(userId);
    
    if (!normalizedPath.startsWith(userDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Get original filename from the stored filename
    const stats = await fs.stat(filePath);
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    
    const fileStream = fsSync.createReadStream(filePath);
    fileStream.pipe(res);
    
    console.log(`📥 File downloaded: ${filename} by user ${userId}`);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Delete file
app.delete('/api/files/delete/:userId/:filename', async (req, res) => {
  try {
    const { userId, filename } = req.params;
    const filePath = path.join(getUserStoragePath(userId), filename);
    
    // Security check: ensure the file is within user's directory
    const normalizedPath = path.normalize(filePath);
    const userDir = getUserStoragePath(userId);
    
    if (!normalizedPath.startsWith(userDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Delete file
    await fs.unlink(filePath);
    
    const currentUsage = await getUserStorageUsage(userId);
    
    res.json({
      success: true,
      message: 'File deleted successfully',
      storage: {
        used: currentUsage,
        max: CONFIG.maxUserStorage,
        available: CONFIG.maxUserStorage - currentUsage
      }
    });
    
    console.log(`🗑️  File deleted: ${filename} by user ${userId}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get file metadata
app.get('/api/files/metadata/:userId/:filename', async (req, res) => {
  try {
    const { userId, filename } = req.params;
    const filePath = path.join(getUserStoragePath(userId), filename);
    
    // Security check
    const normalizedPath = path.normalize(filePath);
    const userDir = getUserStoragePath(userId);
    
    if (!normalizedPath.startsWith(userDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const stats = await fs.stat(filePath);
    
    res.json({
      name: filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      type: path.extname(filename).slice(1)
    });
  } catch (error) {
    console.error('Error getting file metadata:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

// Admin: Get total storage usage across all users
app.get('/api/admin/storage/total', async (req, res) => {
  try {
    const totalSize = await getDirectorySize(CONFIG.storagePath);
    const users = await fs.readdir(CONFIG.storagePath, { withFileTypes: true });
    const userCount = users.filter(u => u.isDirectory()).length;
    
    res.json({
      totalSize,
      userCount,
      maxTotalStorage: CONFIG.maxUserStorage * userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting total storage:', error);
    res.status(500).json({ error: 'Failed to get total storage' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      maxSize: CONFIG.maxFileSize
    });
  }
  
  if (error.message === 'Storage quota exceeded') {
    return res.status(413).json({
      error: 'Storage quota exceeded',
      maxStorage: CONFIG.maxUserStorage
    });
  }
  
  res.status(500).json({
    error: error.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
async function startServer() {
  try {
    // Ensure storage directory exists
    await ensureStorageDirectory();
    
    // Start listening
    app.listen(CONFIG.port, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════════╗');
      console.log('║   Employer Suite Storage Server                   ║');
      console.log('╚════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`🚀 Server running on port ${CONFIG.port}`);
      console.log(`📁 Storage path: ${CONFIG.storagePath}`);
      console.log(`💾 Max user storage: ${(CONFIG.maxUserStorage / 1024 / 1024 / 1024).toFixed(2)} GB`);
      console.log(`📤 Max file size: ${(CONFIG.maxFileSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`🌍 CORS origin: ${CONFIG.corsOrigin}`);
      console.log(`🔐 API authentication: Enabled`);
      console.log(`⚡ Environment: ${CONFIG.nodeEnv}`);
      console.log('');
      console.log('📋 Available endpoints:');
      console.log('   GET  /health');
      console.log('   GET  /api/storage/info');
      console.log('   GET  /api/files/list');
      console.log('   POST /api/files/upload');
      console.log('   GET  /api/files/download/:userId/:filename');
      console.log('   DELETE /api/files/delete/:userId/:filename');
      console.log('   GET  /api/files/metadata/:userId/:filename');
      console.log('   GET  /api/admin/storage/total');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
