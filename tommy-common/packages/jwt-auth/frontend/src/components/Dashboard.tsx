import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '@miracle380301/common';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <Button onClick={handleLogout} variant="secondary">
          Logout
        </Button>
      </div>

      <Card style={{ padding: '2rem', marginBottom: '1rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>User Information</h2>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <strong>ID:</strong> {user.id}
          </div>
          <div>
            <strong>Name:</strong> {user.name}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Role:</strong> <Badge variant="default">{user.role}</Badge>
          </div>
          <div>
            <strong>Email Verified:</strong>{' '}
            <Badge variant={user.isEmailVerified ? 'success' : 'warning'}>
              {user.isEmailVerified ? 'Verified' : 'Not Verified'}
            </Badge>
          </div>
          {user.lastLoginAt && (
            <div>
              <strong>Last Login:</strong> {new Date(user.lastLoginAt).toLocaleString()}
            </div>
          )}
          <div>
            <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleString()}
          </div>
        </div>
      </Card>

      <Card style={{ padding: '2rem', backgroundColor: '#f0fdf4' }}>
        <h3 style={{ marginBottom: '1rem', color: '#16a34a' }}>
          ✓ Authentication Successful
        </h3>
        <p style={{ color: '#15803d' }}>
          You are now logged in with JWT authentication. Your access token is automatically
          refreshed when it expires using the refresh token.
        </p>
      </Card>
    </div>
  );
};
