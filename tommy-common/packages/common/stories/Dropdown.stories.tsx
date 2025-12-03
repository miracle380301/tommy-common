import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown } from '../frontend/level1/Dropdown/Dropdown';
import { Button } from '../frontend/level1/Button';

const meta: Meta<typeof Dropdown> = {
  title: 'Common/Level1/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  args: {
    trigger: <Button>Open Menu</Button>,
    items: [
      { label: 'Profile', icon: '👤', onClick: () => console.log('Profile clicked') },
      { label: 'Settings', icon: '⚙️', onClick: () => console.log('Settings clicked') },
      { label: 'Help', icon: '❓', onClick: () => console.log('Help clicked') },
      { divider: true },
      { label: 'Logout', icon: '🚪', danger: true, onClick: () => console.log('Logout clicked') },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    trigger: <Button variant="outline">Actions ▼</Button>,
    items: [
      { label: 'Edit', icon: '✏️', onClick: () => console.log('Edit') },
      { label: 'Copy', icon: '📋', onClick: () => console.log('Copy') },
      { label: 'Share', icon: '🔗', onClick: () => console.log('Share') },
      { divider: true },
      { label: 'Delete', icon: '🗑️', danger: true, onClick: () => console.log('Delete') },
    ],
  },
};

export const WithDisabledItems: Story = {
  args: {
    trigger: <Button>Options</Button>,
    items: [
      { label: 'Available Option', onClick: () => console.log('Available') },
      { label: 'Disabled Option', disabled: true, onClick: () => console.log('Should not fire') },
      { label: 'Another Available', onClick: () => console.log('Available 2') },
      { divider: true },
      { label: 'Disabled Danger', danger: true, disabled: true, onClick: () => console.log('Should not fire') },
    ],
  },
};

export const BottomRight: Story = {
  args: {
    trigger: <Button>Bottom Right ▼</Button>,
    position: 'bottom-right',
    items: [
      { label: 'Option 1', onClick: () => console.log('Option 1') },
      { label: 'Option 2', onClick: () => console.log('Option 2') },
      { label: 'Option 3', onClick: () => console.log('Option 3') },
    ],
  },
};

export const TopLeft: Story = {
  args: {
    trigger: <Button>Top Left ▲</Button>,
    position: 'top-left',
    items: [
      { label: 'Option 1', onClick: () => console.log('Option 1') },
      { label: 'Option 2', onClick: () => console.log('Option 2') },
      { label: 'Option 3', onClick: () => console.log('Option 3') },
    ],
  },
};

export const Disabled: Story = {
  args: {
    trigger: <Button disabled>Disabled Dropdown</Button>,
    disabled: true,
    items: [
      { label: 'Option 1', onClick: () => console.log('Option 1') },
      { label: 'Option 2', onClick: () => console.log('Option 2') },
    ],
  },
};

export const CustomTrigger: Story = {
  args: {
    trigger: (
      <div style={{
        padding: '8px 16px',
        border: '2px solid #1976d2',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span>👤</span>
        <span>John Doe</span>
        <span style={{ fontSize: '12px' }}>▼</span>
      </div>
    ),
    items: [
      { label: 'My Profile', icon: '👤', onClick: () => console.log('Profile') },
      { label: 'Account Settings', icon: '⚙️', onClick: () => console.log('Settings') },
      { divider: true },
      { label: 'Sign Out', icon: '🚪', danger: true, onClick: () => console.log('Sign out') },
    ],
  },
};

export const LongList: Story = {
  args: {
    trigger: <Button>Many Items</Button>,
    items: [
      { label: 'Dashboard', icon: '📊', onClick: () => console.log('Dashboard') },
      { label: 'Analytics', icon: '📈', onClick: () => console.log('Analytics') },
      { label: 'Reports', icon: '📄', onClick: () => console.log('Reports') },
      { label: 'Users', icon: '👥', onClick: () => console.log('Users') },
      { label: 'Products', icon: '📦', onClick: () => console.log('Products') },
      { label: 'Orders', icon: '🛒', onClick: () => console.log('Orders') },
      { divider: true },
      { label: 'Settings', icon: '⚙️', onClick: () => console.log('Settings') },
      { label: 'Help & Support', icon: '❓', onClick: () => console.log('Help') },
      { divider: true },
      { label: 'Logout', icon: '🚪', danger: true, onClick: () => console.log('Logout') },
    ],
  },
};

export const SimpleTextMenu: Story = {
  args: {
    trigger: <Button variant="ghost">More...</Button>,
    items: [
      { label: 'Save', onClick: () => console.log('Save') },
      { label: 'Save As...', onClick: () => console.log('Save As') },
      { label: 'Export', onClick: () => console.log('Export') },
      { divider: true },
      { label: 'Close', onClick: () => console.log('Close') },
    ],
  },
};
