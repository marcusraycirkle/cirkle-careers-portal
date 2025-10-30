# Cirkle Group Careers Portal - Security Setup

## 🔒 Protecting Sensitive Data

This careers portal now uses a separate configuration file to keep sensitive employer credentials private.

### Important Files:

- **`config.js`** - Contains actual employer credentials (Discord IDs, PINs, webhook URLs)
  - ❌ **NEVER commit this file to GitHub**
  - ✅ Already added to `.gitignore`
  - ✅ Keep this file only on your local machine or secure server

- **`config.example.js`** - Template file showing the structure
  - ✅ Safe to commit to GitHub
  - Use this as a reference for setting up `config.js`

- **`.gitignore`** - Prevents sensitive files from being uploaded to GitHub

### Setup Instructions:

1. **The `config.js` file is already created** with your current credentials
2. **Never delete or commit `config.js`** to GitHub
3. If you need to add new employers, edit `config.js` directly
4. If deploying to a new location, copy `config.example.js` to `config.js` and fill in credentials

### What's Protected:

✅ Employer Discord IDs and PINs  
✅ Discord webhook URLs (if added)  
✅ Any future sensitive API keys

### What's Still Public:

- HTML/CSS structure (this is normal for websites)
- JavaScript logic (this is how web apps work)
- Company names and logos (public information)
- Application form structure

### Deployment:

When deploying to a web host:
1. Upload all files INCLUDING `config.js`
2. Make sure `config.js` is on the server but NOT in your GitHub repo
3. Set proper file permissions on the server if needed

### Note:

For **maximum security**, consider moving to a backend server with proper authentication in the future. This current setup provides **good protection** for a static website but is not enterprise-level security.
