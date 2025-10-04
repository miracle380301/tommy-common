import { ReactNode } from 'react';

/**
 * Common theme types
 */
export type Theme = 'minimal' | 'glassmorphism' | 'neon';

/**
 * Common size types
 */
export type Size = 'sm' | 'md' | 'lg';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Icon position types
 */
export type IconPosition = 'left' | 'right';

/**
 * Input types
 */
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

/**
 * Resize types for textarea
 */
export type ResizeType = 'none' | 'vertical' | 'horizontal' | 'both';

/**
 * Direction types for RadioGroup
 */
export type DirectionType = 'horizontal' | 'vertical';

/**
 * Select option interface
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Common props for form components
 */
export interface CommonFormProps {
  theme?: Theme;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
}
