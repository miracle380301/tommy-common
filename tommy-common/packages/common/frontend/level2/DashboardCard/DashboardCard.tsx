import React from 'react';
import { Card } from '../../level1/Card';
import { Flex } from '../../level1/Flex';
import { Loading } from '../../level1/Loading';
import type { Theme } from '../../utils/types';
import './DashboardCard.css';

export interface DashboardCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  theme?: Theme;
  children: React.ReactNode;
}

export const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ title, subtitle, actions, loading = false, theme = 'minimal', children }, ref) => {
    return (
      <Card ref={ref} variant="elevated" theme={theme} className="dashboard-card">
        <Card.Header>
          <Flex justify="between" align="center">
            <div>
              <h3 className="dashboard-card__title">{title}</h3>
              {subtitle && (
                <p className="dashboard-card__subtitle">{subtitle}</p>
              )}
            </div>
            {actions && <div className="dashboard-card__actions">{actions}</div>}
          </Flex>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <div className="dashboard-card__loading">
              <Loading size="md" />
            </div>
          ) : (
            children
          )}
        </Card.Body>
      </Card>
    );
  }
);

DashboardCard.displayName = 'DashboardCard';
