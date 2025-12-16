/**
 * eGhiseul.ro Color System Utilities
 * Type-safe color utilities for consistent theming
 */

// ============================================
// Color Scale Types
// ============================================

export type ColorScale = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export type SemanticColorScale = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

// ============================================
// Color Palettes
// ============================================

export const primary = {
  50: 'oklch(0.98 0.02 85)',
  100: 'oklch(0.95 0.04 85)',
  200: 'oklch(0.90 0.06 85)',
  300: 'oklch(0.85 0.08 82)',
  400: 'oklch(0.80 0.10 80)',
  500: 'oklch(0.75 0.12 75)', // Base #ECB95F
  600: 'oklch(0.65 0.12 75)',
  700: 'oklch(0.55 0.10 75)',
  800: 'oklch(0.45 0.08 75)',
  900: 'oklch(0.35 0.06 75)',
  950: 'oklch(0.25 0.04 75)',
  DEFAULT: 'oklch(0.75 0.12 75)',
  foreground: 'oklch(0.145 0 0)',
} as const;

export const secondary = {
  50: 'oklch(0.95 0.01 250)',
  100: 'oklch(0.90 0.02 250)',
  200: 'oklch(0.80 0.03 250)',
  300: 'oklch(0.65 0.04 250)',
  400: 'oklch(0.50 0.05 250)',
  500: 'oklch(0.35 0.05 250)',
  600: 'oklch(0.25 0.04 250)',
  700: 'oklch(0.18 0.03 250)',
  800: 'oklch(0.12 0.02 250)',
  900: 'oklch(0.08 0.01 250)', // Base #06101F
  950: 'oklch(0.05 0.01 250)',
  DEFAULT: 'oklch(0.90 0.02 250)',
  foreground: 'oklch(0.08 0.01 250)',
} as const;

export const neutral = {
  50: 'oklch(0.99 0 0)', // #F9FAFB
  100: 'oklch(0.97 0 0)',
  200: 'oklch(0.93 0 0)', // #e8edf3
  300: 'oklch(0.88 0 0)',
  400: 'oklch(0.75 0 0)',
  500: 'oklch(0.60 0 0)',
  600: 'oklch(0.48 0 0)', // #3a4555
  700: 'oklch(0.38 0 0)',
  800: 'oklch(0.28 0 0)',
  900: 'oklch(0.18 0 0)',
  950: 'oklch(0.12 0 0)',
} as const;

export const success = {
  50: 'oklch(0.97 0.02 145)',
  100: 'oklch(0.93 0.04 145)',
  200: 'oklch(0.87 0.08 145)',
  300: 'oklch(0.79 0.12 145)',
  400: 'oklch(0.70 0.16 145)',
  500: 'oklch(0.60 0.18 145)',
  600: 'oklch(0.50 0.18 145)',
  700: 'oklch(0.42 0.16 145)',
  800: 'oklch(0.35 0.12 145)',
  900: 'oklch(0.28 0.08 145)',
} as const;

export const warning = {
  50: 'oklch(0.98 0.02 85)',
  100: 'oklch(0.95 0.05 85)',
  200: 'oklch(0.90 0.10 85)',
  300: 'oklch(0.85 0.14 80)',
  400: 'oklch(0.78 0.16 75)',
  500: 'oklch(0.70 0.18 70)',
  600: 'oklch(0.60 0.18 65)',
  700: 'oklch(0.50 0.16 60)',
  800: 'oklch(0.42 0.12 55)',
  900: 'oklch(0.35 0.08 50)',
} as const;

export const error = {
  50: 'oklch(0.98 0.02 25)',
  100: 'oklch(0.95 0.04 25)',
  200: 'oklch(0.90 0.08 25)',
  300: 'oklch(0.83 0.14 25)',
  400: 'oklch(0.74 0.20 25)',
  500: 'oklch(0.63 0.24 25)',
  600: 'oklch(0.55 0.24 25)',
  700: 'oklch(0.47 0.22 25)',
  800: 'oklch(0.40 0.18 25)',
  900: 'oklch(0.33 0.14 25)',
} as const;

export const info = {
  50: 'oklch(0.97 0.02 230)',
  100: 'oklch(0.93 0.04 230)',
  200: 'oklch(0.87 0.08 230)',
  300: 'oklch(0.78 0.12 230)',
  400: 'oklch(0.68 0.16 230)',
  500: 'oklch(0.58 0.18 230)',
  600: 'oklch(0.50 0.18 230)',
  700: 'oklch(0.42 0.16 230)',
  800: 'oklch(0.35 0.12 230)',
  900: 'oklch(0.28 0.08 230)',
} as const;

// ============================================
// Component Color Utilities
// ============================================

