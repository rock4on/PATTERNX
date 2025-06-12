import React, { useRef } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {
  Text,
  useTheme,
} from 'react-native-paper';
import { Icon } from './IconProvider';

export interface NeumorphicChipProps {
  label: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'outline' | 'filled';
  icon?: string;
  iconPosition?: 'left' | 'right';
  onPress?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  count?: number;
  showCount?: boolean;
  closable?: boolean;
  avatar?: {
    source?: string;
    fallback?: string;
  };
}

export const NeumorphicChip: React.FC<NeumorphicChipProps> = ({
  label,
  size = 'medium',
  variant = 'default',
  icon,
  iconPosition = 'left',
  onPress,
  onDelete,
  disabled = false,
  selected = false,
  style,
  textStyle,
  count,
  showCount = false,
  closable = false,
  avatar,
}) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  // Size configurations
  const sizeConfig = {
    small: {
      height: 24,
      paddingHorizontal: 8,
      borderRadius: 12,
      fontSize: 11,
      iconSize: 12,
      avatarSize: 16,
      countSize: 10,
    },
    medium: {
      height: 32,
      paddingHorizontal: 12,
      borderRadius: 16,
      fontSize: 13,
      iconSize: 16,
      avatarSize: 20,
      countSize: 11,
    },
    large: {
      height: 40,
      paddingHorizontal: 16,
      borderRadius: 20,
      fontSize: 15,
      iconSize: 18,
      avatarSize: 24,
      countSize: 12,
    },
  };

  // Variant configurations
  const variantConfig = {
    default: {
      backgroundColor: selected 
        ? 'rgba(255, 255, 255, 0.18)' 
        : 'rgba(255, 255, 255, 0.12)',
      borderColor: selected 
        ? 'rgba(255, 255, 255, 0.4)' 
        : 'rgba(255, 255, 255, 0.25)',
      textColor: theme.colors.onSurface,
      iconColor: theme.colors.onSurfaceVariant,
      pressedBackground: 'rgba(255, 255, 255, 0.15)',
    },
    primary: {
      backgroundColor: selected 
        ? `${theme.colors.primary}35` 
        : `${theme.colors.primary}20`,
      borderColor: selected 
        ? `${theme.colors.primary}60` 
        : `${theme.colors.primary}40`,
      textColor: '#A5B4FC',
      iconColor: '#A5B4FC',
      pressedBackground: `${theme.colors.primary}25`,
    },
    secondary: {
      backgroundColor: selected 
        ? 'rgba(236, 72, 153, 0.35)' 
        : 'rgba(236, 72, 153, 0.20)',
      borderColor: selected 
        ? 'rgba(236, 72, 153, 0.6)' 
        : 'rgba(236, 72, 153, 0.4)',
      textColor: '#F9A8D4',
      iconColor: '#F9A8D4',
      pressedBackground: 'rgba(236, 72, 153, 0.25)',
    },
    success: {
      backgroundColor: selected 
        ? 'rgba(48, 209, 88, 0.35)' 
        : 'rgba(48, 209, 88, 0.20)',
      borderColor: selected 
        ? 'rgba(48, 209, 88, 0.6)' 
        : 'rgba(48, 209, 88, 0.4)',
      textColor: '#6EE7B7',
      iconColor: '#6EE7B7',
      pressedBackground: 'rgba(48, 209, 88, 0.25)',
    },
    error: {
      backgroundColor: selected 
        ? 'rgba(255, 69, 58, 0.35)' 
        : 'rgba(255, 69, 58, 0.20)',
      borderColor: selected 
        ? 'rgba(255, 69, 58, 0.6)' 
        : 'rgba(255, 69, 58, 0.4)',
      textColor: '#FCA5A5',
      iconColor: '#FCA5A5',
      pressedBackground: 'rgba(255, 69, 58, 0.25)',
    },
    warning: {
      backgroundColor: selected 
        ? 'rgba(255, 159, 10, 0.35)' 
        : 'rgba(255, 159, 10, 0.20)',
      borderColor: selected 
        ? 'rgba(255, 159, 10, 0.6)' 
        : 'rgba(255, 159, 10, 0.4)',
      textColor: '#FBBF24',
      iconColor: '#FBBF24',
      pressedBackground: 'rgba(255, 159, 10, 0.25)',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: selected 
        ? theme.colors.primary 
        : 'rgba(255, 255, 255, 0.3)',
      textColor: selected ? theme.colors.primary : theme.colors.onSurface,
      iconColor: selected ? theme.colors.primary : theme.colors.onSurfaceVariant,
      pressedBackground: 'rgba(255, 255, 255, 0.05)',
    },
    filled: {
      backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
      borderColor: selected ? theme.colors.primary : theme.colors.outline,
      textColor: selected ? theme.colors.onPrimary : theme.colors.onSurface,
      iconColor: selected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
      pressedBackground: selected 
        ? theme.colors.primaryContainer 
        : theme.colors.surfaceVariant,
    },
  };

  const config = sizeConfig[size];
  const colors = variantConfig[variant];

  // Animation handlers
  const handlePressIn = () => {
    if (disabled) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Get container style
  const getContainerStyle = (): ViewStyle => {
    const opacity = disabled ? 0.5 : 1;

    if (Platform.OS === 'web') {
      return {
        background: backgroundAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.backgroundColor, colors.pressedBackground],
        }),
        backdropFilter: variant !== 'filled' ? 'blur(10px)' : 'none',
        borderRadius: config.borderRadius,
        border: `1px solid ${colors.borderColor}`,
        height: config.height,
        paddingHorizontal: config.paddingHorizontal,
        opacity,
        cursor: disabled ? 'default' : onPress ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: selected && variant !== 'outline' 
          ? `0 2px 8px ${colors.borderColor}` 
          : 'none',
      } as ViewStyle;
    } else {
      return {
        backgroundColor: colors.backgroundColor,
        borderRadius: config.borderRadius,
        borderWidth: 1,
        borderColor: colors.borderColor,
        height: config.height,
        paddingHorizontal: config.paddingHorizontal,
        opacity,
        shadowColor: colors.borderColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: selected && variant !== 'outline' ? 0.3 : 0,
        shadowRadius: 4,
        elevation: selected && variant !== 'outline' ? 2 : 0,
      };
    }
  };

  // Render avatar
  const renderAvatar = () => {
    if (!avatar) return null;

    return (
      <View
        style={[
          styles.avatar,
          {
            width: config.avatarSize,
            height: config.avatarSize,
            borderRadius: config.avatarSize / 2,
            backgroundColor: colors.iconColor + '20',
            marginRight: 6,
          },
        ]}
      >
        <Text
          style={[
            styles.avatarText,
            {
              color: colors.iconColor,
              fontSize: config.avatarSize * 0.5,
            },
          ]}
        >
          {avatar.fallback?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>
    );
  };

  // Render count badge
  const renderCount = () => {
    if (!showCount || count === undefined || count === 0) return null;

    return (
      <View
        style={[
          styles.countBadge,
          {
            backgroundColor: colors.iconColor,
            minWidth: config.countSize + 8,
            height: config.countSize + 8,
            borderRadius: (config.countSize + 8) / 2,
            marginLeft: 6,
          },
        ]}
      >
        <Text
          style={[
            styles.countText,
            {
              color: variant === 'filled' && selected 
                ? colors.textColor 
                : '#FFFFFF',
              fontSize: config.countSize,
            },
          ]}
        >
          {count > 99 ? '99+' : count.toString()}
        </Text>
      </View>
    );
  };

  // Render close button
  const renderCloseButton = () => {
    if (!closable && !onDelete) return null;

    return (
      <Pressable
        style={[
          styles.closeButton,
          {
            width: config.iconSize + 4,
            height: config.iconSize + 4,
            borderRadius: (config.iconSize + 4) / 2,
            marginLeft: 6,
          },
        ]}
        onPress={onDelete}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <Icon
          name="close"
          size={config.iconSize - 2}
          color={colors.iconColor}
        />
      </Pressable>
    );
  };

  const content = (
    <Animated.View
      style={[
        styles.container,
        getContainerStyle(),
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {/* Avatar */}
        {avatar && renderAvatar()}

        {/* Left icon */}
        {icon && iconPosition === 'left' && !avatar && (
          <Icon
            name={icon}
            size={config.iconSize}
            color={colors.iconColor}
            style={styles.leftIcon}
          />
        )}

        {/* Label */}
        <Text
          style={[
            styles.label,
            {
              color: colors.textColor,
              fontSize: config.fontSize,
            },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>

        {/* Right icon */}
        {icon && iconPosition === 'right' && (
          <Icon
            name={icon}
            size={config.iconSize}
            color={colors.iconColor}
            style={styles.rightIcon}
          />
        )}

        {/* Count badge */}
        {renderCount()}

        {/* Close button */}
        {renderCloseButton()}
      </View>
    </Animated.View>
  );

  // If pressable, wrap in Pressable
  if (onPress && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{
          color: colors.pressedBackground,
          borderless: false,
        }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '500',
    includeFontPadding: false,
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 6,
  },
  rightIcon: {
    marginLeft: 6,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  countBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default NeumorphicChip;