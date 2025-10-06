import React from 'react';
import { Flex } from '../../level1/Flex';
import type { Theme } from '../../utils/types';
import { formatRelativeTime } from '../../utils/format';
import './ActivityFeed.css';

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target?: string;
  timestamp: Date | string;
  icon?: React.ReactNode;
  avatar?: string;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  theme?: Theme;
  maxItems?: number;
  showTimestamp?: boolean;
}

export const ActivityFeed = React.forwardRef<HTMLDivElement, ActivityFeedProps>(
  ({ items, theme = 'minimal', maxItems, showTimestamp = true }, ref) => {
    const displayItems = maxItems ? items.slice(0, maxItems) : items;

    return (
      <div ref={ref} className="activity-feed" data-theme={theme}>
        <Flex direction="column" gap="md">
          {displayItems.map((item) => (
            <Flex key={item.id} gap="md" align="start">
              {/* Avatar or Icon */}
              <div className="activity-feed__avatar">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.user}
                    className="activity-feed__avatar-img"
                  />
                ) : item.icon ? (
                  <div className="activity-feed__icon">{item.icon}</div>
                ) : (
                  <div className="activity-feed__default-avatar">
                    {item.user.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <Flex direction="column" gap="xs" style={{ flex: 1 }}>
                <div className="activity-feed__content">
                  <strong className="activity-feed__user">{item.user}</strong>{' '}
                  <span className="activity-feed__action">{item.action}</span>
                  {item.target && (
                    <>
                      {' '}
                      <strong className="activity-feed__target">
                        {item.target}
                      </strong>
                    </>
                  )}
                </div>

                {showTimestamp && (
                  <span className="activity-feed__timestamp">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                )}
              </Flex>
            </Flex>
          ))}
        </Flex>
      </div>
    );
  }
);

ActivityFeed.displayName = 'ActivityFeed';
