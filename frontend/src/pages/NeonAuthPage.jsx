import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AuthView } from '@neondatabase/neon-js/auth/react/ui';

const ALLOWED_AUTH_PATHS = new Set([
  'sign-in',
  'sign-up',
  'forgot-password',
  'reset-password',
  'callback',
  'sign-out'
]);

const NeonAuthPage = () => {
  const { path } = useParams();

  if (!path || !ALLOWED_AUTH_PATHS.has(path)) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return (
    <div className="page-container">
      <div className="card">
        <AuthView pathname={path} />
      </div>
    </div>
  );
};

export default NeonAuthPage;
