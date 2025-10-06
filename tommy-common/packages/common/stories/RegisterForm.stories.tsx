import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RegisterForm } from '../frontend/level2/RegisterForm/RegisterForm';
import '../frontend/level2/RegisterForm/RegisterForm.css';

const meta = {
  title: 'Common/Level2/RegisterForm',
  component: RegisterForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const handleSubmit = async (data: any) => {
      console.log('Register:', data);
      alert('회원가입이 완료되었습니다!');
    };

    return (
      <div style={{ width: '450px' }}>
        <RegisterForm
          {...args}
          onSubmit={handleSubmit}
          onLogin={() => alert('Navigate to login')}
        />
      </div>
    );
  },
};

export const WithoutTerms: Story = {
  render: (args) => {
    const handleSubmit = async (data: any) => {
      console.log('Register:', data);
    };

    return (
      <div style={{ width: '450px' }}>
        <RegisterForm
          {...args}
          onSubmit={handleSubmit}
          requireTermsAcceptance={false}
        />
      </div>
    );
  },
};

export const CustomTitle: Story = {
  render: (args) => {
    const handleSubmit = async (data: any) => {
      console.log('Register:', data);
    };

    return (
      <div style={{ width: '450px' }}>
        <RegisterForm
          {...args}
          title="새 계정 만들기"
          subtitle="무료로 시작하세요"
          onSubmit={handleSubmit}
        />
      </div>
    );
  },
};

export const WithError: Story = {
  render: (args) => {
    const handleSubmit = async (data: any) => {
      console.log('Register:', data);
    };

    return (
      <div style={{ width: '450px' }}>
        <RegisterForm
          {...args}
          onSubmit={handleSubmit}
          error="이미 존재하는 이메일입니다"
        />
      </div>
    );
  },
};
