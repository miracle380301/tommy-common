import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DashboardLayout } from '../frontend/level2/DashboardLayout/DashboardLayout';
import { DataTable } from '../frontend/level2/DataTable/DataTable';
import { StatCard } from '../frontend/level2/StatCard/StatCard';
import { Flex } from '../frontend/level1/Flex';
import { Grid } from '../frontend/level1/Grid';

const meta: Meta<typeof DashboardLayout> = {
  title: 'Common/Level2/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DashboardLayout>;

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
  },
  {
    id: 'users',
    label: 'Users',
    icon: '👥',
    children: [
      { id: 'users-list', label: 'All Users', icon: '📋' },
      { id: 'users-add', label: 'Add User', icon: '➕' },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    icon: '📦',
    children: [
      { id: 'products-list', label: 'All Products', icon: '📋' },
      { id: 'products-add', label: 'Add Product', icon: '➕' },
      { id: 'products-categories', label: 'Categories', icon: '🏷️' },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: '🛒',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📈',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
  },
];

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Editor', status: 'Active' },
];

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

export const Default: Story = {
  render: () => {
    const [activeMenu, setActiveMenu] = useState('dashboard');

    return (
      <DashboardLayout
        sidebar={{
          items: menuItems,
          activeId: activeMenu,
          onItemClick: (item) => setActiveMenu(item.id),
          logo: <h2 style={{ margin: 0 }}>MyApp</h2>,
          footer: (
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
              v1.0.0
            </div>
          ),
        }}
        header={
          <Flex justify="between" align="center" style={{ width: '100%' }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Dashboard</h1>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>🔔</span>
              <span>👤 Admin</span>
            </div>
          </Flex>
        }
      >
        <Grid columns={4} gap="lg">
          <StatCard
            title="Total Users"
            value="1,234"
            change={12}
            trend="up"
            icon="👥"
          />
          <StatCard
            title="Revenue"
            value="$45,678"
            change={8}
            trend="up"
            icon="💰"
          />
          <StatCard
            title="Orders"
            value="456"
            change={-3}
            trend="down"
            icon="🛒"
          />
          <StatCard
            title="Products"
            value="89"
            change={5}
            trend="up"
            icon="📦"
          />
        </Grid>

        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Recent Users</h2>
          <DataTable
            data={sampleData}
            columns={columns}
            pagination
            pageSize={10}
            selectable
          />
        </div>
      </DashboardLayout>
    );
  },
};

export const WithUsersList: Story = {
  render: () => {
    const [activeMenu, setActiveMenu] = useState('users-list');

    return (
      <DashboardLayout
        sidebar={{
          items: menuItems,
          activeId: activeMenu,
          onItemClick: (item) => setActiveMenu(item.id),
          logo: <h2 style={{ margin: 0 }}>MyApp</h2>,
        }}
        header={
          <Flex justify="between" align="center" style={{ width: '100%' }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>All Users</h1>
            <button style={{ padding: '8px 16px', cursor: 'pointer' }}>
              + Add User
            </button>
          </Flex>
        }
      >
        <DataTable
          data={sampleData}
          columns={columns}
          pagination
          pageSize={10}
          selectable
          searchable
        />
      </DashboardLayout>
    );
  },
};

export const Collapsed: Story = {
  render: () => {
    const [activeMenu, setActiveMenu] = useState('dashboard');

    return (
      <DashboardLayout
        sidebar={{
          items: menuItems,
          activeId: activeMenu,
          onItemClick: (item) => setActiveMenu(item.id),
          logo: <span style={{ fontSize: '24px' }}>M</span>,
        }}
        header={<h1 style={{ margin: 0 }}>Dashboard</h1>}
        defaultCollapsed={true}
      >
        <div style={{ padding: '2rem' }}>
          <h2>Collapsed Sidebar Demo</h2>
          <p>Click the toggle button to expand the sidebar.</p>
        </div>
      </DashboardLayout>
    );
  },
};

export const WithoutHeader: Story = {
  render: () => {
    const [activeMenu, setActiveMenu] = useState('dashboard');

    return (
      <DashboardLayout
        sidebar={{
          items: menuItems,
          activeId: activeMenu,
          onItemClick: (item) => setActiveMenu(item.id),
          logo: <h2 style={{ margin: 0 }}>MyApp</h2>,
        }}
      >
        <div style={{ padding: '2rem' }}>
          <h1>Dashboard Without Header</h1>
          <p>This layout doesn't have a header section.</p>
        </div>
      </DashboardLayout>
    );
  },
};
