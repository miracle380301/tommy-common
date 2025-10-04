/**
 * Utility function to combine class names
 * Filters out falsy values and joins the remaining classes with spaces
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get theme class name
 */
export function getThemeClass(theme: 'minimal' | 'glassmorphism' | 'neon'): string {
  return `theme-${theme}`;
}
