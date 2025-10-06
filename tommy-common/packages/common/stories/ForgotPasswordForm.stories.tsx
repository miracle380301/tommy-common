import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ForgotPasswordForm } from '../frontend/level2/ForgotPasswordForm/ForgotPasswordForm';
import '../frontend/level2/ForgotPasswordForm/ForgotPasswordForm.css';

const meta = {
  title: 'Common/Level2/ForgotPasswordForm',
  component: ForgotPasswordForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const handleSubmit = async (data: { email: string }) => {
      console.log('Forgot password:', data);
      alert('비밀번호 재설정 링크를 이메일로 전송했습니다.');
    };

    return (
      <div style={{ width: '450px' }}>
        <ForgotPasswordForm
          {...args}
          onSubmit={handleSubmit}
          onBack={() => alert('Navigate back to login')}
        />
      </div>
    );
  },
};

export const WithError: Story = {
  render: (args) => {
    const handleSubmit = async (data: { email: string }) => {
      console.log('Forgot password:', data);
    };

    return (
      <div style={{ width: '450px' }}>
        <ForgotPasswordForm
          {...args}
          onSubmit={handleSubmit}
          error="해당 이메일을 찾을 수 없습니다"
        />
      </div>
    );
  },
};

export const CustomTitle: Story = {
  render: (args) => {
    const handleSubmit = async (data: { email: string }) => {
      console.log('Forgot password:', data);
    };

    return (
      <div style={{ width: '450px' }}>
        <ForgotPasswordForm
          {...args}
          title="비밀번호 찾기"
          subtitle="가입하신 이메일을 입력하세요"
          onSubmit={handleSubmit}
        />
      </div>
    );
  },
};
