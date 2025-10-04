import React from 'react';
import { Card } from '../../level1/Card';
import { Flex } from '../../level1/Flex';
import { Badge } from '../../level1/Badge';
import { Loading } from '../../level1/Loading';
import type { Theme } from '../../utils/types';
import './StatCard.css';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  theme?: Theme;
  loading?: boolean;
  onClick?: () => void;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      change,
      trend,
      icon,
      theme = 'minimal',
      loading = false,
      onClick,
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant="elevated"
        hoverable={!!onClick}
        clickable={!!onClick}
        onClick={onClick}
        theme={theme}
        className="stat-card"
      >
        <Card.Body>
          {loading ? (
            <div className="stat-card__skeleton">
              <Loading size="sm" />
            </div>
          ) : (
            <Flex direction="column" gap="sm">
              {/* Title and Icon */}
              <Flex justify="between" align="start">
                <span className="stat-card__title">{title}</span>
                {icon && <div className="stat-card__icon">{icon}</div>}
              </Flex>

              {/* Value */}
              <h2 className="stat-card__value">{value}</h2>

              {/* Change */}
              {change !== undefined && (
                <Flex align="center" gap="xs">
                  <Badge
                    variant={
                      trend === 'up'
                        ? 'success'
                        : trend === 'down'
                        ? 'error'
                        : 'default'
                    }
                    size="sm"
                  >
                    {trend === 'up' && '↑'}
                    {trend === 'down' && '↓'}
                    {Math.abs(change)}%
                  </Badge>
                  <span className="stat-card__change-label">전월 대비</span>
                </Flex>
              )}
            </Flex>
          )}
        </Card.Body>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';