export const button = {
  primary: {
    bg: 'var(--button-primary-bg)',
    fg: 'var(--button-primary-fg)',
    hover: 'var(--button-primary-hover)',
  },
  secondary: {
    bg: 'var(--button-secondary-bg)',
    fg: 'var(--button-secondary-fg)',
    border: 'var(--button-secondary-border)',
    hover: 'var(--button-secondary-hover)',
  },
} as const;

export const icon = {
  gold: {
    bg: 'var(--icon-gold-bg)',
    fg: 'var(--icon-gold-fg)',
  },
} as const;

export const badge = {
  success: {
    bg: 'var(--badge-success-bg)',
    fg: 'var(--badge-success-fg)',
  },
  warning: {
    bg: 'var(--badge-warning-bg)',
    fg: 'var(--badge-warning-fg)',
  },
  error: {
    bg: 'var(--badge-error-bg)',
    fg: 'var(--badge-error-fg)',
  },
  info: {
    bg: 'var(--badge-info-bg)',
    fg: 'var(--badge-info-fg)',
  },
} as const;

// ============================================
// Status Colors
// ============================================

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';

export const statusColors: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  pending: {
    bg: 'bg-warning-100',
    text: 'text-warning-700',
    border: 'border-warning-500',
  },
  processing: {
    bg: 'bg-info-100',
    text: 'text-info-700',
    border: 'border-info-500',
  },
  completed: {
    bg: 'bg-success-100',
    text: 'text-success-700',
    border: 'border-success-500',
  },
  rejected: {
    bg: 'bg-error-100',
    text: 'text-error-700',
    border: 'border-error-500',
  },
  cancelled: {
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    border: 'border-neutral-400',
  },
} as const;

// ============================================
// Tailwind Class Builders
// ============================================

/**
 * Get background color class for a specific shade
 */
export function getBgColor(color: keyof typeof statusColors, shade: ColorScale = 500): string {
  return `bg-${color}-${shade}`;
}

/**
 * Get text color class for a specific shade
 */
export function getTextColor(color: keyof typeof statusColors, shade: ColorScale = 500): string {
  return `text-${color}-${shade}`;
}

/**
 * Get border color class for a specific shade
 */
export function getBorderColor(color: keyof typeof statusColors, shade: ColorScale = 500): string {
  return `border-${color}-${shade}`;
}

/**
 * Get status badge classes
 */
export function getStatusBadgeClasses(status: OrderStatus): string {
  const colors = statusColors[status];
  return `${colors.bg} ${colors.text} border ${colors.border}`;
}

// ============================================
// Brand Hex Values (for external use)
// ============================================

export const brandHex = {
  gold: '#ECB95F',
  navy: '#06101F',
  secondaryText: '#3a4555',
  background: '#F9FAFB',
  border: '#e8edf3',
} as const;

// ============================================
// CSS Variable Getters
// ============================================

/**
 * Get CSS variable value
 */
export function getCSSVar(variable: string): string {
  return `var(--${variable})`;
}

/**
 * Common CSS variables
 */
export const cssVars = {
  // Primary
  primary: getCSSVar('primary'),
  primaryForeground: getCSSVar('primary-foreground'),

  // Secondary
  secondary: getCSSVar('secondary'),
  secondaryForeground: getCSSVar('secondary-foreground'),

  // Background
  background: getCSSVar('background'),
  foreground: getCSSVar('foreground'),

  // Card
  card: getCSSVar('card'),
  cardForeground: getCSSVar('card-foreground'),
  cardAccent: getCSSVar('card-accent'),

  // Border & Input
  border: getCSSVar('border'),
  input: getCSSVar('input'),
  ring: getCSSVar('ring'),

  // Muted
  muted: getCSSVar('muted'),
  mutedForeground: getCSSVar('muted-foreground'),

  // Accent
  accent: getCSSVar('accent'),
  accentForeground: getCSSVar('accent-foreground'),

  // Destructive
  destructive: getCSSVar('destructive'),
  destructiveForeground: getCSSVar('destructive-foreground'),

  // Shadows
  shadowSoft: getCSSVar('shadow-soft'),
  shadowMedium: getCSSVar('shadow-medium'),
  shadowLarge: getCSSVar('shadow-large'),
} as const;

// ============================================
// Type Exports
// ============================================

export type ColorPalette = typeof primary | typeof secondary | typeof neutral;
export type SemanticPalette = typeof success | typeof warning | typeof error | typeof info;

// ============================================
// Example Usage:
// ============================================

/*
// In a React component:

import { statusColors, getStatusBadgeClasses, cssVars } from '@/lib/design/colors';

// Status badge
<span className={`px-3 py-1 rounded-full ${getStatusBadgeClasses('completed')}`}>
  Finalizat
</span>

// Using CSS variables
<div style={{ background: cssVars.primary, color: cssVars.primaryForeground }}>
  Custom component
</div>

// Direct color access
<div className="bg-primary-500 text-secondary-900">
  Button
</div>
*/
