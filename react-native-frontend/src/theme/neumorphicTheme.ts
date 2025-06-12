import { MD3DarkTheme, configureFonts } from 'react-native-paper';
import { Platform } from 'react-native';

// iOS-inspired color palette with neumorphic/glass morphism
const NeumorphicColors = {
  // Primary colors with iOS vibes
  primary: '#007AFF', // iOS Blue
  primaryDark: '#0051D5',
  primaryLight: '#4DA3FF',
  
  // Secondary colors
  secondary: '#5856D6', // iOS Purple
  secondaryDark: '#3634A3',
  secondaryLight: '#7B79E8',
  
  // Accent colors
  accent: '#30D158', // iOS Green
  success: '#30D158',
  warning: '#FF9F0A', // iOS Orange
  error: '#FF453A', // iOS Red
  info: '#64D2FF', // iOS Light Blue
  
  // Neumorphic background colors
  background: {
    primary: '#0A0A0A', // Deep black
    secondary: '#1C1C1E', // iOS Dark Gray
    tertiary: '#2C2C2E', // iOS Medium Gray
    elevated: '#3A3A3C', // iOS Light Gray
  },
  
  // Glass morphism colors
  glass: {
    background: 'rgba(28, 28, 30, 0.8)',
    backgroundLight: 'rgba(58, 58, 60, 0.6)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E7EB', // Improved contrast
    tertiary: '#D1D5DB', // Improved contrast
    quaternary: '#9CA3AF', // Improved contrast
    inverse: '#000000',
  },
  
  // Surface colors for neumorphism
  surface: {
    primary: '#1C1C1E',
    elevated: '#2C2C2E',
    highest: '#3A3A3C',
    overlay: 'rgba(28, 28, 30, 0.9)',
  },
};

// iOS San Francisco font configuration
const iOSFontConfig = {
  displayLarge: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Display',
      default: 'Roboto',
    }),
    fontSize: 57,
    fontWeight: '700' as const,
    letterSpacing: -0.25,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Display',
      default: 'Roboto',
    }),
    fontSize: 45,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Display',
      default: 'Roboto',
    }),
    fontSize: 36,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Display',
      default: 'Roboto',
    }),
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Display',
      default: 'Roboto',
    }),
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Display',
      default: 'Roboto',
    }),
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Display',
      default: 'Roboto',
    }),
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Text',
      default: 'Roboto',
    }),
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Text',
      default: 'Roboto',
    }),
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Text',
      default: 'Roboto',
    }),
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Text',
      default: 'Roboto',
    }),
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Text',
      default: 'Roboto',
    }),
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Text',
      default: 'Roboto',
    }),
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Text',
      default: 'Roboto',
    }),
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      ios: 'SF Pro Text',
      default: 'Roboto',
    }),
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
};

