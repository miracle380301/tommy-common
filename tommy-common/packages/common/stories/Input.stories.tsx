import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../frontend/level1/Input/Input';
import '../frontend/level1/Input/Input.css';

const meta = {
  title: 'Common/Level1/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '텍스트 입력을 위한 Input 컴포넌트로, 다양한 타입과 상태를 지원합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['minimal', 'glassmorphism', 'neon'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Basic: Story = {
  args: {},
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input {...args} placeholder="Enter text..." />
      <Input {...args} label="Username" placeholder="Enter username" />
      <Input {...args} label="Email" type="email" placeholder="you@example.com" required />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '기본 Input, 라벨 있는 Input, 필수 입력 Input',
      },
      source: {
        code: `<Input placeholder="Enter text..." />
<Input label="Username" placeholder="Enter username" />
<Input label="Email" type="email" placeholder="you@example.com" required />`,
      },
    },
  },
};

// Sizes
export const Sizes: Story = {
  args: {},
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input {...args} size="sm" label="Small" placeholder="Small input" />
      <Input {...args} size="md" label="Medium" placeholder="Medium input" />
      <Input {...args} size="lg" label="Large" placeholder="Large input" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '3가지 크기를 지원합니다: sm, md, lg',
      },
      source: {
        code: `<Input size="sm" label="Small" placeholder="Small input" />
<Input size="md" label="Medium" placeholder="Medium input" />
<Input size="lg" label="Large" placeholder="Large input" />`,
      },
    },
  },
};

// States
export const States: Story = {
  args: {},
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input {...args} label="Normal" placeholder="Normal state" />
      <Input {...args} label="With Error" error="This field is required" placeholder="Error state" />
      <Input {...args} label="With Helper Text" helperText="Enter your full name" placeholder="Helper text" />
      <Input {...args} label="Disabled" placeholder="Disabled input" disabled value="Cannot edit" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Normal, Error, Helper Text, Disabled 상태를 지원합니다.',
      },
      source: {
        code: `<Input label="Normal" placeholder="Normal state" />
<Input label="With Error" error="This field is required" placeholder="Error state" />
<Input label="With Helper Text" helperText="Enter your full name" placeholder="Helper text" />
<Input label="Disabled" placeholder="Disabled input" disabled value="Cannot edit" />`,
      },
    },
  },
};

// With Icons
export const WithIcons: Story = {
  args: {},
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input {...args} label="Search" icon="🔍" iconPosition="left" placeholder="Search..." />
      <Input {...args} label="Email" icon="✉️" iconPosition="right" placeholder="you@example.com" />
      <Input {...args} label="Phone" icon="📞" iconPosition="left" placeholder="+1 (555) 000-0000" />
      <Input {...args} label="Location" icon="📍" iconPosition="right" placeholder="Enter address" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '아이콘을 왼쪽 또는 오른쪽에 추가할 수 있습니다.',
      },
      source: {
        code: `<Input label="Search" icon="🔍" iconPosition="left" placeholder="Search..." />
<Input label="Email" icon="✉️" iconPosition="right" placeholder="you@example.com" />
<Input label="Phone" icon="📞" iconPosition="left" placeholder="+1 (555) 000-0000" />
<Input label="Location" icon="📍" iconPosition="right" placeholder="Enter address" />`,
      },
    },
  },
};

// Input Types
export const InputTypes: Story = {
  args: {},
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input {...args} label="Text" type="text" placeholder="Enter text" />
      <Input {...args} label="Email" type="email" placeholder="you@example.com" />
      <Input {...args} label="Password" type="password" placeholder="Enter password" />
      <Input {...args} label="Number" type="number" placeholder="Enter number" />
      <Input {...args} label="Tel" type="tel" placeholder="+1 (555) 000-0000" />
      <Input {...args} label="URL" type="url" placeholder="https://example.com" />
      <Input {...args} label="Search" type="search" placeholder="Search..." />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: '다양한 HTML5 input 타입을 지원합니다.',
      },
      source: {
        code: `<Input label="Text" type="text" placeholder="Enter text" />
<Input label="Email" type="email" placeholder="you@example.com" />
<Input label="Password" type="password" placeholder="Enter password" />
<Input label="Number" type="number" placeholder="Enter number" />
<Input label="Tel" type="tel" placeholder="+1 (555) 000-0000" />
<Input label="URL" type="url" placeholder="https://example.com" />`,
      },
    },
  },
};

// Full Width
export const FullWidth: Story = {
  args: {},
  render: (args) => (
    <div style={{ width: '500px' }}>
      <Input {...args} label="Full Width Input" placeholder="This input spans full width" fullWidth />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'fullWidth prop으로 Input을 컨테이너 전체 너비로 확장할 수 있습니다.',
      },
      source: {
        code: `<Input label="Full Width Input" placeholder="This input spans full width" fullWidth />`,
      },
    },
  },
};

// Form Example
export const FormExample: Story = {
  args: {},
  render: (args) => (
    <div style={{ width: '400px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          {...args}
          label="Full Name"
          placeholder="John Doe"
          required
        />
        <Input
          {...args}
          label="Email"
          type="email"
          placeholder="john@example.com"
          icon="✉️"
          required
        />
        <Input
          {...args}
          label="Password"
          type="password"
          helperText="Must be at least 8 characters"
          required
        />
        <Input
          {...args}
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 123-4567"
          icon="📞"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: '실제 폼에서 사용하는 예제입니다.',
      },
      source: {
        code: `<Input label="Full Name" placeholder="John Doe" required />
<Input label="Email" type="email" placeholder="john@example.com" icon="✉️" required />
<Input label="Password" type="password" helperText="Must be at least 8 characters" required />
<Input label="Phone Number" type="tel" placeholder="+1 (555) 123-4567" icon="📞" />`,
      },
    },
  },
};

// Playground
export const Playground: Story = {
  args: {
    label: 'Input Label',
    placeholder: 'Enter text...',
    size: 'md',
    theme: 'minimal',
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Input {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Controls 패널에서 모든 props를 직접 테스트해보세요.',
      },
    },
  },
};
