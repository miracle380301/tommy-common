import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth.service';

export const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    try {
      authService.setToken(token);
      setStatus('success');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err) {
      console.error('Token save failed:', err);
      setStatus('error');
      setTimeout(() => navigate('/'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              로그인 처리중...
            </h2>
            <p className="text-gray-600">잠시만 기다려주세요</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              로그인 성공!
            </h2>
            <p className="text-gray-600">프로필 페이지로 이동합니다...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-4">⚠</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              로그인 실패
            </h2>
            <p className="text-gray-600">다시 시도해주세요</p>
          </>
        )}
      </div>
    </div>
  );
};
