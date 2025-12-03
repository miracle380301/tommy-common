import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from '../frontend/level1/Toast/Toast';
import { Button } from '../frontend/level1/Button';

const meta: Meta<typeof Toast> = {
  title: 'Common/Level1/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
    },
    duration: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  args: {
    message: 'Operation completed successfully!',
    type: 'success',
  },
};

export const Error: Story = {
  args: {
    message: 'An error occurred. Please try again.',
    type: 'error',
  },
};

export const Warning: Story = {
  args: {
    message: 'Warning: This action cannot be undone.',
    type: 'warning',
  },
};

export const Info: Story = {
  args: {
    message: 'Here is some helpful information.',
    type: 'info',
  },
};

export const WithCloseButton: Story = {
  args: {
    message: 'You can close this toast by clicking the X button.',
    type: 'success',
    onClose: () => alert('Toast closed!'),
  },
};

export const LongMessage: Story = {
  args: {
    message: 'This is a very long message that demonstrates how the toast component handles longer text content. It should wrap nicely within the maximum width constraint.',
    type: 'info',
  },
};

export const WithCustomDuration: Story = {
  args: {
    message: 'This toast will auto-close in 5 seconds',
    type: 'success',
    duration: 5000,
  },
};

export const NoDuration: Story = {
  args: {
    message: 'This toast will not auto-close',
    type: 'info',
    duration: 0,
  },
};

export const Interactive: Story = {
  render: () => {
    const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'warning' | 'info' }>>([]);
    let nextId = 0;

    const addToast = (type: 'success' | 'error' | 'warning' | 'info') => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message: `${type} toast #${id}`, type }]);
    };

    const removeToast = (id: number) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button onClick={() => addToast('success')}>Show Success</Button>
          <Button onClick={() => addToast('error')}>Show Error</Button>
          <Button onClick={() => addToast('warning')}>Show Warning</Button>
          <Button onClick={() => addToast('info')}>Show Info</Button>
        </div>

        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 1000
        }}>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
              duration={3000}
            />
          ))}
        </div>
      </div>
    );
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Toast message="Success message" type="success" />
      <Toast message="Error message" type="error" />
      <Toast message="Warning message" type="warning" />
      <Toast message="Info message" type="info" />
    </div>
  ),
};
