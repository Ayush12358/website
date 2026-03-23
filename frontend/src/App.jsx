
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react';
import '@neondatabase/neon-js/ui/css';
import { authClient } from './utils/neonAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import './components/Sidebar.css';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import AdminChatPage from './pages/AdminChatPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogAdminPage from './pages/BlogAdminPage';
import BlogEditorPage from './pages/BlogEditorPage';
import SitemapPage from './pages/SitemapPage';
import ReleaseNotesPage from './pages/ReleaseNotesPage';
import LinktreePage from './pages/LinktreePage';
import NotFoundPage from './pages/NotFoundPage';
import NeonAuthPage from './pages/NeonAuthPage';
import Header from './components/Header';

function AppRoutes() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={navigate}
      Link={RouterLink}
      social={{ providers: ['google'] }}
      credentials={{ forgotPassword: true }}
    >
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Navigate to="/auth/sign-in" replace />} />
            <Route path="/signup" element={<Navigate to="/auth/sign-up" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
            <Route path="/reset-password" element={<Navigate to="/auth/reset-password" replace />} />
            <Route path="/auth/:path" element={<NeonAuthPage />} />
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
            <Route path="/release-notes" element={<ReleaseNotesPage />} />
            <Route
              path="/linktree"
              element={
                <ProtectedRoute>
                  <LinktreePage />
                </ProtectedRoute>
              }
            />
            {/* Catch-all route for 404 errors */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
    </NeonAuthUIProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
