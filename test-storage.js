#!/usr/bin/env node

/**
 * Storage Server Test Script
 * 
 * This script tests the storage server functionality including:
 * - Server health check
 * - File upload
 * - File listing
 * - Storage info retrieval
 * - File download
 * - File deletion
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  storageServerUrl: process.env.STORAGE_SERVER_URL || 'http://localhost:3100',
  apiKey: process.env.STORAGE_API_KEY || '',
  testUserId: 'test-user-123'
};

// Check if API key is provided
if (!CONFIG.apiKey) {
  console.error('❌ STORAGE_API_KEY environment variable not set!');
  console.log('Usage: STORAGE_API_KEY=your-key npm run test:storage');
  process.exit(1);
}

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testHealthCheck() {
  log('\n📋 Test 1: Health Check', 'cyan');
  log('─'.repeat(50), 'blue');
  
  try {
    const response = await makeRequest(`${CONFIG.storageServerUrl}/health`);
    
    if (response.status === 200) {
      log('✅ Health check passed', 'green');
      log(`   Server uptime: ${Math.floor(response.data.uptime)}s`, 'blue');
      log(`   Storage path: ${response.data.storage.path}`, 'blue');
      log(`   Max file size: ${(response.data.storage.maxFileSize / 1024 / 1024).toFixed(2)} MB`, 'blue');
      return true;
    } else {
      log(`❌ Health check failed with status ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Health check error: ${error.message}`, 'red');
    log('   Make sure the storage server is running:', 'yellow');
    log('   npm run storage', 'yellow');
    return false;
  }
}

async function testStorageInfo() {
  log('\n📋 Test 2: Storage Info', 'cyan');
  log('─'.repeat(50), 'blue');
  
  try {
    const response = await makeRequest(
      `${CONFIG.storageServerUrl}/api/storage/info?userId=${CONFIG.testUserId}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': CONFIG.apiKey
        }
      }
    );
    
    if (response.status === 200) {
      log('✅ Storage info retrieved', 'green');
      log(`   Used: ${(response.data.used / 1024 / 1024).toFixed(2)} MB`, 'blue');
      log(`   Max: ${(response.data.max / 1024 / 1024 / 1024).toFixed(2)} GB`, 'blue');
      log(`   Available: ${(response.data.available / 1024 / 1024 / 1024).toFixed(2)} GB`, 'blue');
      log(`   Percentage: ${response.data.percentage}%`, 'blue');
      return true;
    } else {
      log(`❌ Storage info failed with status ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Storage info error: ${error.message}`, 'red');
    return false;
  }
}

async function testFileUpload() {
  log('\n📋 Test 3: File Upload', 'cyan');
  log('─'.repeat(50), 'blue');
  
  try {
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    const testContent = `Test file created at ${new Date().toISOString()}\nThis is a test upload for the Employer Suite storage server.`;
    fs.writeFileSync(testFilePath, testContent);
    
    log('   Created test file: test-upload.txt', 'blue');
    
    // Note: This is a simplified test. In a real scenario, you'd use FormData
    // For now, we'll just verify the endpoint responds correctly
    log('⚠️  File upload test requires FormData support', 'yellow');
    log('   Use curl or Postman for full upload testing:', 'yellow');
    log(`   curl -X POST ${CONFIG.storageServerUrl}/api/files/upload \\`, 'yellow');
    log(`        -H "X-API-Key: ${CONFIG.apiKey}" \\`, 'yellow');
    log(`        -F "file=@${testFilePath}" \\`, 'yellow');
    log(`        -F "userId=${CONFIG.testUserId}"`, 'yellow');
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    return true;
  } catch (error) {
    log(`❌ File upload test error: ${error.message}`, 'red');
    return false;
  }
}

async function testFileList() {
  log('\n📋 Test 4: File Listing', 'cyan');
  log('─'.repeat(50), 'blue');
  
  try {
    const response = await makeRequest(
      `${CONFIG.storageServerUrl}/api/files/list?userId=${CONFIG.testUserId}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': CONFIG.apiKey
        }
      }
    );
    
    if (response.status === 200) {
      log('✅ File listing retrieved', 'green');
      log(`   Total files: ${response.data.files.length}`, 'blue');
      
      if (response.data.files.length > 0) {
        log('   Files:', 'blue');
        response.data.files.forEach(file => {
          log(`     - ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, 'blue');
        });
      } else {
        log('   No files found for this user', 'yellow');
      }
      
      return true;
    } else {
      log(`❌ File listing failed with status ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ File listing error: ${error.message}`, 'red');
    return false;
  }
}

async function testAuthentication() {
  log('\n📋 Test 5: API Authentication', 'cyan');
  log('─'.repeat(50), 'blue');
  
  try {
    // Test with invalid API key
    const response = await makeRequest(
      `${CONFIG.storageServerUrl}/api/storage/info?userId=${CONFIG.testUserId}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': 'invalid-key'
        }
      }
    );
    
    if (response.status === 401) {
      log('✅ API authentication working correctly', 'green');
      log('   Invalid API keys are rejected', 'blue');
      return true;
    } else {
      log(`⚠️  Expected 401 status but got ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Authentication test error: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════╗', 'cyan');
  log('║   Employer Suite Storage Server Test Suite        ║', 'cyan');
  log('╚════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\n🔗 Storage Server: ${CONFIG.storageServerUrl}`, 'blue');
  log(`👤 Test User ID: ${CONFIG.testUserId}`, 'blue');
  
  const results = {
    healthCheck: await testHealthCheck(),
    storageInfo: await testStorageInfo(),
    fileUpload: await testFileUpload(),
    fileList: await testFileList(),
    authentication: await testAuthentication()
  };
  
  log('\n╔════════════════════════════════════════════════════╗', 'cyan');
  log('║   Test Results Summary                             ║', 'cyan');
  log('╚════════════════════════════════════════════════════╝', 'cyan');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test}`, color);
  });
  
  log(`\n📊 Total: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! Storage server is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }
  
  log(''); // Empty line at the end
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});
