import React from 'react';
import { Card } from '../../level1/Card';
import { Grid } from '../../level1/Grid';
import { Input } from '../../level1/Input';
import { Select } from '../../level1/Select';
import { Button } from '../../level1/Button';
import { Flex } from '../../level1/Flex';
import type { Theme } from '../../utils/types';
import './FilterPanel.css';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'dateRange' | 'numberRange' | 'checkbox';
  options?: Array<{ value: any; label: string }>;
  placeholder?: string;
}

export interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onApply?: () => void;
  onReset?: () => void;
  theme?: Theme;
}

export const FilterPanel = React.forwardRef<HTMLDivElement, FilterPanelProps>(
  ({ filters, values, onChange, onApply, onReset, theme = 'minimal' }, ref) => {
    return (
      <Card ref={ref} variant="bordered" theme={theme} className="filter-panel">
        <Card.Body>
          <Grid columns={{ md: 3 }} gap="md">
            {filters.map((filter) => (
              <div key={filter.key}>
                {filter.type === 'text' && (
                  <Input
                    label={filter.label}
                    value={values[filter.key] || ''}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder}
                  />
                )}

                {filter.type === 'select' && (
                  <Select
                    label={filter.label}
                    value={values[filter.key] || 'all'}
                    onChange={(e: any) => onChange(filter.key, e.target.value)}
                    options={filter.options || []}
                  >
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                )}

                {filter.type === 'dateRange' && (
                  <Flex gap="sm">
                    <Input
                      type="text"
                      label="시작일"
                      placeholder="YYYY-MM-DD"
                      value={values[filter.key]?.start || ''}
                      onChange={(e) =>
                        onChange(filter.key, {
                          ...values[filter.key],
                          start: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="text"
                      label="종료일"
                      placeholder="YYYY-MM-DD"
                      value={values[filter.key]?.end || ''}
                      onChange={(e) =>
                        onChange(filter.key, {
                          ...values[filter.key],
                          end: e.target.value,
                        })
                      }
                    />
                  </Flex>
                )}

                {filter.type === 'numberRange' && (
                  <Flex gap="sm">
                    <Input
                      type="number"
                      label="최소"
                      value={values[filter.key]?.min || ''}
                      onChange={(e) =>
                        onChange(filter.key, {
                          ...values[filter.key],
                          min: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      label="최대"
                      value={values[filter.key]?.max || ''}
                      onChange={(e) =>
                        onChange(filter.key, {
                          ...values[filter.key],
                          max: e.target.value,
                        })
                      }
                    />
                  </Flex>
                )}
              </div>
            ))}
          </Grid>

          {(onApply || onReset) && (
            <Flex
              justify="end"
              gap="sm"
              style={{ marginTop: 'var(--spacing-md)' }}
            >
              {onReset && (
                <Button variant="outline" onClick={onReset}>
                  초기화
                </Button>
              )}
              {onApply && <Button onClick={onApply}>적용</Button>}
            </Flex>
          )}
        </Card.Body>
      </Card>
    );
  }
);

FilterPanel.displayName = 'FilterPanel';
