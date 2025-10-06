import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, UserProfile } from '../services/auth.service';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await authService.getUserProfile();
      setUser(profile);
    } catch (err) {
      setError('프로필 정보를 불러올 수 없습니다');
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">오류 발생</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const providerColors = {
    google: 'bg-blue-500',
    kakao: 'bg-yellow-500',
    apple: 'bg-gray-900',
    email: 'bg-green-500'
  };

  const providerNames = {
    google: 'Google',
    kakao: 'Kakao',
    apple: 'Apple',
    email: 'Email'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">프로필</h1>
            <p className="text-indigo-100 mt-1">소셜 로그인 정보</p>
          </div>

          {/* Profile Info */}
          <div className="p-8">
            {/* Avatar and Name */}
            <div className="flex items-center gap-6 mb-8">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-indigo-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-600 mt-1">{user.email}</p>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white ${
                      providerColors[user.provider]
                    }`}
                  >
                    {providerNames[user.provider]} 계정
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">이메일</div>
                <div className="font-medium text-gray-800">{user.email}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">이름</div>
                <div className="font-medium text-gray-800">{user.name}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">사용자 ID</div>
                <div className="font-medium text-gray-800 text-sm truncate">
                  {user.id}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">로그인 플랫폼</div>
                <div className="font-medium text-gray-800">
                  {providerNames[user.provider]}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                로그아웃
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors duration-200"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>tommy-common 모듈 기반 • JWT 인증 • 메모리 세션</p>
        </div>
      </div>
    </div>
  );
};
