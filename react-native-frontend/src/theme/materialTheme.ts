import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { Platform } from 'react-native';

// Patternx Brand Colors
const PatternxColors = {
  primary: '#6366F1', // Indigo-500
  primaryVariant: '#4F46E5', // Indigo-600
  secondary: '#EC4899', // Pink-500
  secondaryVariant: '#DB2777', // Pink-600
  accent: '#10B981', // Emerald-500
  success: '#059669', // Emerald-600
  warning: '#F59E0B', // Amber-500
  error: '#EF4444', // Red-500
  info: '#3B82F6', // Blue-500
};

// Enhanced font configuration with web support
const fontConfig = {
  displayLarge: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: -0.25,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 22,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'Roboto',
    }),
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
};

const lightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: PatternxColors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: '#E0E7FF',
    onPrimaryContainer: '#1E1B4B',
    secondary: PatternxColors.secondary,
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FCE7F3',
    onSecondaryContainer: '#831843',
    tertiary: PatternxColors.accent,
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#D1FAE5',
    onTertiaryContainer: '#064E3B',
    error: PatternxColors.error,
    onError: '#FFFFFF',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#7F1D1D',
    background: '#FEFEFE',
    onBackground: '#0F172A',
    surface: '#FFFFFF',
    onSurface: '#0F172A',
    surfaceVariant: '#F1F5F9',
    onSurfaceVariant: '#475569',
    outline: '#64748B',
    outlineVariant: '#CBD5E1',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#1E293B',
    inverseOnSurface: '#F8FAFC',
    inversePrimary: '#A5B4FC',
    elevation: {
      level0: 'transparent',
      level1: '#F8FAFC',
      level2: '#F1F5F9',
      level3: '#E2E8F0',
      level4: '#CBD5E1',
      level5: '#94A3B8',
    },
    // Custom Patternx colors
    success: PatternxColors.success,
    warning: PatternxColors.warning,
    info: PatternxColors.info,
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A5B4FC',
    onPrimary: '#1E1B4B',
    primaryContainer: PatternxColors.primaryVariant,
    onPrimaryContainer: '#E0E7FF',
    secondary: '#F9A8D4',
    onSecondary: '#831843',
    secondaryContainer: PatternxColors.secondaryVariant,
    onSecondaryContainer: '#FCE7F3',
    tertiary: '#6EE7B7',
    onTertiary: '#064E3B',
    tertiaryContainer: PatternxColors.success,
    onTertiaryContainer: '#D1FAE5',
    error: '#FCA5A5',
    onError: '#7F1D1D',
    errorContainer: PatternxColors.error,
    onErrorContainer: '#FEE2E2',
    background: '#0F172A',
    onBackground: '#F8FAFC',
    surface: '#1E293B',
    onSurface: '#F8FAFC',
    surfaceVariant: '#334155',
    onSurfaceVariant: '#CBD5E1',
    outline: '#64748B',
    outlineVariant: '#475569',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#F8FAFC',
    inverseOnSurface: '#1E293B',
    inversePrimary: PatternxColors.primary,
    elevation: {
      level0: 'transparent',
      level1: '#1E293B',
      level2: '#334155',
      level3: '#475569',
      level4: '#64748B',
      level5: '#94A3B8',
    },
    // Custom Patternx colors
    success: '#6EE7B7',
    warning: '#FBBF24',
    info: '#60A5FA',
  },
};

// Animation configuration
export const animationConfig = {
  duration: {
    short: 300,
    medium: 500,
    long: 800,
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  spring: {
    tension: 300,
    friction: 30,
    velocity: 0.2,
  },
};

// Enhanced theme with animation support
const enhancedLightTheme = {
  ...lightTheme,
  animation: animationConfig,
  roundness: 16,
  // Custom spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  // Custom layout properties
  layout: {
    borderRadius: {
      small: 8,
      medium: 12,
      large: 16,
      extraLarge: 20,
    },
    elevation: {
      small: 2,
      medium: 4,
      large: 8,
      extraLarge: 16,
    },
  },
};

const enhancedDarkTheme = {
  ...darkTheme,
  animation: animationConfig,
  roundness: 16,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  layout: {
    borderRadius: {
      small: 8,
      medium: 12,
      large: 16,
      extraLarge: 20,
    },
    elevation: {
      small: 2,
      medium: 4,
      large: 8,
      extraLarge: 16,
    },
  },
};

export const materialTheme = enhancedLightTheme;
export { enhancedLightTheme as lightTheme, enhancedDarkTheme as darkTheme };