import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from '../frontend/level1/Modal/Modal';
import { Button } from '../frontend/level1/Button/Button';
import '../frontend/level1/Modal/Modal.css';
import '../frontend/level1/Button/Button.css';

const meta = {
  title: 'Common/Level1/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['minimal', 'glassmorphism', 'neon'],
      description: 'Visual theme of the modal',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    children: 'Modal content',
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div style={{ padding: '2rem' }}>
            <h2>Basic Modal</h2>
            <p>This is a basic modal with custom content.</p>
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={() => setIsOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '기본 모달 컴포넌트',
      },
      source: {
        code: `const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Open Modal</Button>
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <div style={{ padding: '2rem' }}>
    <h2>Basic Modal</h2>
    <p>This is a basic modal with custom content.</p>
  </div>
</Modal>`,
      },
    },
  },
};

export const WithHeaderFooter: Story = {
  args: {
    children: 'Modal content',
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Structured Modal</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal Title"
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Confirm
              </Button>
            </div>
          }
        >
          <p>This modal has a header and footer.</p>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '헤더와 푸터를 포함한 구조화된 모달',
      },
      source: {
        code: `<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  footer={
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={() => setIsOpen(false)}>Confirm</Button>
    </div>
  }
>
  <p>This modal has a header and footer.</p>
</Modal>`,
      },
    },
  },
};

export const Small: Story = {
  args: {
    children: 'Modal content',
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Small Modal</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          size="sm"
          title="Small Modal"
        >
          <p>This is a small-sized modal.</p>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '작은 크기의 모달',
      },
      source: {
        code: `<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm" title="Small Modal">
  <p>This is a small-sized modal.</p>
</Modal>`,
      },
    },
  },
};

export const Large: Story = {
  args: {
    children: 'Modal content',
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Large Modal</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          size="lg"
          title="Large Modal"
        >
          <p>This is a large-sized modal with more content space.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '큰 크기의 모달',
      },
      source: {
        code: `<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg" title="Large Modal">
  <p>This is a large-sized modal with more content space.</p>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
</Modal>`,
      },
    },
  },
};

export const Playground: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <div style={{ padding: '1rem' }}>
            <p>Modal content - adjust props in Controls panel</p>
          </div>
        </Modal>
      </>
    );
  },
  args: {
    title: 'Modal Title',
    size: 'md',
    closeOnOverlayClick: true,
    closeOnEsc: true,
  },
};
