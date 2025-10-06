import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { EmailOTPLogin } from '../frontend/src/components/EmailOTPLogin';
import '../frontend/src/index.css';

const meta = {
  title: 'Social Auth/EmailOTPLogin',
  component: EmailOTPLogin,
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
} satisfies Meta<typeof EmailOTPLogin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  parameters: {
    docs: {
      description: {
        story: '**Email OTP Login**\n\n이메일 주소를 입력하고 OTP 코드를 받아 로그인하는 2단계 인증 컴포넌트입니다.\n\n**주요 기능:**\n- 📧 이메일 입력 및 유효성 검증\n- 🔢 6자리 OTP 코드 전송\n- ⏱️ 카운트다운 타이머 (5분)\n- 🔄 OTP 재전송 기능\n- ✅ OTP 검증 및 자동 로그인\n- 📱 반응형 디자인 (Tailwind CSS)\n\n**기술 스택:**\n- React + TypeScript\n- Tailwind CSS\n- @miracle380301/email-service (Resend/Nodemailer)\n- JWT 토큰 인증',
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
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>기본 화면</h3>
        <div style={{ maxWidth: '28rem' }}>
          <EmailOTPLogin />
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
{`import { EmailOTPLogin } from '@miracle380301/social-auth';

function App() {
  return <EmailOTPLogin />;
}`}
        </pre>

        <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>OTP 인증 흐름</h4>
        <ol style={{
          fontSize: '0.875rem',
          lineHeight: '1.75',
          paddingLeft: '1.25rem'
        }}>
          <li><strong>Step 1: 이메일 입력</strong>
            <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem' }}>
              <li>이메일 주소 입력</li>
              <li>유효성 검증 (이메일 형식)</li>
              <li>POST <code>/api/auth/email/send-otp</code></li>
            </ul>
          </li>
          <li><strong>Step 2: OTP 검증</strong>
            <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem' }}>
              <li>이메일로 받은 6자리 코드 입력</li>
              <li>카운트다운 타이머 표시 (5분)</li>
              <li>POST <code>/api/auth/email/verify-otp</code></li>
              <li>로그인 성공 시 JWT 토큰 발급</li>
            </ul>
          </li>
          <li><strong>OTP 재전송</strong>
            <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem' }}>
              <li>타이머 만료 또는 코드 미수신 시</li>
              <li>POST <code>/api/auth/email/resend-otp</code></li>
            </ul>
          </li>
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
{`# Email OTP Configuration
EMAIL_OTP_ENABLED=true
EMAIL_OTP_LENGTH=6
EMAIL_OTP_EXPIRY=300

# Email Provider (resend / nodemailer)
EMAIL_PROVIDER=nodemailer
EMAIL_DEFAULT_FROM=noreply@yourapp.com

# Resend Configuration (if using resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Nodemailer (SMTP) Configuration (if using nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password`}
        </pre>
      </div>
    </div>
  ),
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기본 Email OTP 로그인 화면. 이메일 입력부터 시작합니다.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithBackground: Story = {
  parameters: {
    docs: {
      description: {
        story: '전체 화면 gradient 배경과 함께 표시되는 Email OTP 로그인 페이지.',
      },
    },
    layout: 'fullscreen',
  },
  render: () => (
    <div style={{ minHeight: '100vh' }}>
      <EmailOTPLogin />
    </div>
  ),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Email OTP 로그인 흐름을 테스트할 수 있습니다. 실제 백엔드 서버가 실행 중이어야 합니다.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '32rem', margin: '0 auto' }}>
        <div style={{
          padding: '1rem',
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          <strong>ℹ️ Demo Mode</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            Email OTP 로그인 테스트:
          </p>
          <ol style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
            <li>이메일 주소 입력</li>
            <li>백엔드: <code>POST /api/auth/email/send-otp</code></li>
            <li>이메일로 받은 6자리 코드 입력</li>
            <li>백엔드: <code>POST /api/auth/email/verify-otp</code></li>
            <li>로그인 성공 시 JWT 토큰 발급</li>
          </ol>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.8rem' }}>
            ※ 백엔드 서버가 <code>http://localhost:3000</code>에서 실행 중이어야 합니다.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
};
