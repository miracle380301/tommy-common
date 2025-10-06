import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from '../frontend/level2/DataTable/DataTable';
import type { Column } from '../frontend/level1/Table/Table';
import '../frontend/level2/DataTable/DataTable.css';

const meta = {
  title: 'Common/Level2/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const columns: Column[] = [
  { key: 'id', label: 'ID', sortable: true, width: 80 },
  { key: 'name', label: '이름', sortable: true },
  { key: 'email', label: '이메일', sortable: true },
  { key: 'role', label: '역할', sortable: true },
  { key: 'status', label: '상태', sortable: true }
];

const sampleData = [
  { id: 1, name: '김철수', email: 'kim@example.com', role: '개발자', status: 'active' },
  { id: 2, name: '이영희', email: 'lee@example.com', role: '디자이너', status: 'active' },
  { id: 3, name: '박민수', email: 'park@example.com', role: '매니저', status: 'inactive' },
  { id: 4, name: '최지은', email: 'choi@example.com', role: '개발자', status: 'active' },
  { id: 5, name: '정민호', email: 'jung@example.com', role: 'QA', status: 'active' },
  { id: 6, name: '강서연', email: 'kang@example.com', role: '디자이너', status: 'inactive' },
  { id: 7, name: '윤도현', email: 'yoon@example.com', role: '개발자', status: 'active' },
  { id: 8, name: '한수지', email: 'han@example.com', role: 'PM', status: 'active' },
];

export const Basic: Story = {
  args: {
    title: '사용자 목록',
    columns,
    data: sampleData,
  },
};

export const WithSearch: Story = {
  args: {
    title: '사용자 목록',
    columns,
    data: sampleData,
    searchable: true,
  },
};

export const WithPagination: Story = {
  args: {
    title: '사용자 목록',
    columns,
    data: sampleData,
    searchable: true,
    pagination: true,
    pageSize: 5,
  },
};

export const FullFeatured: Story = {
  args: {
    title: '사용자 관리',
    columns,
    data: sampleData,
    searchable: true,
    pagination: true,
    pageSize: 5,
  },
};
