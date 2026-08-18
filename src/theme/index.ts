export const colors = {
  // Primitives
  coral500: '#FF7F50',
  coral700: '#CC5326',
  warmGray50: '#FAFAF9',
  warmGray100: '#F5F5F4',
  warmGray200: '#E7E5E4',
  warmGray300: '#D6D3D1',
  warmGray400: '#A8A29E',
  warmGray500: '#78716C',
  warmGray700: '#44403C',
  warmGray900: '#1C1917',
  red500: '#EF4444',
  green500: '#22C55E',
  blue500: '#3B82F6',
  white: '#FFFFFF',
  black: '#000000',
  
  // Semantics (Light Mode by default for MVP)
  primary: '#FF7F50',
  primaryPressed: '#CC5326',
  background: '#FAFAF9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  textPrimary: '#1C1917',
  textSecondary: '#78716C',
  textDisabled: '#D6D3D1',
  border: '#E7E5E4',
  divider: '#F5F5F4',
  error: '#EF4444',
  success: '#22C55E',
  overlay: 'rgba(28, 25, 23, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48, // 3xl is invalid identifier in TS without quotes, using xxxl
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const elevation = {
  none: {
    shadowColor: 'transparent',
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  }
};
