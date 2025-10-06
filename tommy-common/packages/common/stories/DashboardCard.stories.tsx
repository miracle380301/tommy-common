import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DashboardCard } from '../frontend/level2/DashboardCard/DashboardCard';
import { Button } from '../frontend/level1/Button/Button';
import '../frontend/level2/DashboardCard/DashboardCard.css';
import '../frontend/level1/Button/Button.css';

const meta = {
  title: 'Common/Level2/DashboardCard',
  component: DashboardCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    title: '최근 주문',
    children: <div style={{ padding: '1rem' }}>카드 내용이 여기에 표시됩니다.</div>,
  },
  render: (args) => (
    <div style={{ width: '400px' }}>
      <DashboardCard {...args} />
    </div>
  ),
};

export const WithSubtitle: Story = {
  args: {
    title: '최근 주문',
    subtitle: '지난 7일간의 주문 내역',
    children: <div style={{ padding: '1rem' }}>주문 목록...</div>,
  },
  render: (args) => (
    <div style={{ width: '400px' }}>
      <DashboardCard {...args} />
    </div>
  ),
};

export const WithActions: Story = {
  args: {
    title: '최근 주문',
    subtitle: '지난 7일간의 주문 내역',
    actions: <Button variant="ghost" size="sm">전체 보기</Button>,
    children: (
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>주문 #1234</span>
            <span>₩50,000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>주문 #1235</span>
            <span>₩75,000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>주문 #1236</span>
            <span>₩30,000</span>
          </div>
        </div>
      </div>
    ),
  },
  render: (args) => (
    <div style={{ width: '400px' }}>
      <DashboardCard {...args} />
    </div>
  ),
};
