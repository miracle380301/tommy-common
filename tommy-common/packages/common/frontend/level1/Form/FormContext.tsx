import React, { createContext, useContext } from 'react';
import type { UseFormReturn } from '../../hooks/useForm';

export const FormContext = createContext<UseFormReturn | null>(null);

export function useFormContext(): UseFormReturn {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within Form');
  }
  return context;
}
