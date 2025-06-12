import React, { useRef, useEffect } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  LayoutAnimation,
} from 'react-native';
import {
  useTheme,
} from 'react-native-paper';

export interface NeumorphicCardProps {
  children: React.ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  tint?: 'none' | 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  elevation?: 'low' | 'medium' | 'high' | 'highest';
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onPress?: () => void;
  onToggleExpand?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  pattern?: 'none' | 'dots' | 'lines' | 'grid';
  padding?: number;
  margin?: number;
  fullWidth?: boolean;
  disabled?: boolean;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  children,
  intensity = 'medium',
  tint = 'none',
  elevation = 'medium',
  size = 'medium',
  interactive = false,
  expandable = false,
  expanded = false,
  onPress,
  onToggleExpand,
  style,
  contentStyle,
  pattern = 'none',
  padding,
  margin,
  fullWidth = false,
  disabled = false,
}) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;
  const expandAnim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  // Size configurations
  const sizeConfig = {
    small: {
      borderRadius: 12,
      defaultPadding: 12,
      minHeight: 60,
    },
    medium: {
      borderRadius: 16,
      defaultPadding: 16,
      minHeight: 80,
    },
    large: {
      borderRadius: 20, // MODIFIED: Changed from 24 to 20 to match request
      defaultPadding: 24,
      minHeight: 120,
    },
  };

  // Intensity configurations for glassmorphism
  const intensityConfig = {
    subtle: {
      background: 'rgba(58, 58, 60, 0.7)', // MODIFIED: Dark glass background
      backdropBlur: 25,
    },
    medium: {
      background: 'rgba(44, 44, 46, 0.75)', // MODIFIED: Dark glass background
      backdropBlur: 50, // MODIFIED: Set to 50px per request
    },
    strong: {
      background: 'rgba(28, 28, 30, 0.85)', // MODIFIED: Dark glass background
      backdropBlur: 70,
    },
  };

  // Tint configurations (adapted for dark theme glassmorphism)
  const tintConfig = {
    none: {
      background: intensityConfig[intensity].background,
      border: 'rgba(255, 255, 255, 0.25)', // MODIFIED: Adapted from request
      borderTop: 'rgba(255, 255, 255, 0.5)', // MODIFIED: Adapted from request
      borderLeft: 'rgba(255, 255, 255, 0.5)', // MODIFIED: Adapted from request
    },
    primary: {
      background: 'rgba(99, 102, 241, 0.3)',
      border: 'rgba(255, 255, 255, 0.25)',
      borderTop: 'rgba(255, 255, 255, 0.5)',
      borderLeft: 'rgba(255, 255, 255, 0.5)',
    },
    secondary: {
      background: 'rgba(236, 72, 153, 0.3)',
      border: 'rgba(255, 255, 255, 0.25)',
      borderTop: 'rgba(255, 255, 255, 0.5)',
      borderLeft: 'rgba(255, 255, 255, 0.5)',
    },
    success: {
      background: 'rgba(48, 209, 88, 0.3)',
      border: 'rgba(255, 255, 255, 0.25)',
      borderTop: 'rgba(255, 255, 255, 0.5)',
      borderLeft: 'rgba(255, 255, 255, 0.5)',
    },
    error: {
      background: 'rgba(255, 69, 58, 0.3)',
      border: 'rgba(255, 255, 255, 0.25)',
      borderTop: 'rgba(255, 255, 255, 0.5)',
      borderLeft: 'rgba(255, 255, 255, 0.5)',
    },
    warning: {
      background: 'rgba(255, 159, 10, 0.3)',
      border: 'rgba(255, 255, 255, 0.25)',
      borderTop: 'rgba(255, 255, 255, 0.5)',
      borderLeft: 'rgba(255, 255, 255, 0.5)',
    },
  };

  // Elevation configurations
  const elevationConfig = {
    low: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 4,
      webShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
    },
    medium: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 32,
      elevation: 8,
      webShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.18)', // MODIFIED: Matched request
    },
    high: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 32,
      elevation: 8,
      webShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.18)', // MODIFIED: Matched request
    },
    highest: {
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 48,
      elevation: 12,
      webShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
    },
  };

  const config = sizeConfig[size];
  const colors = tintConfig[tint];
  const elevationStyle = elevationConfig[elevation];
  const actualPadding = padding !== undefined ? padding : config.defaultPadding;

  // Handle expansion animation
  useEffect(() => {
    if (expandable) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Animated.timing(expandAnim, {
        toValue: expanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [expanded, expandable]);

  // Interaction handlers
  const handlePressIn = () => {
    if (!interactive || disabled) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1.5,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!interactive || disabled) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled) return;
    
    if (expandable && onToggleExpand) {
      onToggleExpand();
    }
    
    if (onPress) {
      onPress();
    }
  };

  // Get base style
  const getBaseStyle = (): ViewStyle => {
    const opacity = disabled ? 0.6 : 1;

    if (Platform.OS === 'web') {
      return {
        background: colors.background,
        backdropFilter: `blur(${intensityConfig[intensity].backdropBlur}px)`,
        WebkitBackdropFilter: `blur(${intensityConfig[intensity].backdropBlur}px)`,
        borderRadius: config.borderRadius,
        border: `1px solid ${colors.border}`,
        borderTop: `1px solid ${colors.borderTop}`,
        borderLeft: `1px solid ${colors.borderLeft}`,
        boxShadow: elevationStyle.webShadow,
        opacity,
        cursor: interactive && !disabled ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      } as ViewStyle;
    } else {
      return {
        backgroundColor: colors.background,
        borderRadius: config.borderRadius,
        borderWidth: 1,
        borderColor: colors.border,
        opacity,
        shadowColor: '#000000',
        shadowOffset: elevationStyle.shadowOffset,
        shadowOpacity: elevationStyle.shadowOpacity,
        shadowRadius: elevationStyle.shadowRadius,
        elevation: elevationStyle.elevation,
      };
    }
  };

  // Get pattern overlay style
  const getPatternStyle = (): ViewStyle => {
    if (pattern === 'none') return {};

    const patternOpacity = 0.03;
    
    switch (pattern) {
      case 'dots':
        return Platform.OS === 'web' ? {
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,${patternOpacity}) 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        } as ViewStyle : {};
      
      case 'lines':
        return Platform.OS === 'web' ? {
          backgroundImage: `linear-gradient(90deg, rgba(255,255,255,${patternOpacity}) 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        } as ViewStyle : {};
      
      case 'grid':
        return Platform.OS === 'web' ? {
          backgroundImage: `
            linear-gradient(rgba(255,255,255,${patternOpacity}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,${patternOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: '16px 16px',
        } as ViewStyle : {};
      
      default:
        return {};
    }
  };

  // Render content
  const cardContent = (
    <Animated.View
      style={[
        styles.container,
        getBaseStyle(),
        getPatternStyle(),
        {
          transform: [{ scale: scaleAnim }],
          padding: actualPadding,
          margin: margin,
          minHeight: config.minHeight,
          width: fullWidth ? '100%' : undefined,
          maxHeight: expandable ? expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [config.minHeight, 1000], // Large max height for expansion
          }) : undefined,
          overflow: expandable ? 'hidden' : 'visible',
        },
        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </Animated.View>
  );

  // If interactive or expandable, wrap in Pressable
  if (interactive || expandable || onPress) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={styles.pressable}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'stretch',
  },
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});

export default NeumorphicCard;