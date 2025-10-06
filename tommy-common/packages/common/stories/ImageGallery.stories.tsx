import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ImageGallery } from '../frontend/level2/ImageGallery/ImageGallery';
import '../frontend/level2/ImageGallery/ImageGallery.css';

const meta = {
  title: 'Common/Level2/ImageGallery',
  component: ImageGallery,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ImageGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleImages = [
  { src: 'https://picsum.photos/400/300?random=1', alt: '이미지 1', caption: '샘플 이미지 1' },
  { src: 'https://picsum.photos/400/300?random=2', alt: '이미지 2', caption: '샘플 이미지 2' },
  { src: 'https://picsum.photos/400/300?random=3', alt: '이미지 3', caption: '샘플 이미지 3' },
  { src: 'https://picsum.photos/400/300?random=4', alt: '이미지 4', caption: '샘플 이미지 4' },
  { src: 'https://picsum.photos/400/300?random=5', alt: '이미지 5', caption: '샘플 이미지 5' },
  { src: 'https://picsum.photos/400/300?random=6', alt: '이미지 6', caption: '샘플 이미지 6' },
];

export const Default: Story = {
  args: {
    images: sampleImages.slice(0, 4),
  },
};

export const TwoColumns: Story = {
  args: {
    images: sampleImages.slice(0, 4),
    columns: { sm: 1, md: 2, lg: 2 },
  },
};

export const ThreeColumns: Story = {
  args: {
    images: sampleImages.slice(0, 6),
    columns: { sm: 1, md: 2, lg: 3 },
  },
};

export const FourColumns: Story = {
  args: {
    images: sampleImages,
    columns: { sm: 2, md: 3, lg: 4 },
  },
};
