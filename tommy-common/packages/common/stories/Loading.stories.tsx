import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Loading } from '../frontend/level1/Loading/Loading';
import '../frontend/level1/Loading/Loading.css';

const meta = {
  title: 'Common/Level1/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Spinner: Story = {
  args: {
    variant: 'spinner',
  },
};

export const Dots: Story = {
  args: {
    variant: 'dots',
  },
};

export const Pulse: Story = {
  args: {
    variant: 'pulse',
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <Loading {...args} size="sm" />
      <Loading {...args} size="md" />
      <Loading {...args} size="lg" />
    </div>
  ),
};

export const WithText: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Loading {...args} text="Loading..." />
      <Loading {...args} variant="dots" text="Please wait..." />
      <Loading {...args} variant="pulse" text="Processing..." />
    </div>
  ),
};

export const Fullscreen: Story = {
  args: {
    fullscreen: true,
    text: 'Loading application...',
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const Playground: Story = {
  args: {
    variant: 'spinner',
    size: 'md',
    text: '',
    fullscreen: false,
  },
};
