import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterPanel } from '../frontend/level2/FilterPanel/FilterPanel';
import '../frontend/level2/FilterPanel/FilterPanel.css';

const meta = {
  title: 'Common/Level2/FilterPanel',
  component: FilterPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicFilters = [
  {
    key: 'status',
    label: '상태',
    type: 'select' as const,
    options: [
      { value: 'all', label: '전체' },
      { value: 'active', label: '활성' },
      { value: 'inactive', label: '비활성' }
    ]
  },
  {
    key: 'role',
    label: '역할',
    type: 'select' as const,
    options: [
      { value: 'all', label: '전체' },
      { value: 'admin', label: '관리자' },
      { value: 'user', label: '사용자' }
    ]
  }
];

export const Basic: Story = {
  render: (args) => {
    const [values, setValues] = useState({});

    return (
      <div style={{ width: '600px' }}>
        <FilterPanel
          {...args}
          filters={basicFilters}
          values={values}
          onChange={setValues}
        />
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
          <strong>선택된 필터:</strong>
          <pre style={{ marginTop: '0.5rem' }}>{JSON.stringify(values, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

export const ManyFilters: Story = {
  render: (args) => {
    const [values, setValues] = useState({});

    const filters = [
      {
        key: 'category',
        label: '카테고리',
        type: 'select' as const,
        options: [
          { value: 'all', label: '전체' },
          { value: 'electronics', label: '전자제품' },
          { value: 'clothing', label: '의류' },
          { value: 'food', label: '식품' }
        ]
      },
      {
        key: 'status',
        label: '상태',
        type: 'select' as const,
        options: [
          { value: 'all', label: '전체' },
          { value: 'active', label: '활성' },
          { value: 'inactive', label: '비활성' }
        ]
      },
      {
        key: 'price',
        label: '가격대',
        type: 'select' as const,
        options: [
          { value: 'all', label: '전체' },
          { value: 'low', label: '10만원 이하' },
          { value: 'mid', label: '10-50만원' },
          { value: 'high', label: '50만원 이상' }
        ]
      }
    ];

    return (
      <div style={{ width: '800px' }}>
        <FilterPanel
          {...args}
          filters={filters}
          values={values}
          onChange={setValues}
        />
      </div>
    );
  },
};
