import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from '../frontend/level2/StatCard/StatCard';
import '../frontend/level2/StatCard/StatCard.css';

const meta = {
  title: 'Common/Level2/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TrendUp: Story = {
  args: {
    title: '총 매출',
    value: '₩1,234,567',
    change: 12.5,
    trend: 'up',
  },
  render: (args) => (
    <div style={{ width: '280px' }}>
      <StatCard {...args} />
    </div>
  ),
};

export const TrendDown: Story = {
  args: {
    title: '주문 수',
    value: '1,234',
    change: -5.2,
    trend: 'down',
  },
  render: (args) => (
    <div style={{ width: '280px' }}>
      <StatCard {...args} />
    </div>
  ),
};

export const TrendNeutral: Story = {
  args: {
    title: '전환율',
    value: '3.2%',
    change: 0,
    trend: 'neutral',
  },
  render: (args) => (
    <div style={{ width: '280px' }}>
      <StatCard {...args} />
    </div>
  ),
};

export const DashboardExample: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '600px' }}>
      <StatCard
        {...args}
        title="총 매출"
        value="₩1,234,567"
        change={12.5}
        trend="up"
      />
      <StatCard
        {...args}
        title="주문 수"
        value="1,234"
        change={-5.2}
        trend="down"
      />
      <StatCard
        {...args}
        title="신규 고객"
        value="567"
        change={8.3}
        trend="up"
      />
      <StatCard
        {...args}
        title="전환율"
        value="3.2%"
        change={0}
        trend="neutral"
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
