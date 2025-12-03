import React, { useState } from 'react';
import { Flex } from '../../level1/Flex';
import './Sidebar.css';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: SidebarMenuItem[];
}

export interface SidebarProps {
  items: SidebarMenuItem[];
  activeId?: string;
  onItemClick?: (item: SidebarMenuItem) => void;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  collapsedWidth?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeId,
  onItemClick,
  collapsed = false,
  onCollapse,
  logo,
  footer,
  width = '250px',
  collapsedWidth = '60px',
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleItemClick = (item: SidebarMenuItem, e: React.MouseEvent) => {
    e.stopPropagation();

    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    } else {
      onItemClick?.(item);
    }
  };

  const renderMenuItem = (item: SidebarMenuItem, depth: number = 0) => {
    const isActive = item.id === activeId;
    const isExpanded = expandedIds.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="sidebar__menu-item-wrapper">
        <button
          className={`sidebar__menu-item ${isActive ? 'sidebar__menu-item--active' : ''}`}
          style={{ paddingLeft: collapsed ? undefined : `${16 + depth * 16}px` }}
          onClick={(e) => handleItemClick(item, e)}
          title={collapsed ? item.label : undefined}
        >
          {item.icon && (
            <span className="sidebar__menu-item-icon">{item.icon}</span>
          )}
          {!collapsed && (
            <>
              <span className="sidebar__menu-item-label">{item.label}</span>
              {hasChildren && (
                <span className={`sidebar__menu-item-arrow ${isExpanded ? 'sidebar__menu-item-arrow--expanded' : ''}`}>
                  ▼
                </span>
              )}
            </>
          )}
        </button>

        {!collapsed && hasChildren && isExpanded && (
          <div className="sidebar__submenu">
            {item.children!.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      style={{ width: collapsed ? collapsedWidth : width }}
    >
      {logo && (
        <div className="sidebar__logo">
          {logo}
        </div>
      )}

      {onCollapse && (
        <button
          className="sidebar__collapse-btn"
          onClick={() => onCollapse(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      )}

      <nav className="sidebar__nav">
        <Flex direction="column" gap="xs">
          {items.map((item) => renderMenuItem(item))}
        </Flex>
      </nav>

      {footer && !collapsed && (
        <div className="sidebar__footer">
          {footer}
        </div>
      )}
    </aside>
  );
};

Sidebar.displayName = 'Sidebar';
