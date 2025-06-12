import React, { useEffect, useRef } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
  Haptics,
} from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { Icon } from './IconProvider';

export interface NeumorphicButtonProps {
  onPress?: () => void;
  title?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  children,
}) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Size configurations
  const sizeConfig = {
    small: {
      height: 40,
      paddingHorizontal: 16,
      borderRadius: 12,
      fontSize: 14,
      iconSize: 16,
    },
    medium: {
      height: 48,
      paddingHorizontal: 20,
      borderRadius: 16,
      fontSize: 16,
      iconSize: 20,
    },
    large: {
      height: 56,
      paddingHorizontal: 24,
      borderRadius: 20,
      fontSize: 18,
      iconSize: 24,
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      background: 'rgba(99, 102, 241, 0.15)',
      border: 'rgba(99, 102, 241, 0.4)',
      textColor: '#A5B4FC',
      glowColor: theme.colors.primary,
    },
    secondary: {
      background: 'rgba(48, 209, 88, 0.15)',
      border: 'rgba(48, 209, 88, 0.4)',
      textColor: '#6EE7B7',
      glowColor: '#30D158',
    },
    tertiary: {
      background: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(255, 255, 255, 0.25)',
      textColor: theme.colors.onSurface,
      glowColor: theme.colors.onSurface,
    },
    ghost: {
      background: 'transparent',
      border: 'transparent',
      textColor: theme.colors.onSurface,
      glowColor: theme.colors.primary,
    },
  };

  const config = sizeConfig[size];
  const colors = variantConfig[variant];

  // Animation effects
  const handlePressIn = () => {
    if (disabled || loading) return;

    // Haptic feedback on supported platforms
    if (Platform.OS === 'ios' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Get base styles
  const getBaseStyle = (): ViewStyle => {
    const opacity = disabled ? 0.5 : 1;

    if (Platform.OS === 'web') {
      return {
        background: colors.background,
        backdropFilter: variant !== 'ghost' ? 'blur(10px)' : 'none',
        borderRadius: config.borderRadius,
        border: `1px solid ${colors.border}`,
        opacity,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: variant !== 'ghost' 
          ? '0 4px 16px rgba(0, 0, 0, 0.15)'
          : 'none',
      } as ViewStyle;
    } else {
      return {
        backgroundColor: colors.background,
        borderRadius: config.borderRadius,
        borderWidth: variant !== 'ghost' ? 1 : 0,
        borderColor: colors.border,
        opacity,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: variant !== 'ghost' ? 0.15 : 0,
        shadowRadius: 16,
        elevation: variant !== 'ghost' ? 4 : 0,
      };
    }
  };

  // Get glow style for pressed state
  const getGlowStyle = () => {
    if (Platform.OS === 'web') {
      return {
        boxShadow: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [
            '0 4px 16px rgba(0, 0, 0, 0.15)',
            `0 4px 24px ${colors.glowColor}40, 0 0 32px ${colors.glowColor}20`,
          ],
        }),
      };
    } else {
      return {
        shadowColor: colors.glowColor,
        shadowOpacity: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.15, 0.4],
        }),
      };
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size={config.iconSize}
            color={colors.textColor}
          />
          {title && (
            <Text
              style={[
                styles.loadingText,
                {
                  color: colors.textColor,
                  fontSize: config.fontSize,
                  marginLeft: 8,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
        </View>
      );
    }

    if (children) {
      return children;
    }

    return (
      <View style={[
        styles.content,
        icon && styles.contentWithIcon,
      ]}>
        {icon && iconPosition === 'left' && (
          <Icon
            name={icon}
            size={config.iconSize}
            color={colors.textColor}
          />
        )}
        {title && (
          <Text
            style={[
              styles.text,
              {
                color: colors.textColor,
                fontSize: config.fontSize,
                marginLeft: icon && iconPosition === 'left' ? 8 : 0,
                marginRight: icon && iconPosition === 'right' ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
        {icon && iconPosition === 'right' && (
          <Icon
            name={icon}
            size={config.iconSize}
            color={colors.textColor}
          />
        )}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.button,
          getBaseStyle(),
          pressed && Platform.OS !== 'web' && getGlowStyle(),
          {
            height: config.height,
            paddingHorizontal: config.paddingHorizontal,
            width: fullWidth ? '100%' : undefined,
          },
        ]}
        android_ripple={{
          color: colors.glowColor + '20',
          borderless: false,
        }}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minWidth: 64,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWithIcon: {
    gap: 0, // Spacing handled by margins for better control
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NeumorphicButton;