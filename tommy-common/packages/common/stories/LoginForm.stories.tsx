import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LoginForm } from '../frontend/level2/LoginForm/LoginForm';
import '../frontend/level2/LoginForm/LoginForm.css';

const meta = {
  title: 'Common/Level2/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['minimal', 'glassmorphism', 'neon'],
    },
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
      setLoading(true);
      setError('');

      // Simulate API call
      setTimeout(() => {
        if (credentials.email === 'test@example.com' && credentials.password === 'password') {
          alert('Login successful!');
          setError('');
        } else {
          setError('Invalid email or password');
        }
        setLoading(false);
      }, 1500);
    };

    return (
      <div style={{ width: '450px' }}>
        <LoginForm
          {...args}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          Test credentials: test@example.com / password
        </p>
      </div>
    );
  },
};

export const WithSocialLogin: Story = {
  render: (args) => {
    const handleSubmit = async (credentials: any) => {
      console.log('Login:', credentials);
    };

    const handleSocialLogin = (provider: string) => {
      alert(`${provider} login clicked`);
    };

    return (
      <div style={{ width: '450px' }}>
        <LoginForm
          {...args}
          onSubmit={handleSubmit}
          showSocialLogin
          socialProviders={['kakao', 'apple', 'google', 'email']}
          onSocialLogin={handleSocialLogin}
        />
      </div>
    );
  },
};

export const CustomTitle: Story = {
  render: (args) => {
    const handleSubmit = async (credentials: any) => {
      console.log('Login:', credentials);
    };

    return (
      <div style={{ width: '450px' }}>
        <LoginForm
          {...args}
          title="Welcome Back"
          subtitle="Sign in to continue"
          onSubmit={handleSubmit}
        />
      </div>
    );
  },
};

export const WithLinks: Story = {
  render: (args) => {
    const handleSubmit = async (credentials: any) => {
      console.log('Login:', credentials);
    };

    return (
      <div style={{ width: '450px' }}>
        <LoginForm
          {...args}
          onSubmit={handleSubmit}
          onForgotPassword={() => alert('Navigate to forgot password')}
          onSignUp={() => alert('Navigate to sign up')}
        />
      </div>
    );
  },
};

export const AllThemes: Story = {
  render: (args) => {
    const handleSubmit = async (credentials: any) => {
      console.log('Login:', credentials);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ width: '450px' }}>
          <h3>Minimal Theme</h3>
          <LoginForm {...args} theme="minimal" onSubmit={handleSubmit} />
        </div>
        <div style={{ width: '450px' }}>
          <h3>Glassmorphism Theme</h3>
          <LoginForm {...args} theme="glassmorphism" onSubmit={handleSubmit} />
        </div>
        <div style={{ width: '450px' }}>
          <h3>Neon Theme</h3>
          <LoginForm {...args} theme="neon" onSubmit={handleSubmit} />
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};
