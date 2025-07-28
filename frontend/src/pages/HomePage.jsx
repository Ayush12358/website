import React from 'react';
import { useAuth } from '../context/AuthContext';
import ResumePage from './ResumePage';

const HomePage = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while determining auth state
  if (loading) {
    return (
      <div className="loading-container">
        Loading...
      </div>
    );
  }

  // Show resume for all users (authenticated and non-authenticated)
  return <ResumePage isAuthenticated={isAuthenticated} />;
};

export default HomePage;
