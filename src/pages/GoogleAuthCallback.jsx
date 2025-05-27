// src/pages/GoogleAuthCallback.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function GoogleAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleGoogleCallback } = useAuth();
  const hasProcessed = useRef(false); // Prevent multiple executions

  useEffect(() => {
    if (hasProcessed.current) return; // Skip if already processed
    hasProcessed.current = true;

    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const plan = searchParams.get('plan');

    if (token && id && name && email && role && plan) {
      handleGoogleCallback(token, { id, name, email, role, plan }).catch((error) => {
        console.error('Google callback error:', error);
        navigate('/login', { state: { error: 'Google authentication failed' }, replace: true });
      });
    } else {
      navigate('/login', { state: { error: 'Google authentication failed' }, replace: true });
    }
  }, [navigate, location.search]); // Removed handleGoogleCallback from dependencies

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Processing Google Authentication...</h2>
        <p className="mt-2 text-gray-600">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}

export default GoogleAuthCallback;