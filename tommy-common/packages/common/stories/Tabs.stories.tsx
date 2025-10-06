import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from '../frontend/level1/Tabs/Tabs';
import '../frontend/level1/Tabs/Tabs.css';

const meta = {
  title: 'Common/Level1/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicTabs = [
  { key: 'tab1', label: 'Tab 1', content: <div style={{ padding: '1rem' }}>Content for Tab 1</div> },
  { key: 'tab2', label: 'Tab 2', content: <div style={{ padding: '1rem' }}>Content for Tab 2</div> },
  { key: 'tab3', label: 'Tab 3', content: <div style={{ padding: '1rem' }}>Content for Tab 3</div> },
];

export const Basic: Story = {
  args: {
    items: basicTabs,
  },
  render: (args) => (
    <div style={{ width: '500px' }}>
      <Tabs {...args} />
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    items: [
      { key: 'home', label: '🏠 Home', content: <div style={{ padding: '1rem' }}>Home content</div> },
      { key: 'profile', label: '👤 Profile', content: <div style={{ padding: '1rem' }}>Profile content</div> },
      { key: 'settings', label: '⚙️ Settings', content: <div style={{ padding: '1rem' }}>Settings content</div> },
    ],
  },
  render: (args) => (
    <div style={{ width: '500px' }}>
      <Tabs {...args} />
    </div>
  ),
};

export const ManyTabs: Story = {
  args: {
    items: [
      { key: '1', label: 'Overview', content: <div style={{ padding: '1rem' }}>Overview</div> },
      { key: '2', label: 'Details', content: <div style={{ padding: '1rem' }}>Details</div> },
      { key: '3', label: 'Analytics', content: <div style={{ padding: '1rem' }}>Analytics</div> },
      { key: '4', label: 'Reports', content: <div style={{ padding: '1rem' }}>Reports</div> },
      { key: '5', label: 'Settings', content: <div style={{ padding: '1rem' }}>Settings</div> },
    ],
  },
  render: (args) => (
    <div style={{ width: '600px' }}>
      <Tabs {...args} />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    items: basicTabs,
    defaultActive: 'tab1',
  },
  render: (args) => (
    <div style={{ width: '500px' }}>
      <Tabs {...args} />
    </div>
  ),
};
