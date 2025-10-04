import React from 'react';
import { useForm, UseFormOptions } from '../../hooks/useForm';
import { FormContext } from './FormContext';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './Form.css';

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'>, UseFormOptions {
  theme?: Theme;
  children: React.ReactNode | ((formMethods: ReturnType<typeof useForm>) => React.ReactNode);
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (
    {
      initialValues,
      validationSchema,
      validateOnChange,
      validateOnBlur,
      onSubmit,
      theme = 'minimal',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const formMethods = useForm({
      initialValues,
      validationSchema,
      validateOnChange,
      validateOnBlur,
      onSubmit
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await formMethods.handleSubmit();
    };

    const formClasses = cn(
      'form',
      `form--theme-${theme}`,
      className
    );

    return (
      <FormContext.Provider value={formMethods}>
        <form ref={ref} className={formClasses} onSubmit={handleSubmit} {...props}>
          {typeof children === 'function' ? children(formMethods) : children}
        </form>
      </FormContext.Provider>
    );
  }
);

Form.displayName = 'Form';
