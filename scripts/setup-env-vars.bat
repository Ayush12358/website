@echo off
echo Setting up environment variables for Website Project...

:: Authentication
setx JWT_SECRET "8805249ff8a11eaaf0d5b947d004ffbd15df4a716878d9641e557b1db20d77d4faee555b39bb0417541254ce63e53a25d44fadba9e0fc2c2f806fed58e54e9f6"
setx DB_ENCRYPTION_KEY "a7f8d9e2c1b0a3f6e4d7c9b2a5f8e1d4c7b0a3f6e9d2c5b8a1f4e7d0c3b6a9f2"

:: Server Configuration
setx WEBSITE_PORT "5001"
setx WEBSITE_FRONTEND_URL "http://localhost:8000"
setx WEBSITE_NODE_ENV "development"

:: Email Configuration (Templates)
setx WEBSITE_EMAIL_USER "ayushmaurya2003@gmail.com"
setx WEBSITE_EMAIL_FROM "noreply@ayushmaurya.dev"
echo.
echo IMPORTANT: You must manually set your Gmail App Password:
echo setx WEBSITE_EMAIL_PASS "your-16-char-app-password"
echo.
echo Environment variables have been set. Please restart your terminal or VS Code for changes to take effect.
pause
