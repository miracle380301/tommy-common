import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../frontend/src/components/LoginPage';
import { ProfilePage } from '../frontend/src/components/ProfilePage';
import { authService } from '../frontend/src/services/auth.service';
import '../frontend/src/index.css';

const meta = {
  title: 'Social Auth/LoginPage',
  component: LoginPage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock 소셜 로그인 wrapper 컴포넌트
const MockSocialLoginDemo = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleMockSocialLogin = (provider: string) => {
    console.log('[Mock] Social login with:', provider);

    // Mock 사용자 데이터
    const mockUsers = {
      google: {
        id: 'google-user-123',
        email: 'user@gmail.com',
        name: 'Google User',
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        provider: 'google' as const
      },
      kakao: {
        id: 'kakao-user-456',
        email: 'user@kakao.com',
        name: 'Kakao User',
        picture: 'https://k.kakaocdn.net/dn/dpk9l1/btqmGhA2lKL/Oz0wDuJn1YV2DIn92f6DVK/img_640x640.jpg',
        provider: 'kakao' as const
      },
      apple: {
        id: 'apple-user-789',
        email: 'user@icloud.com',
        name: 'Apple User',
        picture: undefined,
        provider: 'apple' as const
      },
      email: {
        id: 'email@example.com',
        email: 'email@example.com',
        name: 'Email User',
        picture: undefined,
        provider: 'email' as const
      }
    };

    // Mock 토큰 저장
    const mockToken = `mock-jwt-token-${provider}-${Date.now()}`;
    authService.setToken(mockToken);

    // 로그인 상태로 전환
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    console.log('[Mock] Logout');
    authService.clearToken();
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return <ProfilePage />;
  }

  return (
    <div>
      <div style={{
        padding: '1rem',
        background: '#dcfce7',
        border: '1px solid #22c55e',
        borderRadius: '8px',
        marginBottom: '1rem',
        fontSize: '0.875rem',
        maxWidth: '32rem',
        margin: '0 auto 1rem'
      }}>
        <strong>✅ Mock Login Mode</strong>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          소셜 로그인 버튼을 클릭하면 Mock 데이터로 즉시 ProfilePage가 표시됩니다!
        </p>
        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
          <li>Google - Google User</li>
          <li>Kakao - Kakao User</li>
          <li>Apple - Apple User</li>
          <li>Email - Email User</li>
        </ul>
      </div>

      <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
        <div onClick={(e) => {
          const target = e.target as HTMLElement;
          const button = target.closest('button');
          if (button) {
            const text = button.textContent || '';
            if (text.includes('Google')) handleMockSocialLogin('google');
            else if (text.includes('Kakao')) handleMockSocialLogin('kakao');
            else if (text.includes('Apple')) handleMockSocialLogin('apple');
            else if (text.includes('이메일')) handleMockSocialLogin('email');
          }
        }}>
          <LoginPage />
        </div>
      </div>
    </div>
  );
};

export const Overview: Story = {
  parameters: {
    docs: {
      description: {
        story: '**Social Login Page**\n\nGoogle, Kakao, Apple OAuth 소셜 로그인을 지원하는 완성된 로그인 페이지입니다.\n\n**주요 기능:**\n- 🔐 Google OAuth 2.0 로그인\n- 💬 Kakao OAuth 로그인\n- 🍎 Apple Sign In (준비중)\n- 📱 반응형 디자인 (Tailwind CSS)\n- 🎨 Gradient 배경 및 현대적인 UI\n\n**기술 스택:**\n- React + TypeScript\n- Tailwind CSS\n- OAuth 2.0\n\n**Storybook에서는 Mock 데이터로 동작합니다!**',
      },
    },
  },
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '2rem',
      padding: '1rem'
    }}>
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>기본 화면 (Mock 로그인)</h3>
        <div style={{ maxWidth: '28rem' }}>
          <MockSocialLoginDemo />
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>사용 예제</h3>
        <pre style={{
          background: '#f5f5f5',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          overflow: 'auto'
        }}>
{`import { LoginPage } from '@miracle380301/social-auth';

function App() {
  return <LoginPage />;
}`}
        </pre>

        <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>OAuth 흐름</h4>
        <ol style={{
          fontSize: '0.875rem',
          lineHeight: '1.75',
          paddingLeft: '1.25rem'
        }}>
          <li>사용자가 소셜 로그인 버튼 클릭</li>
          <li>OAuth 제공자 페이지로 리다이렉트
            <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem' }}>
              <li>Google: <code>/api/auth/google</code></li>
              <li>Kakao: <code>/api/auth/kakao</code></li>
            </ul>
          </li>
          <li>사용자 인증 후 콜백 URL로 리턴</li>
          <li>백엔드에서 토큰 발급 및 세션 생성</li>
        </ol>

        <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>환경 변수</h4>
        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666' }}>
          프론트엔드 (.env):
        </p>
        <pre style={{
          background: '#f5f5f5',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          overflow: 'auto',
          marginBottom: '1rem'
        }}>
{`VITE_API_URL=http://localhost:3000`}
        </pre>

        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666' }}>
          백엔드 (.env):
        </p>
        <pre style={{
          background: '#f5f5f5',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          overflow: 'auto'
        }}>
{`# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Kakao OAuth
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback

# Apple OAuth (Optional)
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
APPLE_REDIRECT_URI=http://localhost:3000/api/auth/apple/callback`}
        </pre>
      </div>
    </div>
  ),
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기본 소셜 로그인 페이지. Mock 데이터로 로그인 결과를 즉시 확인할 수 있습니다.',
      },
    },
  },
  render: () => <MockSocialLoginDemo />,
};

export const WithBackground: Story = {
  parameters: {
    docs: {
      description: {
        story: '전체 화면 gradient 배경과 함께 표시되는 로그인 페이지. Mock 데이터로 동작합니다.',
      },
    },
    layout: 'fullscreen',
  },
  render: () => <MockSocialLoginDemo />,
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story: '버튼을 클릭하여 Mock 로그인을 테스트할 수 있습니다. ProfilePage로 전환되는 것을 확인하세요.',
      },
    },
  },
  render: () => <MockSocialLoginDemo />,
};

export const MockLoginFlow: Story = {
  parameters: {
    docs: {
      description: {
        story: '**Mock 소셜 로그인 데모**\n\n소셜 로그인 버튼을 클릭하면 Mock 데이터로 즉시 ProfilePage가 표시됩니다. 실제 OAuth 흐름 없이 UI를 테스트할 수 있습니다.',
      },
    },
    layout: 'fullscreen',
  },
  render: () => <MockSocialLoginDemo />,
};