// Neumorphic Dark Theme
export const neumorphicDarkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: iOSFontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: NeumorphicColors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: NeumorphicColors.primaryDark,
    onPrimaryContainer: '#B8E7FF',
    secondary: NeumorphicColors.secondary,
    onSecondary: '#FFFFFF',
    secondaryContainer: NeumorphicColors.secondaryDark,
    onSecondaryContainer: '#C4C2FF',
    tertiary: NeumorphicColors.accent,
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#0A4D2A',
    onTertiaryContainer: '#A9F5C7',
    error: NeumorphicColors.error,
    onError: '#FFFFFF',
    errorContainer: '#93000A',
    onErrorContainer: '#FFDAD6',
    background: NeumorphicColors.background.primary,
    onBackground: NeumorphicColors.text.primary,
    surface: NeumorphicColors.surface.primary,
    onSurface: NeumorphicColors.text.primary,
    surfaceVariant: NeumorphicColors.surface.elevated,
    onSurfaceVariant: NeumorphicColors.text.secondary,
    outline: 'rgba(255, 255, 255, 0.2)',
    outlineVariant: 'rgba(255, 255, 255, 0.1)',
    shadow: NeumorphicColors.glass.shadow,
    scrim: 'rgba(0, 0, 0, 0.8)',
    inverseSurface: '#E6E1E5',
    inverseOnSurface: '#313033',
    inversePrimary: NeumorphicColors.primaryDark,
    elevation: {
      level0: 'transparent',
      level1: NeumorphicColors.surface.primary,
      level2: NeumorphicColors.surface.elevated,
      level3: NeumorphicColors.surface.highest,
      level4: '#48484A',
      level5: '#58585A',
    },
    // Custom neumorphic colors
    success: NeumorphicColors.success,
    warning: NeumorphicColors.warning,
    info: NeumorphicColors.info,
    // Glass morphism specific
    glass: NeumorphicColors.glass,
    neumorphic: NeumorphicColors.background,
    textColors: NeumorphicColors.text,
  },
  
  // iOS Animation configuration
  animation: {
    duration: {
      short: 200,
      medium: 400,
      long: 600,
    },
    easing: {
      standard: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // iOS standard
      entrance: 'cubic-bezier(0.0, 0.0, 0.2, 1)', // iOS entrance
      exit: 'cubic-bezier(0.4, 0.0, 1, 1)', // iOS exit
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    spring: {
      damping: 20,
      stiffness: 300,
      mass: 1,
    },
  },
  
  // iOS-style spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Neumorphic design properties
  neumorphism: {
    borderRadius: {
      small: 12,
      medium: 16,
      large: 20,
      extraLarge: 24,
      round: 50,
    },
    elevation: {
      small: 4,
      medium: 8,
      large: 16,
      extraLarge: 24,
    },
    // Neumorphic shadow configuration
    shadows: {
      light: 'rgba(255, 255, 255, 0.1)',
      dark: 'rgba(0, 0, 0, 0.4)',
      inset: {
        light: 'rgba(255, 255, 255, 0.05)',
        dark: 'rgba(0, 0, 0, 0.2)',
      },
    },
  },
  
  // Glass morphism properties
  glassmorphism: {
    background: 'rgba(28, 28, 30, 0.8)',
    backgroundStrong: 'rgba(28, 28, 30, 0.9)',
    backgroundLight: 'rgba(58, 58, 60, 0.6)',
    border: 'rgba(255, 255, 255, 0.1)',
    blur: 20,
  },
  
  roundness: 16,
};

// Utility functions for creating neumorphic styles
export const createNeumorphicStyle = (
  theme: any,
  size: 'small' | 'medium' | 'large' = 'medium',
  pressed: boolean = false
) => {
  // Fallback neumorphism properties if not defined in theme
  const neumorphism = theme.neumorphism || {
    borderRadius: { small: 12, medium: 16, large: 20 },
    elevation: { small: 4, medium: 8, large: 16 },
    shadows: {
      light: 'rgba(255, 255, 255, 0.1)',
      dark: 'rgba(0, 0, 0, 0.4)',
      inset: {
        light: 'rgba(255, 255, 255, 0.05)',
        dark: 'rgba(0, 0, 0, 0.2)',
      },
    },
  };

  const radius = neumorphism.borderRadius[size];
  const elevation = neumorphism.elevation[size];
  
  if (Platform.OS === 'web') {
    return {
      borderRadius: radius,
      backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface,
      boxShadow: pressed 
        ? `inset ${elevation/2}px ${elevation/2}px ${elevation}px ${neumorphism.shadows.inset.dark}, inset -${elevation/2}px -${elevation/2}px ${elevation}px ${neumorphism.shadows.inset.light}`
        : `${elevation}px ${elevation}px ${elevation * 2}px ${neumorphism.shadows.dark}, -${elevation/2}px -${elevation/2}px ${elevation}px ${neumorphism.shadows.light}`,
      border: `1px solid ${theme.colors.outline}`,
    };
  } else {
    return {
      borderRadius: radius,
      backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface,
      elevation: pressed ? 0 : elevation,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.3,
      shadowRadius: elevation,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    };
  }
};

// Enhanced Glass Morphism utility matching the provided CSS example
export const createGlassStyle = (
  options: {
    intensity?: 'subtle' | 'medium' | 'strong';
    tint?: 'none' | 'primary' | 'success' | 'error' | 'warning';
    radius?: number;
  } = {}
) => {
  const { intensity = 'medium', tint = 'none', radius = 20 } = options;
  
  const intensityMap = {
    subtle: 'rgba(255, 255, 255, 0.3)',
    medium: 'rgba(255, 255, 255, 0.5)',
    strong: 'rgba(255, 255, 255, 0.7)',
  };
  
  const tintMap = {
    none: intensityMap[intensity],
    primary: 'rgba(99, 102, 241, 0.3)',
    success: 'rgba(48, 209, 88, 0.3)',
    error: 'rgba(255, 69, 58, 0.3)',
    warning: 'rgba(255, 159, 10, 0.3)',
  };
  
  // All borders use the same white opacity for consistency
  const borderColor = 'rgba(255, 255, 255, 0.25)';
  const highlightBorderColor = 'rgba(255, 255, 255, 0.5)';
  
  if (Platform.OS === 'web') {
    return {
      background: tintMap[tint],
      backdropFilter: 'blur(50px)',
      WebkitBackdropFilter: 'blur(50px)',
      borderRadius: `${radius}px`,
      border: `1px solid ${borderColor}`,
      borderTop: `1px solid ${highlightBorderColor}`,
      borderLeft: `1px solid ${highlightBorderColor}`,
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.18)',
    };
  } else {
    return {
      backgroundColor: tintMap[tint],
      borderRadius: radius,
      borderWidth: 1,
      borderColor: borderColor,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 32,
      elevation: 8,
    };
  }
};

