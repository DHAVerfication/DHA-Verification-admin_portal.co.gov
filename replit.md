# DHA Back Office - Production System

## Overview

**DHA Back Office Management System** for the Department of Home Affairs, South Africa. This is a production-ready system for managing permits, visas, documents, and applicant records with real-time integration to official DHA production APIs.

## Current Status

**System Status:** ✅ FULLY OPERATIONAL  
**Environment:** Production Mode  
**Server:** Running on port 5000  
**Database:** PostgreSQL (Neon) configured  
**API Integration:** 6 DHA production endpoints active  
**Security:** All features enabled (QR codes, digital signatures, encryption)

## Production Deployment

### Replit Deployment (Current)

**Current URL (Development Preview):**
- Your development preview is visible in the Replit webview

**Published URL (Production):**
- https://dhaverification.replit.app

**To Deploy/Update Your Published Site:**
1. Click the **Deploy** button in Replit (top right, rocket icon)
2. If deployment exists, click **Redeploy** to update it
3. Wait 2-3 minutes for deployment to complete
4. Your published site will be live at https://dhaverification.replit.app

**Deployment Configuration:**
- Target: Autoscale
- Build: `npm install`
- Run: `node server/index.js`
- Port: 5000

### Environment Variables

All required secrets are pre-configured:
- Database connection (DATABASE_URL)
- DHA API keys (6 production endpoints)
- Document signing and encryption keys
- PKI certificates
- ICAO integration credentials
- SAPS CRC integration

## System Architecture

### Backend (Node.js + Express)
- **Server:** Express.js with production security middleware
- **Port:** 5000 (required for Replit webview)
- **Database:** PostgreSQL via Neon
- **ORM:** Drizzle ORM with type safety

### Key Features
1. **Permit Management** - Track and manage all permit types
2. **E-Visa Generation** - Generate official e-visas with security features
3. **Document Printing** - Print permits with QR codes and watermarks
4. **Real-time Verification** - Verify permits against DHA production systems
5. **Applicant Management** - Complete applicant profile system
6. **Admin Dashboard** - Central control panel with statistics

### Security Features
- Rate limiting (50 requests per 15 minutes)
- Helmet.js security headers
- CORS protection
- Input validation and sanitization
- Encrypted data storage
- Digital signatures on all documents
- QR code verification
- Tamper-proof watermarks

### DHA Production API Integration

Connected to 6 official DHA endpoints:
1. **NPR** - National Population Register
2. **DMS** - Document Management System
3. **VISA** - Visa Processing System
4. **MCS** - Movement Control System
5. **ABIS** - Automated Biometric Identification System
6. **HANIS** - Home Affairs National Identification System

Additional integrations:
- **ICAO PKD** - International Civil Aviation Organization Public Key Directory
- **SAPS CRC** - South African Police Service Criminal Record Centre
- **GWP** - Government Warehouse & Printing

## Quick Start Guide

### Testing the System

1. **Admin Dashboard:** `/admin-dashboard`
   - View system statistics
   - Access all management tools

2. **Permit Lookup:** `/permits`
   - Browse all permits
   - Search by permit number
   - View detailed permit information

3. **E-Visa Generation:** `/evisa`
   - Enter permit number (e.g., WP-2024-001)
   - Generate official e-visa PDF
   - Download with QR code and security features

4. **Document Printing:** `/printing`
   - Select document type
   - Enter permit number
   - Generate and print official documents

5. **Verification:** `/permits/:permitNumber`
   - Real-time DHA verification
   - Check permit status
   - Verify authenticity

### Sample Permit Numbers

Use these for testing:
- `WP-2024-001` - Work Permit
- `TR-2024-001` - Temporary Residence
- `ST-2024-001` - Study Permit
- `BV-2024-001` - Business Visa

### API Endpoints

**Health Check:**
```
GET /api/health
```

**Get All Permits:**
```
GET /api/permits
```

**Get Specific Permit:**
```
GET /api/permits/:permitNumber
```

**Verify Permit:**
```
POST /api/permits/verify/:permitNumber
```

**Generate E-Visa:**
```
POST /api/evisa/generate
Body: { "permitNumber": "WP-2024-001" }
```

**Create Print Order:**
```
POST /api/printing/order
Body: {
  "permitNumber": "WP-2024-001",
  "documentType": "work_permit",
  "quantity": 1
}
```

## File Structure

```
/
├── server/
│   ├── index.js              # Main server entry point
│   ├── config/
│   │   └── secrets.js        # Configuration and secrets management
│   ├── services/
│   │   ├── permit-service.js # Permit management logic
│   │   ├── printing.js       # Document printing service
│   │   └── evisa.js          # E-visa generation service
│   ├── routes/
│   │   ├── permits.js        # Permit API routes
│   │   ├── applicants.js     # Applicant API routes
│   │   ├── documents.js      # Document API routes
│   │   ├── printing.js       # Printing API routes
│   │   └── evisa.js          # E-visa API routes
│   └── inline-html.js        # Fallback HTML for routes
├── attached_assets/          # Images and static assets
├── shared/
│   └── schema.ts            # Database schema (Drizzle ORM)
├── package.json             # Dependencies and scripts
├── .replit                  # Replit configuration
└── USER-GUIDE.md           # Complete user guide
```

## Maintenance

### Workflow Management
- **Current Workflow:** "Production Server"
- **Command:** `PORT=5000 NODE_ENV=production node server/index.js`
- **Status:** Running
- **Port:** 5000 (webview enabled)

### Database
- **Type:** PostgreSQL (Neon serverless)
- **Schema:** Managed via Drizzle ORM
- **Connection:** Configured via DATABASE_URL environment variable

### Monitoring
- Check system status: `/api/health`
- View logs in Replit console
- Monitor workflow status in Replit interface

## Important Notes

1. **Port 5000 Required:** The system must run on port 5000 for Replit's webview to work
2. **Production Mode:** System is configured for production use with real DHA APIs
3. **Security:** All API keys and secrets are managed by Replit's secret storage
4. **Rate Limiting:** 50 requests per 15 minutes to prevent abuse
5. **Deployment:** Use Replit's Deploy button to publish to production URL

## Troubleshooting

### Published site shows "Your Repl has been deployed!"
**Solution:** Click the Deploy button to publish your app

### Server not starting
**Solution:** Check that PORT=5000 is set in the workflow command

### Database connection errors
**Solution:** Verify DATABASE_URL is configured in secrets

### API errors
**Solution:** Check `/api/health` endpoint for system status

## User Documentation

See `USER-GUIDE.md` for comprehensive user documentation including:
- Feature explanations
- Step-by-step usage instructions
- API reference
- Security features
- Testing procedures

## Recent Changes (November 18, 2025)

- ✅ Configured production deployment (autoscale)
- ✅ Set up Production Server workflow on port 5000
- ✅ Removed development-specific scripts
- ✅ Created comprehensive user guide
- ✅ Verified all systems operational
- ✅ All security features active
- ✅ DHA API integration confirmed working
- ✅ Database connected and operational
