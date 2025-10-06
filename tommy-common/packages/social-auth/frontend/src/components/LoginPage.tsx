import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@miracle380301/common';
import '@miracle380301/common/dist/styles/variables.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSocialLogin = (provider: string) => {
    if (provider === 'email') {
      navigate('/email-login');
    } else {
      window.location.href = `${API_URL}/api/auth/${provider}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <LoginForm
          title="소셜 로그인"
          subtitle="tommy-common 모듈 기반 OAuth 인증"
          onSubmit={async () => {}}
          showSocialLogin
          socialProviders={['google', 'kakao', 'apple', 'email']}
          onSocialLogin={handleSocialLogin}
          theme="minimal"
        />

        {/* Info */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>tommy-common 모듈 기반 • DB 없는 프로토타입</p>
        </div>
      </div>
    </div>
  );
};