// Enhanced Neumorphic utility
export const createNeumorphicContainerStyle = (
  options: {
    size?: 'small' | 'medium' | 'large';
    pressed?: boolean;
    recessed?: boolean;
  } = {}
) => {
  const { size = 'medium', pressed = false, recessed = false } = options;
  
  const sizeMap = {
    small: { radius: 12, shadow: 4 },
    medium: { radius: 16, shadow: 6 },
    large: { radius: 24, shadow: 8 },
  };
  
  const config = sizeMap[size];
  
  if (Platform.OS === 'web') {
    const shadowStyle = recessed || pressed 
      ? `inset ${config.shadow}px ${config.shadow}px ${config.shadow * 2}px rgba(0, 0, 0, 0.25), inset -${config.shadow/2}px -${config.shadow/2}px ${config.shadow}px rgba(255, 255, 255, 0.05)`
      : `${config.shadow}px ${config.shadow}px ${config.shadow * 2}px rgba(0, 0, 0, 0.3), -${config.shadow/2}px -${config.shadow/2}px ${config.shadow}px rgba(255, 255, 255, 0.05)`;
    
    return {
      backgroundColor: '#0A0A0A', // Use theme background
      borderRadius: `${config.radius}px`,
      boxShadow: shadowStyle,
    };
  } else {
    return {
      backgroundColor: '#0A0A0A',
      borderRadius: config.radius,
      shadowColor: '#000000',
      shadowOffset: recessed || pressed ? { width: 0, height: 0 } : { width: config.shadow, height: config.shadow },
      shadowOpacity: recessed || pressed ? 0 : 0.3,
      shadowRadius: config.shadow * 2,
      elevation: recessed || pressed ? 0 : config.shadow,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
    };
  }
};

// iOS-inspired interactive button style
export const createInteractiveButtonStyle = (
  options: {
    variant?: 'primary' | 'secondary' | 'tertiary';
    state?: 'normal' | 'pressed' | 'disabled';
    size?: 'small' | 'medium' | 'large';
  } = {}
) => {
  const { variant = 'primary', state = 'normal', size = 'medium' } = options;
  
  const sizeMap = {
    small: { radius: 12, padding: 8 },
    medium: { radius: 16, padding: 12 },
    large: { radius: 20, padding: 16 },
  };
  
  const variantMap = {
    primary: {
      background: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.3)',
      color: '#6366F1',
    },
    secondary: {
      background: 'rgba(48, 209, 88, 0.12)',
      border: 'rgba(48, 209, 88, 0.3)',
      color: '#30D158',
    },
    tertiary: {
      background: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.15)',
      color: '#FFFFFF',
    },
  };
  
  const config = sizeMap[size];
  const colors = variantMap[variant];
  
  const baseStyle = Platform.OS === 'web' ? {
    background: colors.background,
    backdropFilter: 'blur(10px)',
    borderRadius: `${config.radius}px`,
    border: `1px solid ${colors.border}`,
  } : {
    backgroundColor: colors.background,
    borderRadius: config.radius,
    borderWidth: 1,
    borderColor: colors.border,
  };
  
  if (state === 'pressed') {
    return {
      ...baseStyle,
      ...(Platform.OS === 'web' ? {
        boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
      } : {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        elevation: 0,
      }),
    };
  }
  
  if (state === 'disabled') {
    return {
      ...baseStyle,
      opacity: 0.5,
      ...(Platform.OS === 'web' ? {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      } : {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
      }),
    };
  }
  
  // Normal state
  return {
    ...baseStyle,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    } : {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 4,
    }),
  };
};

export default neumorphicDarkTheme;