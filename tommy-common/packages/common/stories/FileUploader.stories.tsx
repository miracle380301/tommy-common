import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FileUploader } from '../frontend/level2/FileUploader/FileUploader';
import '../frontend/level2/FileUploader/FileUploader.css';

const meta = {
  title: 'Common/Level2/FileUploader',
  component: FileUploader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FileUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

const handleUpload = async (files: File[]): Promise<void> => {
  console.log('업로드할 파일:', files);
  return new Promise((resolve) => {
    setTimeout(() => {
      alert(`${files.length}개 파일 업로드 완료!`);
      resolve();
    }, 2000);
  });
};

export const Default: Story = {
  args: {
    onUpload: handleUpload,
  },
  render: (args) => (
    <div style={{ width: '500px' }}>
      <FileUploader {...args} />
    </div>
  ),
};

export const ImageOnly: Story = {
  args: {
    accept: 'image/*',
    onUpload: handleUpload,
  },
  render: (args) => (
    <div style={{ width: '500px' }}>
      <FileUploader {...args} />
    </div>
  ),
};

export const MultipleFiles: Story = {
  args: {
    multiple: true,
    onUpload: handleUpload,
  },
  render: (args) => (
    <div style={{ width: '500px' }}>
      <FileUploader {...args} />
    </div>
  ),
};

export const WithSizeLimit: Story = {
  args: {
    accept: 'image/*',
    multiple: true,
    maxSize: 5 * 1024 * 1024, // 5MB
    onUpload: handleUpload,
  },
  render: (args) => (
    <div style={{ width: '500px' }}>
      <FileUploader {...args} />
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
        최대 파일 크기: 5MB
      </p>
    </div>
  ),
};
