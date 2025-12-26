# Portfolio Website Documentation

## 📋 Project Overview

A full-stack authentication application built with React frontend and Node.js/Express backend, featuring user registration, login, profile management, and secure cookie-based authentication. This project serves as both a portfolio demonstration and a complete authentication system.

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Windows OS (for environment variable setup)

### Setup Instructions

1. **Clone and Install Dependencies**

   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd frontend
   npm install
   ```

2. **Configure Environment Variables**
   Run the setup script:

   ```batch
   # Double-click or run:
   setup-env-vars.bat
   ```

   Or manually configure (see Environment Variables section below).

3. **Set Gmail App Password** (Required for email features)

   ```cmd
   setx WEBSITE_EMAIL_PASS "your-16-char-app-password"
   ```

4. **Start the Application**

   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend  
   npm start
   ```

The backend runs on `http://localhost:5001` and frontend on `http://localhost:8000`.

---

## 🏗️ Tech Stack

### Frontend

- **React** - Component-based UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Custom CSS** - Responsive styling

### Backend

- **Node.js & Express.js** - Server runtime and web framework
- **SQLite & Sequelize** - Database and ORM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **cookie-parser** - Secure cookie handling
- **nodemailer** - Email service integration

### Development Tools

- **Nodemon** - Auto-reloading development server
- **Cloudflare Tunnel** - Local development tunnel
- **Git & GitHub** - Version control

---

## ✅ Features Implemented

### Authentication System

- **User Registration** - Email/password signup with validation
- **User Login** - Secure authentication with JWT tokens
- **Password Reset** - Email-based password reset flow
- **Profile Management** - View and edit user information
- **Secure Logout** - Proper session termination

### Security Features

- **Password Hashing** - bcryptjs with salt
- **JWT Authentication** - 7-day token expiration
- **Secure Cookies** - httpOnly, secure, sameSite protection
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - Email format and password strength validation
- **CORS Configuration** - Proper cross-origin setup
- **Security Headers** - Helmet middleware for additional protection

### Database & Backup System

- **SQLite Database** - File-based storage with automatic table creation
- **Automated Backups** - Daily scheduled backups with integrity verification
- **Backup Management** - Manual backup/restore via API endpoints
- **Data Encryption** - AES-256-GCM encryption for sensitive data

### User Interface

- **Responsive Design** - Mobile-friendly interface
- **Protected Routes** - Authentication-required pages
- **Loading States** - User feedback during operations
- **Error Handling** - Proper error messages and validation
- **Dashboard System** - Multi-tab interface with analytics

---

## 🔐 Security Implementation

### Authentication Security

- **Cryptographically Secure JWT Secrets** - 256-bit random keys
- **Cookie-Based Token Storage** - XSS-safe httpOnly cookies
- **CSRF Protection** - sameSite='strict' cookie settings
- **Password Strength Requirements** - Minimum security standards
- **Session Management** - Proper login/logout handling

### Data Protection

- **Database Encryption** - Application-level encryption for sensitive data
- **Backup Integrity** - SHA-256 checksums for all backups
- **Environment Variable Security** - No secrets in code files
- **Access Control** - Protected API endpoints with authentication

### Production Readiness

- **Security Headers** - Helmet middleware implementation
- **HTTPS Enforcement** - Secure transport in production
- **Rate Limiting** - Prevention of abuse and attacks
- **Input Sanitization** - Clean data handling

---

## 📁 Project Structure

``` plaintext
website/
├── backend/
│   ├── config/
│   │   └── database.js         # SQLite/Sequelize setup
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   ├── rateLimitMiddleware.js
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── User.js             # User model with validation
│   │   └── index.js
│   ├── routes/
│   │   ├── userRoutes.js       # Authentication endpoints
│   │   ├── backupRoutes.js
│   │   └── ...
│   ├── services/
│   │   ├── backupService.js    # Backup management
│   │   ├── emailService.js     # Email notifications
│   │   └── encryptionService.js
│   ├── backups/                # Database backup storage
│   ├── package.json
│   └── server.js               # Express server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── Chat.js
│   │   │   └── ...
│   │   ├── context/
│   │   │   ├── AuthContext.js  # Global auth state
│   │   │   └── ThemeContext.js
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── ...
│   │   ├── utils/
│   │   │   └── api.js           # Axios configuration
│   │   └── App.js               # Main routing setup
│   ├── public/
│   └── package.json
├── docs/                       # This consolidated documentation
├── config.yml                  # Cloudflare tunnel configuration
└── launch.vbs                  # Windows launch script
```

---

## 🔧 Environment Variables

### Required Variables

All environment variables are set at the Windows system level for security.

```bash
# Authentication
JWT_SECRET                  # Cryptographically secure JWT signing key

# Server Configuration  
WEBSITE_PORT               # Backend server port (5001)
WEBSITE_FRONTEND_URL       # Frontend URL (http://localhost:8000)
WEBSITE_NODE_ENV           # Environment mode (development)

# Email Configuration
WEBSITE_EMAIL_USER         # Gmail account (ayushmaurya2003@gmail.com)
WEBSITE_EMAIL_FROM         # From address (noreply@ayushmaurya.dev)
WEBSITE_EMAIL_PASS         # Gmail app password (required for email features)
```

