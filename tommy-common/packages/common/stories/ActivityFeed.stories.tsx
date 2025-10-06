import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ActivityFeed } from '../frontend/level2/ActivityFeed/ActivityFeed';
import '../frontend/level2/ActivityFeed/ActivityFeed.css';

const meta = {
  title: 'Common/Level2/ActivityFeed',
  component: ActivityFeed,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActivityFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleActivities = [
  {
    id: '1',
    user: '김철수',
    action: '님이 새 프로젝트를 생성했습니다',
    target: 'Website Redesign',
    timestamp: new Date('2024-01-15T10:30:00')
  },
  {
    id: '2',
    user: '이영희',
    action: '님이 댓글을 남겼습니다',
    target: 'Task #123',
    timestamp: new Date('2024-01-15T10:25:00')
  },
  {
    id: '3',
    user: '박민수',
    action: '님이 파일을 업로드했습니다',
    target: 'design.pdf',
    timestamp: new Date('2024-01-15T09:15:00')
  },
  {
    id: '4',
    user: '정수진',
    action: '님이 작업을 완료했습니다',
    target: 'Homepage Layout',
    timestamp: new Date('2024-01-15T08:45:00')
  },
  {
    id: '5',
    user: '최동욱',
    action: '님이 팀원을 초대했습니다',
    target: 'john@example.com',
    timestamp: new Date('2024-01-15T08:00:00')
  }
];

export const Default: Story = {
  args: {
    items: sampleActivities,
  },
  render: (args) => (
    <div style={{ width: '400px' }}>
      <ActivityFeed {...args} />
    </div>
  ),
};

export const LimitedItems: Story = {
  args: {
    items: sampleActivities,
    maxItems: 3,
  },
  render: (args) => (
    <div style={{ width: '400px' }}>
      <ActivityFeed {...args} />
    </div>
  ),
};

export const InCard: Story = {
  render: (args) => (
    <div style={{ width: '450px', padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>최근 활동</h3>
      <ActivityFeed items={sampleActivities} maxItems={5} />
    </div>
  ),
};
