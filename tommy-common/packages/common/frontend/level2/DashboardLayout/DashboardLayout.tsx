import React, { useState } from 'react';
import { Sidebar, SidebarMenuItem, SidebarProps } from '../Sidebar/Sidebar';
import './DashboardLayout.css';

export interface DashboardLayoutProps {
  sidebar: Omit<SidebarProps, 'collapsed' | 'onCollapse'>;
  header?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebar,
  header,
  children,
  collapsible = true,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="dashboard-layout">
      <Sidebar
        {...sidebar}
        collapsed={collapsed}
        onCollapse={collapsible ? setCollapsed : undefined}
      />

      <div className="dashboard-layout__main">
        {header && (
          <header className="dashboard-layout__header">
            {header}
          </header>
        )}

        <main className="dashboard-layout__content">
          {children}
        </main>
      </div>
    </div>
  );
};

DashboardLayout.displayName = 'DashboardLayout';