### Gmail App Password Setup

1. Enable 2-Factor Authentication in Google Account
2. Go to Security → 2-Step Verification → App passwords
3. Generate password for "Mail" app
4. Set the environment variable:

   ```cmd
   setx WEBSITE_EMAIL_PASS "your-16-char-app-password"
   ```

---

## 📊 API Endpoints

### Authentication Routes (`/api/users/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create new user account | No |
| POST | `/login` | Authenticate user | No |
| POST | `/logout` | End user session | Yes |
| GET | `/profile` | Get user profile data | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |

### Backup Routes (`/api/backup/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create` | Create manual backup | Yes |
| GET | `/list` | List all backups | Yes |
| POST | `/restore/:filename` | Restore from backup | Yes |
| POST | `/verify/:filename` | Verify backup integrity | Yes |
| GET | `/status` | Get backup system status | Yes |

---

## 🧪 Testing

### Manual Testing

```bash
# Test user registration
curl -X POST http://localhost:5001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "testpass123"}'

# Test login
curl -X POST http://localhost:5001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'
```

### Password Reset Testing

1. Navigate to `/forgot-password`
2. Enter email address
3. Check backend console for reset URL (development mode)
4. Use URL to reset password
5. Test login with new password

### Developer Account

- Email: `ayushmaurya2003@gmail.com`
- Password: `dev123456`
- Role: Developer (auto-created on server start)

---

## 🛠️ Development Scripts

### Backend Scripts

```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm run backup     # Create manual backup
npm run backup:daily    # Create daily backup
npm run backup:list     # List all backups
npm run backup:restore  # Restore from backup
```

### Frontend Scripts

```bash
npm start          # Start development server
npm run build      # Create production build
npm test           # Run test suite
```

---

## 🚀 Deployment Guide

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Gmail app password set for email features
- [ ] Database backups verified
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] CORS configured for production domains

### Recommended Hosting

- **Frontend**: Vercel, Netlify
- **Backend**: Render, Heroku, Railway
- **Database**: File-based SQLite (included in deployment)

### Environment Configuration

1. Set all `WEBSITE_*` environment variables in hosting provider
2. Configure CORS for production frontend URL
3. Enable HTTPS and secure cookie settings
4. Set up automated backups for production database

---

## 🔍 Troubleshooting

### Common Issues

#### "Incorrect password" errors

- **Cause**: JWT token expiration
- **Solution**: Token expiration extended to 7 days, automatic logout on expiration

#### Database reset on restart

- **Cause**: `force: true` in development mode
- **Solution**: Changed to `alter: true` to preserve data

#### Environment variables not found

- **Cause**: New terminal session required after `setx` commands
- **Solution**: Restart VS Code or open new terminal

#### Email features not working

- **Cause**: Gmail app password not set
- **Solution**: Generate and set Gmail app password in environment variables

### Security Issues Fixed

- ✅ Weak JWT secret replaced with cryptographically secure key
- ✅ Rate limiting implemented on authentication endpoints
- ✅ Security headers added via Helmet middleware
- ✅ Secure cookie implementation with httpOnly flags
- ✅ Input validation and sanitization improved

---

## 📈 Development History

### Phase 1: Foundation ✅

- Project scaffolding and environment setup
- Backend API with Express.js and SQLite
- Frontend React application with routing

### Phase 2: Authentication ✅

- User registration and login system
- JWT-based authentication
- Protected routes and middleware

### Phase 3: Security Hardening ✅

- Password reset flow implementation
- Secure cookie-based authentication
- Rate limiting and security headers
- Environment variable migration

### Phase 4: Advanced Features ✅

- Database backup system with encryption
- Email service integration
- Admin dashboard with analytics
- Multi-environment configuration

### Phase 5: Production Readiness 🚧

- Deployment configuration
- Performance optimization
- Monitoring and logging
- Documentation completion

---

## 🤝 Contributing

This is a portfolio project demonstrating full-stack development capabilities. The codebase follows industry best practices for:

- **Security**: Enterprise-grade authentication and data protection
- **Architecture**: Clean separation of concerns and modular design
- **Documentation**: Comprehensive guides and API documentation
- **Testing**: Manual testing procedures and validation scripts

---

## 📞 Contact Information

- **Developer**: Ayush Maurya
- **Email**: [ayushmaurya2003@gmail.com]
- **LinkedIn**: [linkedin.com/in/ayushmaurya](https://linkedin.com/in/ayushmaurya)
- **Website**: ayushmaurya.dev

---

## 📄 License

This project is part of a personal portfolio and is intended for demonstration purposes. All code is licensed under the Apache License 2.0.

---

### Last Updated: July 29, 2025
