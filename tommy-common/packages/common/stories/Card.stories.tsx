import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../frontend/level1/Card/Card';
import { Button } from '../frontend/level1/Button/Button';
import '../frontend/level1/Card/Card.css';
import '../frontend/level1/Button/Button.css';

const meta = {
  title: 'Common/Level1/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '콘텐츠를 그룹화하고 표시하는 카드 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['minimal', 'glassmorphism', 'neon'],
      description: 'Visual theme of the card',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    children: 'Card content',
  },
  render: (args) => (
    <Card {...args} style={{ width: '300px' }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>Card Title</h3>
      <p style={{ margin: 0, color: '#666' }}>This is a basic card with some content.</p>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: '기본 카드 컴포넌트',
      },
      source: {
        code: `<Card>
  <h3>Card Title</h3>
  <p>This is a basic card with some content.</p>
</Card>`,
      },
    },
  },
};

export const WithPadding: Story = {
  args: {
    children: 'Card content',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card {...args} padding="none" style={{ width: '200px' }}>
        <div style={{ padding: '1rem', background: '#f0f0f0' }}>No Padding</div>
      </Card>
      <Card {...args} padding="sm" style={{ width: '200px' }}>
        <p style={{ margin: 0 }}>Small Padding</p>
      </Card>
      <Card {...args} padding="md" style={{ width: '200px' }}>
        <p style={{ margin: 0 }}>Medium Padding</p>
      </Card>
      <Card {...args} padding="lg" style={{ width: '200px' }}>
        <p style={{ margin: 0 }}>Large Padding</p>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '카드의 패딩 크기를 조절할 수 있습니다: none, sm, md, lg',
      },
      source: {
        code: `<Card padding="none">No Padding</Card>
<Card padding="sm">Small Padding</Card>
<Card padding="md">Medium Padding</Card>
<Card padding="lg">Large Padding</Card>`,
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    children: 'Card content',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card {...args} hoverable style={{ width: '250px', cursor: 'pointer' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Hoverable Card</h4>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
          Hover over me to see the effect
        </p>
      </Card>
      <Card {...args} clickable onClick={() => alert('Card clicked!')} style={{ width: '250px' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Clickable Card</h4>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
          Click me!
        </p>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '호버 효과와 클릭 가능한 카드',
      },
      source: {
        code: `<Card hoverable>
  <h4>Hoverable Card</h4>
  <p>Hover over me to see the effect</p>
</Card>

<Card clickable onClick={() => alert('Card clicked!')}>
  <h4>Clickable Card</h4>
  <p>Click me!</p>
</Card>`,
      },
    },
  },
};

export const WithActions: Story = {
  args: {
    children: 'Card content',
  },
  render: (args) => (
    <Card {...args} style={{ width: '350px' }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>Product Title</h3>
      <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
        This is a product description with some details about the item.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button variant="primary" size="sm">Buy Now</Button>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: '액션 버튼을 포함한 카드',
      },
      source: {
        code: `<Card>
  <h3>Product Title</h3>
  <p>This is a product description with some details about the item.</p>
  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
    <Button variant="ghost" size="sm">Cancel</Button>
    <Button variant="primary" size="sm">Buy Now</Button>
  </div>
</Card>`,
      },
    },
  },
};

export const ContentCard: Story = {
  args: {
    children: 'Card content',
  },
  render: (args) => (
    <Card {...args} style={{ width: '400px' }}>
      <img
        src="https://picsum.photos/400/200"
        alt="Sample"
        style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '1rem', borderRadius: '4px' }}
      />
      <h3 style={{ margin: '0 0 0.5rem 0' }}>Beautiful Landscape</h3>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#666' }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#999' }}>2 hours ago</span>
        <Button variant="primary" size="sm">Read More</Button>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: '이미지와 콘텐츠를 포함한 카드',
      },
      source: {
        code: `<Card>
  <img src="image.jpg" alt="Sample" />
  <h3>Beautiful Landscape</h3>
  <p>Lorem ipsum dolor sit amet...</p>
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <span>2 hours ago</span>
    <Button variant="primary" size="sm">Read More</Button>
  </div>
</Card>`,
      },
    },
  },
};

export const Playground: Story = {
  args: {
    padding: 'md',
    hoverable: false,
    clickable: false,
    children: 'Card content - edit props in the Controls panel',
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Card {...args} />
    </div>
  ),
};
