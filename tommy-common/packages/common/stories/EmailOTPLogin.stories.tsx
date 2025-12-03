import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EmailOTPLogin } from '../frontend/level2/EmailOTPLogin/EmailOTPLogin';
import '../frontend/level2/EmailOTPLogin/EmailOTPLogin.css';

const meta = {
  title: 'Common/Level2/EmailOTPLogin',
  component: EmailOTPLogin,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EmailOTPLogin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSendOTP: async (email: string) => {
      console.log('Sending OTP to:', email);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { expiresIn: 300 }; // 5 minutes
    },
    onVerifyOTP: async (email: string, code: string) => {
      console.log('Verifying OTP:', { email, code });
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo: accept code "123456"
      if (code === '123456') {
        alert('로그인 성공!');
      } else {
        throw new Error('잘못된 인증 코드입니다.');
      }
    },
  },
};

export const WithInitialEmail: Story = {
  args: {
    initialEmail: 'user@example.com',
    onSendOTP: async (email: string) => {
      console.log('Sending OTP to:', email);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { expiresIn: 300 };
    },
    onVerifyOTP: async (email: string, code: string) => {
      console.log('Verifying OTP:', { email, code });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (code === '123456') {
        alert('로그인 성공!');
      } else {
        throw new Error('잘못된 인증 코드입니다.');
      }
    },
  },
};

export const CustomTitle: Story = {
  args: {
    title: '이메일 인증',
    subtitle: '가입하신 이메일로 인증 코드를 받으세요',
    onSendOTP: async (email: string) => {
      console.log('Sending OTP to:', email);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { expiresIn: 180 }; // 3 minutes
    },
    onVerifyOTP: async (email: string, code: string) => {
      console.log('Verifying OTP:', { email, code });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (code === '123456') {
        alert('인증 성공!');
      } else {
        throw new Error('잘못된 인증 코드입니다.');
      }
    },
  },
};

export const FourDigitOTP: Story = {
  args: {
    otpLength: 4,
    onSendOTP: async (email: string) => {
      console.log('Sending 4-digit OTP to:', email);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { expiresIn: 300 };
    },
    onVerifyOTP: async (email: string, code: string) => {
      console.log('Verifying 4-digit OTP:', { email, code });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (code === '1234') {
        alert('로그인 성공!');
      } else {
        throw new Error('잘못된 인증 코드입니다.');
      }
    },
  },
};

export const WithBackHandler: Story = {
  args: {
    onSendOTP: async (email: string) => {
      console.log('Sending OTP to:', email);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { expiresIn: 300 };
    },
    onVerifyOTP: async (email: string, code: string) => {
      console.log('Verifying OTP:', { email, code });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (code === '123456') {
        alert('로그인 성공!');
      } else {
        throw new Error('잘못된 인증 코드입니다.');
      }
    },
    onBack: () => {
      alert('뒤로가기 클릭됨');
    },
  },
};

export const SimulateError: Story = {
  args: {
    onSendOTP: async (email: string) => {
      console.log('Sending OTP to:', email);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      throw new Error('이메일 전송에 실패했습니다. 다시 시도해주세요.');
    },
    onVerifyOTP: async (email: string, code: string) => {
      console.log('Verifying OTP:', { email, code });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      throw new Error('잘못된 인증 코드입니다.');
    },
  },
};

export const CustomFieldStyles: Story = {
  args: {
    onSendOTP: async () => ({ expiresIn: 300 }),
    onVerifyOTP: async () => {},
  },
  render: () => {
    const customFields = {
      email: {
        label: '이메일 주소 (커스텀 스타일 적용)',
        placeholder: 'custom@email.com',
        style: {
          width: '400px',
          backgroundColor: '#f0f9ff',
        },
        className: 'custom-email',
      },
      otp: {
        label: '인증 코드 (커스텀 스타일)',
        helperText: 'fieldProps를 사용한 커스텀 스타일',
        style: {
          width: '400px',
          backgroundColor: '#fef3f2',
        },
        className: 'custom-otp',
      },
    };

    return (
      <div style={{ width: '800px' }}>
        <style>{`
          .custom-email {
            border: 2px dashed #3b82f6 !important;
          }
          .custom-otp {
            border: 2px dashed #ef4444 !important;
          }
        `}</style>
        <EmailOTPLogin
          onSendOTP={async (email: string) => {
            console.log('Sending OTP to:', email);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { expiresIn: 300 };
          }}
          onVerifyOTP={async (email: string, code: string) => {
            console.log('Verifying OTP:', { email, code });
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (code === '123456') {
              alert('로그인 성공!');
            } else {
              throw new Error('잘못된 인증 코드입니다.');
            }
          }}
          fieldProps={customFields}
        />
      </div>
    );
  },
};
