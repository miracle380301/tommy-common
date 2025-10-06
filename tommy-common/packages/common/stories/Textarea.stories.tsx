import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../frontend/level1/Textarea/Textarea';
import '../frontend/level1/Textarea/Textarea.css';

const meta = {
  title: 'Common/Level1/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter your description...',
  },
  render: (args) => (
    <div style={{ width: '400px' }}>
      <Textarea {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <Textarea {...args} size="sm" label="Small" placeholder="Small textarea" rows={3} />
      <Textarea {...args} size="md" label="Medium" placeholder="Medium textarea" rows={4} />
      <Textarea {...args} size="lg" label="Large" placeholder="Large textarea" rows={5} />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <Textarea {...args} label="Normal" placeholder="Normal state" />
      <Textarea {...args} label="With Error" error="This field is required" placeholder="Error state" />
      <Textarea {...args} label="With Helper Text" helperText="Max 500 characters" placeholder="Type here..." />
      <Textarea {...args} label="Disabled" disabled value="Cannot edit this text" />
    </div>
  ),
};

export const WithCharacterCount: Story = {
  render: (args) => (
    <div style={{ width: '400px' }}>
      <Textarea
        {...args}
        label="Bio"
        placeholder="Tell us about yourself..."
        helperText="Maximum 200 characters"
        maxLength={200}
        rows={5}
      />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    label: 'Textarea Label',
    placeholder: 'Enter text...',
    size: 'md',
    rows: 4,
    disabled: false,
    required: false,
    helperText: '',
    error: '',
  },
  render: (args) => (
    <div style={{ width: '400px' }}>
      <Textarea {...args} />
    </div>
  ),
};
