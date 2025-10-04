import { useState } from 'react';

/**
 * Custom hook to manage focus state
 * Returns the focus state and handlers for onFocus and onBlur events
 */
export function useFocus() {
  const [isFocused, setIsFocused] = useState(false);

  const handlers = {
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  };

  return [isFocused, handlers] as const;
}
