import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '../frontend/level1/Select/Select';
import '../frontend/level1/Select/Select.css';

const meta = {
  title: 'Common/Level1/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['minimal', 'glassmorphism', 'neon'],
      description: 'Visual theme of the select',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: '', label: 'Select an option...' },
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

const countries = [
  { value: '', label: 'Select country...' },
  { value: 'us', label: 'United States' },
  { value: 'kr', label: 'South Korea' },
  { value: 'jp', label: 'Japan' },
  { value: 'cn', label: 'China' },
];

export const Basic: Story = {
  args: {
    options,
    label: 'Choose an option',
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Select {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  args: {},
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Select {...args} size="sm" label="Small" options={options} />
      <Select {...args} size="md" label="Medium" options={options} />
      <Select {...args} size="lg" label="Large" options={options} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '3가지 크기를 지원합니다: sm, md, lg',
      },
      source: {
        code: `<Select size="sm" label="Small" options={options} />
<Select size="md" label="Medium" options={options} />
<Select size="lg" label="Large" options={options} />`,
      },
    },
  },
};

export const States: Story = {
  args: {},
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Select {...args} label="Normal" options={options} />
      <Select {...args} label="With Error" options={options} error="Please select an option" />
      <Select {...args} label="Disabled" options={options} disabled />
      <Select {...args} label="Required" options={options} required />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Normal, Error, Disabled, Required 상태를 지원합니다.',
      },
      source: {
        code: `<Select label="Normal" options={options} />
<Select label="With Error" options={options} error="Please select an option" />
<Select label="Disabled" options={options} disabled />
<Select label="Required" options={options} required />`,
      },
    },
  },
};

export const WithHelperText: Story = {
  args: {},
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Select
        {...args}
        label="Country"
        options={countries}
        helperText="Select your country of residence"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '도움말 텍스트가 있는 Select',
      },
      source: {
        code: `<Select
  label="Country"
  options={countries}
  helperText="Select your country of residence"
/>`,
      },
    },
  },
};

export const Playground: Story = {
  args: {
    label: 'Select Label',
    options,
    size: 'md',
    disabled: false,
    required: false,
    helperText: '',
    error: '',
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Select {...args} />
    </div>
  ),
};
