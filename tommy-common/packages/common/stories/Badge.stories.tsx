import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../frontend/level1/Badge/Badge';
import '../frontend/level1/Badge/Badge.css';

const meta = {
  title: 'Common/Level1/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge {...args} variant="primary">Primary</Badge>
      <Badge {...args} variant="secondary">Secondary</Badge>
      <Badge {...args} variant="success">Success</Badge>
      <Badge {...args} variant="warning">Warning</Badge>
      <Badge {...args} variant="danger">Danger</Badge>
      <Badge {...args} variant="info">Info</Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge {...args} size="sm">Small</Badge>
      <Badge {...args} size="md">Medium</Badge>
      <Badge {...args} size="lg">Large</Badge>
    </div>
  ),
};

export const WithDot: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge {...args} variant="primary" dot>Active</Badge>
      <Badge {...args} variant="success" dot>Online</Badge>
      <Badge {...args} variant="warning" dot>Away</Badge>
      <Badge {...args} variant="danger" dot>Offline</Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge {...args} variant="success">Active</Badge>
      <Badge {...args} variant="warning">Pending</Badge>
      <Badge {...args} variant="danger">Inactive</Badge>
      <Badge {...args} variant="info">Draft</Badge>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    children: 'Badge',
    variant: 'primary',
    size: 'md',
    dot: false,
  },
};
