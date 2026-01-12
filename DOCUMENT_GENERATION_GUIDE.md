# Document Generation System Guide

## Overview

The Employer Suite now includes a professional document generation system that allows you to create official documents from templates with fillable form fields.

## Available Templates

### 1. **Biweekly Payslip** 💰
- **Template URL**: [Google Doc](https://docs.google.com/document/d/1xVRHQ5vH4pbMpUeEDBKIbGL9TBup7ChHkRYddZ_E6Ek/edit?usp=sharing)
- **Fields**:
  - Employee Name
  - Employee ID
  - Pay Period (e.g., Jan 1-15, 2026)
  - Gross Pay (£)
  - Deductions (£)
  - Net Pay (£)
  - Hours Worked (optional)
  - Overtime Hours (optional)

### 2. **Suspension Notice** ⚠️
- **Template URL**: [Google Doc](https://docs.google.com/document/d/1ndQSg6q9hhtUolTwHRZiV8AuK1JrPBCAOU8U-j3IYr0/edit?usp=sharing)
- **Fields**:
  - Employee Name
  - Position
  - Suspension Start Date
  - Reason for Suspension
  - Investigation Details (optional)
  - Expected Return Date (optional)
  - Manager Name
  - Letter Date

### 3. **Dismissal Letter** 🚫
- **Template URL**: [Google Doc](https://docs.google.com/document/d/1ndQSg6q9hhtUolTwHRZiV8AuK1JrPBCAOU8U-j3IYr0/edit?usp=sharing)
- **Fields**:
  - Employee Name
  - Position
  - Termination Date
  - Reason for Dismissal
  - Final Pay Date (optional)
  - Company Property to Return (optional)
  - Manager Name
  - Letter Date

### 4. **Blank Document** 📄
- **Template URL**: [Google Doc](https://docs.google.com/document/d/15wm-CrohvK3JgEJjItYFd2DpS5uYSk_Iu2h-p7KWpxw/edit?usp=sharing)
- **Fields**:
  - Document Title
  - Content

## How to Use

### Step 1: Access Documents Tab
1. Go to https://allcareers.cirkledevelopment.co.uk
2. Login to the Employer Portal
3. Click on **"Documents"** from the home dashboard

### Step 2: Select a Template
1. Browse the available categories:
   - **Payslips** (1 template)
   - **Disciplinary** (2 templates)
   - **General** (1 template)
2. Click on the template button you want to use

### Step 3: Fill Out the Form
1. A modal will appear with fillable form fields
2. Fill in all **required fields** (marked with *)
3. Optional fields can be left blank if not needed
4. All fields validate automatically

### Step 4: Generate Document
1. Click **"Generate Document"** button
2. The system will:
   - Validate all required fields
   - Save document data to storage server
   - Show you a success modal with document details

### Step 5: Complete in Google Docs
1. Click **"📄 Open Template"** button in the success modal
2. The Google Doc template will open in a new tab
3. Fill in the blank spots with the information displayed
4. Download or share the completed document

## Technical Details

### Storage Server Integration
- **Server URL**: `http://192.168.1.112:3100`
- **API Endpoint**: `POST /api/documents/generate`
- **Authentication**: API Key required (already configured)
- **Storage Location**: `/var/employersuit/storage/documents/`

### Document Storage
Each generated document is saved as a JSON file containing:
```json
{
  "id": "unique-document-id",
  "templateName": "Biweekly Payslip",
  "googleDocUrl": "https://docs.google.com/...",
  "data": {
    "employeeName": "John Doe",
    "employeeId": "EMP001",
    ...
  },
  "createdBy": "username",
  "createdAt": "2026-01-12T..."
}
```

### API Endpoints

#### Generate Document
```
POST http://192.168.1.112:3100/api/documents/generate
Headers:
  Content-Type: application/json
  X-API-Key: your-api-key

Body:
{
  "templateName": "Biweekly Payslip",
  "googleDocUrl": "...",
  "data": { ... },
  "createdBy": "username"
}
```

#### List Documents
```
GET http://192.168.1.112:3100/api/documents/list
Headers:
  X-API-Key: your-api-key
```

## Benefits

✅ **Professional**: Official document templates with consistent formatting
✅ **Fast**: Fill out forms in seconds instead of minutes
✅ **Organized**: All documents saved with metadata for tracking
✅ **Secure**: API key authentication and CORS protection
✅ **Flexible**: Blank template for custom documents
✅ **Integrated**: Works seamlessly with your storage server

## Troubleshooting

### "Failed to generate document"
- **Check**: Ensure storage server is running (`http://192.168.1.112:3100/health`)
- **Solution**: Restart storage server with `./start-storage-server.sh`

### "Please fill in all required fields"
- **Check**: All fields marked with * must be filled
- **Solution**: Complete all required fields before submitting

### "Connection refused"
- **Check**: Storage server IP address is correct
- **Solution**: Verify your Linux machine IP is `192.168.1.112` and port `3100` is open

## Future Enhancements

- 📧 Email documents directly to employees
- 🖨️ PDF generation and download
- 📝 Custom template creation
- 🔍 Document search and filtering
- 📊 Document analytics and reporting

## Support

For issues or questions:
- Email: careers@cirkledevelopment.co.uk
- Check storage server logs for errors
- Verify storage server is running and accessible

---

**Last Updated**: January 12, 2026
**Version**: 1.0.0
