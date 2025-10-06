import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../frontend/level1/Checkbox/Checkbox';
import '../frontend/level1/Checkbox/Checkbox.css';

const meta = {
  title: 'Common/Level1/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['minimal', 'glassmorphism', 'neon'],
      description: 'Visual theme of the checkbox',
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

export const Sizes: Story = {
  args: {},
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Checkbox {...args} size="sm" label="Small checkbox" />
      <Checkbox {...args} size="md" label="Medium checkbox" />
      <Checkbox {...args} size="lg" label="Large checkbox" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '3가지 크기를 지원합니다: sm, md, lg',
      },
      source: {
        code: `<Checkbox size="sm" label="Small checkbox" />
<Checkbox size="md" label="Medium checkbox" />
<Checkbox size="lg" label="Large checkbox" />`,
      },
    },
  },
};

export const States: Story = {
  args: {},
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Checkbox {...args} label="Unchecked" />
      <Checkbox {...args} label="Checked" defaultChecked />
      <Checkbox {...args} label="Disabled" disabled />
      <Checkbox {...args} label="Checked & Disabled" defaultChecked disabled />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Unchecked, Checked, Disabled 상태를 지원합니다.',
      },
      source: {
        code: `<Checkbox label="Unchecked" />
<Checkbox label="Checked" defaultChecked />
<Checkbox label="Disabled" disabled />
<Checkbox label="Checked & Disabled" defaultChecked disabled />`,
      },
    },
  },
};

export const WithoutLabel: Story = {
  args: {},
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Checkbox {...args} />
      <Checkbox {...args} defaultChecked />
      <Checkbox {...args} disabled />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '라벨 없이 체크박스만 표시',
      },
      source: {
        code: `<Checkbox />
<Checkbox defaultChecked />
<Checkbox disabled />`,
      },
    },
  },
};

export const Playground: Story = {
  args: {
    label: 'Checkbox label',
    size: 'md',
    disabled: false,
    defaultChecked: false,
  },
};
