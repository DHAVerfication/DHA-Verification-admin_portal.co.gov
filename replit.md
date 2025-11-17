# Ultra Queen AI Raeesa - Multi-Provider AI Integration Platform

## Overview

Ultra Queen AI Raeesa is a comprehensive multi-provider AI integration platform connecting over 40 APIs, including leading AI providers (OpenAI, Anthropic, Perplexity, Mistral, Google Gemini), web2/web3 services, blockchain networks, government databases, and cloud services. The platform features quantum computing simulation, self-upgrade capabilities, and is designed for deployment via GitHub to Railway or Render platforms. It maintains and enhances the original DHA Digital Services Platform functionality with advanced AI.

## User Preferences

Preferred communication style: Simple, everyday language.
Deployment mode: Railway/Render via GitHub (NOT Replit due to 502 errors)
Access Level: Queen Raeesa exclusive access with biometric authentication
AI Aesthetic: Dark theme with golden Queen Raeesa theme

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern component-based UI using React 18 with TypeScript.
- **Vite Build System**: Fast development and optimized production builds.
- **Radix UI Components**: Accessible, unstyled UI primitives.
- **TailwindCSS**: Utility-first CSS framework with custom DHA government color scheme.
- **React Query**: Server state management with caching.
- **Wouter**: Lightweight client-side routing.
- **Mobile-First Design**: Responsive design optimized for mobile devices.

### Backend Architecture
- **Express.js + TypeScript**: RESTful API server with comprehensive middleware stack.
- **Modular Route Structure**: Organized routes for health, AI assistant, monitoring, biometric, and printing services.
- **Multi-Server Setup**: Optimized for production deployment with military-grade security configurations.
- **WebSocket Support**: Real-time communication for system status and notifications.
- **Serverless Deployment**: Netlify Functions support for scalable cloud deployment.

### Database & ORM
- **Drizzle ORM**: Type-safe database operations with PostgreSQL support.
- **Comprehensive Schema**: Supports 21 DHA document types, user management, audit trails, and biometric profiles (`permits`, `printOrders`, `verificationAudit`, `users` tables).
- **SQLite Fallback**: Production mode support with automatic table creation.
- **Migration System**: Database versioning and schema evolution support.

### Security & Compliance
- **Military-Grade Security**: Multi-layered security with rate limiting, helmet protection, and CORS.
- **POPIA Compliance**: Privacy protection with consent management and data governance.
- **Biometric Encryption**: Secure storage of biometric templates with AES-256 encryption.
- **Audit Trail**: Comprehensive logging for government compliance requirements.
- **JWT Authentication**: Secure token-based authentication with role-based access control.

### AI & Document Processing
- **OpenAI GPT-5 Integration**: Advanced AI assistant with streaming responses.
- **Document Generation**: Authentic PDF generation for all 21 DHA document types with advanced security features (microtext, security threads, holograms, watermarks, guilloche patterns, authentic gradients).
- **OCR Integration**: Enhanced South African document OCR with field extraction.
- **Multi-Language Support**: All 11 official South African languages.
- **Voice Services**: Speech-to-text and text-to-speech capabilities.

### Government Integrations
- **Datanamix Client**: Official DHA data partner integration with OAuth2 + mTLS.
- **DHA Production API Endpoints**: Integration with NPR, DMS, VISA, MCS, ABIS, HANIS.
- **NPR Adapter**: National Population Register verification services.
- **ABIS Integration**: Automated Biometric Identification System connectivity.
- **MRZ Parser**: ICAO-compliant Machine Readable Zone processing.
- **PKD Validation**: Public Key Directory validation for document authentication.
- **SAPS CRC Integration**: South African Police Service Criminal Record Centre.
- **GWP (Government Warehouse & Printing) Integration**: High-priority hard copy printing and delivery services.

### Monitoring & Operations
- **Autonomous Monitoring**: Self-healing system with proactive maintenance.
- **Health Checks**: Comprehensive system health monitoring and reporting for 9 production endpoints.
- **Error Tracking**: Advanced error detection and correlation.
- **Performance Metrics**: Real-time system performance monitoring.
- **Circuit Breakers**: Resilience patterns for external service failures.

## External Dependencies

### Core Technologies
- **Node.js/Express**: Server runtime and web framework.
- **PostgreSQL**: Primary database.
- **Redis**: Caching and session storage (optional).

### AI & Machine Learning
- **OpenAI API**: GPT-5 language model integration.
- **Anthropic API**: Alternative AI provider (optional).
- **Perplexity AI**: Language model integration.
- **Mistral AI**: Language model integration.
- **Google Gemini**: Language model integration.

### Government Services
- **Datanamix**: Official DHA data partner.
- **DHA APIs**: National Population Register, Document Management System, Visa, Movement Control System, Automated Biometric Identification System, Home Affairs National Identification System.
- **SITA**: Government IT infrastructure integration.
- **ICAO PKD**: Public Key Directory for document validation.
- **SAPS CRC**: Criminal Record Centre for verification.
- **GWP (Government Warehouse & Printing)**: For hard copy printing services.

### Security & Compliance
- **PKI Infrastructure**: Government certificate authorities.
- **HSM Integration**: Hardware Security Modules for key management.

### Cloud & Infrastructure
- **Netlify**: Deployment platform with Functions support.
- **GitHub**: Source code repository and CI/CD.
- **Railway/Render**: Preferred deployment targets.

### External APIs
- **Voice Services**: For speech processing.
- **Document Services**: For PDF generation and OCR.
- **Blockchain Networks**: For web3 integration.

### Development Tools
- **Vite**: Frontend build tooling.
- **TypeScript**: Type safety across the stack.
- **Drizzle Kit**: Database migration and introspection tools.