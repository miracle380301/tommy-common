import React, { useState } from 'react';
import { cn } from '../../utils/classNames';
import { DirectionType } from '../../utils/types';
import './Radio.css';

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Group name for radio buttons */
  name: string;
  /** Selected value */
  value?: string;
  /** Default selected value */
  defaultValue?: string;
  /** Layout direction */
  direction?: DirectionType;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Radio button children */
  children: React.ReactNode;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue,
      direction = 'vertical',
      onChange,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const currentValue = value !== undefined ? value : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    // Clone children and inject props
    const radioButtons = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          ...child.props,
          name,
          checked: child.props.value === currentValue,
          onChange: handleChange,
        } as any);
      }
      return child;
    });

    return (
      <div
        ref={ref}
        className={cn(
          'radio-group',
          `radio-group--${direction}`,
          className
        )}
        role="radiogroup"
        {...props}
      >
        {radioButtons}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
