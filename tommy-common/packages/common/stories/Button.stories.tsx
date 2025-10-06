import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../frontend/level1/Button/Button';
import '../frontend/level1/Button/Button.css';

const meta = {
  title: 'Common/Level1/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '클릭 가능한 버튼 컴포넌트로, 다양한 스타일과 크기, 상태를 지원합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['minimal', 'glassmorphism', 'neon'],
      description: 'Visual theme of the button',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      description: 'Button style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variants Example
export const Variants: Story = {
  args: {
    children: 'Button',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button {...args} variant="primary">Primary</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="ghost">Ghost</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button은 4가지 variant를 제공합니다: primary, secondary, outline, ghost',
      },
      source: {
        code: `<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>`,
      },
    },
  },
};

// Sizes Example
export const Sizes: Story = {
  args: {
    children: 'Button',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '3가지 크기를 지원합니다: sm, md, lg',
      },
      source: {
        code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`,
      },
    },
  },
};

// States Example
export const States: Story = {
  args: {
    children: 'Button',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button {...args}>Normal</Button>
      <Button {...args} loading>Loading</Button>
      <Button {...args} disabled>Disabled</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading과 Disabled 상태를 지원합니다.',
      },
      source: {
        code: `<Button>Normal</Button>
<Button loading>Loading</Button>
<Button disabled>Disabled</Button>`,
      },
    },
  },
};

// With Icons
export const WithIcons: Story = {
  args: {
    children: 'Button',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Button {...args} icon="🚀" iconPosition="left">Launch</Button>
      <Button {...args} icon="→" iconPosition="right">Next</Button>
      <Button {...args} icon="❤️" variant="primary">Like</Button>
      <Button {...args} icon="🔍" variant="ghost">Search</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '아이콘을 왼쪽 또는 오른쪽에 추가할 수 있습니다.',
      },
      source: {
        code: `<Button icon="🚀" iconPosition="left">Launch</Button>
<Button icon="→" iconPosition="right">Next</Button>
<Button icon="❤️" variant="primary">Like</Button>
<Button icon="🔍" variant="ghost">Search</Button>`,
      },
    },
  },
};

// Full Width
export const FullWidth: Story = {
  args: {
    children: 'Button',
  },
  render: (args) => (
    <div style={{ width: '400px' }}>
      <Button {...args} fullWidth>Full Width Button</Button>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'fullWidth prop으로 버튼을 컨테이너 전체 너비로 확장할 수 있습니다.',
      },
      source: {
        code: `<Button fullWidth>Full Width Button</Button>`,
      },
    },
  },
};

// Themes
export const Themes: Story = {
  args: {
    children: 'Button',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Minimal Theme</h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button {...args} theme="minimal" variant="primary">Primary</Button>
          <Button {...args} theme="minimal" variant="secondary">Secondary</Button>
          <Button {...args} theme="minimal" variant="ghost">Ghost</Button>
        </div>
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Glassmorphism Theme</h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button {...args} theme="glassmorphism" variant="primary">Primary</Button>
          <Button {...args} theme="glassmorphism" variant="secondary">Secondary</Button>
          <Button {...args} theme="glassmorphism" variant="ghost">Ghost</Button>
        </div>
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Neon Theme</h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button {...args} theme="neon" variant="primary">Primary</Button>
          <Button {...args} theme="neon" variant="secondary">Secondary</Button>
          <Button {...args} theme="neon" variant="ghost">Ghost</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: '3가지 테마를 제공합니다: minimal, glassmorphism, neon',
      },
      source: {
        code: `// Minimal Theme
<Button theme="minimal" variant="primary">Primary</Button>
<Button theme="minimal" variant="secondary">Secondary</Button>

// Glassmorphism Theme
<Button theme="glassmorphism" variant="primary">Primary</Button>

// Neon Theme
<Button theme="neon" variant="primary">Primary</Button>`,
      },
    },
  },
};

// Interactive Playground
export const Playground: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    theme: 'minimal',
  },
  parameters: {
    docs: {
      description: {
        story: 'Controls 패널에서 모든 props를 직접 테스트해보세요.',
      },
    },
  },
};
