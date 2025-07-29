
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import './components/Sidebar.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminChatPage from './pages/AdminChatPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogAdminPage from './pages/BlogAdminPage';
import BlogEditorPage from './pages/BlogEditorPage';
import SitemapPage from './pages/SitemapPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* Website-wide sidebar */}
          <button 
            className={`sidebar-toggle ${sidebarOpen ? 'sidebar-open' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle sidebar"
          >
            {sidebarOpen ? '×' : '☰'}
          </button>
          
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route 
              path="/blog/admin" 
              element={
                <ProtectedRoute>
                  <BlogAdminPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/blog/new" 
              element={
                <ProtectedRoute>
                  <BlogEditorPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/blog/edit/:id" 
              element={
                <ProtectedRoute>
                  <BlogEditorPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/chat" 
              element={
                <ProtectedRoute>
                  <AdminChatPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/sitemap" element={<SitemapPage />} />
            {/* Catch-all route for 404 errors */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
