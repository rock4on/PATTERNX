import React, { useRef, useEffect } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
  Dimensions,
  PanGestureHandler,
  State,
  PanGestureHandlerGestureEvent,
} from 'react-native';
import {
  Text,
  useTheme,
} from 'react-native-paper';
import { Icon } from './IconProvider';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeAction {
  icon: string;
  label: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}

export interface NeumorphicListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  leadingIcon?: string;
  trailingIcon?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error';
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  swipeActions?: SwipeAction[];
  swipeEnabled?: boolean;
  divider?: boolean;
  avatar?: {
    source?: string;
    fallback?: string;
    size?: number;
  };
  badge?: {
    count?: number;
    color?: string;
    showZero?: boolean;
  };
  metadata?: {
    timestamp?: string;
    status?: 'active' | 'inactive' | 'pending' | 'completed';
    priority?: 'low' | 'medium' | 'high';
  };
}

export const NeumorphicListItem: React.FC<NeumorphicListItemProps> = ({
  title,
  subtitle,
  description,
  leading,
  trailing,
  leadingIcon,
  trailingIcon,
  size = 'medium',
  variant = 'default',
  onPress,
  onLongPress,
  disabled = false,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  swipeActions = [],
  swipeEnabled = false,
  divider = false,
  avatar,
  badge,
  metadata,
}) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const actionOpacityAnim = useRef(new Animated.Value(0)).current;

  // Size configurations
  const sizeConfig = {
    small: {
      minHeight: 48,
      paddingVertical: 8,
      paddingHorizontal: 12,
      titleFontSize: 14,
      subtitleFontSize: 12,
      descriptionFontSize: 11,
      iconSize: 18,
      avatarSize: 32,
      borderRadius: 12,
    },
    medium: {
      minHeight: 64,
      paddingVertical: 12,
      paddingHorizontal: 16,
      titleFontSize: 16,
      subtitleFontSize: 14,
      descriptionFontSize: 12,
      iconSize: 20,
      avatarSize: 40,
      borderRadius: 16,
    },
    large: {
      minHeight: 80,
      paddingVertical: 16,
      paddingHorizontal: 20,
      titleFontSize: 18,
      subtitleFontSize: 16,
      descriptionFontSize: 14,
      iconSize: 24,
      avatarSize: 48,
      borderRadius: 20,
    },
  };

  // Variant configurations
  const variantConfig = {
    default: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      pressedBackgroundColor: 'rgba(255, 255, 255, 0.12)',
      titleColor: '#FFFFFF',
      subtitleColor: '#E5E7EB',
      descriptionColor: '#D1D5DB',
      iconColor: '#9CA3AF',
    },
    primary: {
      backgroundColor: `${theme.colors.primary}15`,
      borderColor: `${theme.colors.primary}30`,
      pressedBackgroundColor: `${theme.colors.primary}20`,
      titleColor: '#FFFFFF',
      subtitleColor: '#A5B4FC',
      descriptionColor: '#E5E7EB',
      iconColor: '#A5B4FC',
    },
    secondary: {
      backgroundColor: 'rgba(236, 72, 153, 0.15)',
      borderColor: 'rgba(236, 72, 153, 0.3)',
      pressedBackgroundColor: 'rgba(236, 72, 153, 0.20)',
      titleColor: '#FFFFFF',
      subtitleColor: '#F9A8D4',
      descriptionColor: '#E5E7EB',
      iconColor: '#F9A8D4',
    },
    success: {
      backgroundColor: 'rgba(48, 209, 88, 0.15)',
      borderColor: 'rgba(48, 209, 88, 0.3)',
      pressedBackgroundColor: 'rgba(48, 209, 88, 0.20)',
      titleColor: '#FFFFFF',
      subtitleColor: '#6EE7B7',
      descriptionColor: '#E5E7EB',
      iconColor: '#6EE7B7',
    },
    error: {
      backgroundColor: 'rgba(255, 69, 58, 0.15)',
      borderColor: 'rgba(255, 69, 58, 0.3)',
      pressedBackgroundColor: 'rgba(255, 69, 58, 0.20)',
      titleColor: '#FFFFFF',
      subtitleColor: '#FCA5A5',
      descriptionColor: '#E5E7EB',
      iconColor: '#FCA5A5',
    },
  };

  const config = sizeConfig[size];
  const colors = variantConfig[variant];

  // Animation handlers
  const handlePressIn = () => {
    if (disabled) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
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

  // Swipe gesture handling
  const handleSwipeGesture = (event: PanGestureHandlerGestureEvent) => {
    if (!swipeEnabled || swipeActions.length === 0) return;

    const { translationX } = event.nativeEvent;
    const progress = Math.min(Math.abs(translationX) / 100, 1);
    
    swipeAnim.setValue(translationX);
    actionOpacityAnim.setValue(progress);
  };

  const handleSwipeEnd = (event: PanGestureHandlerGestureEvent) => {
    if (!swipeEnabled || swipeActions.length === 0) return;

    const { translationX, velocityX } = event.nativeEvent;
    const shouldTriggerAction = Math.abs(translationX) > 80 || Math.abs(velocityX) > 500;

    if (shouldTriggerAction && swipeActions.length > 0) {
      swipeActions[0].onPress();
    }

    // Reset swipe position
    Animated.parallel([
      Animated.spring(swipeAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(actionOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Get container style
  const getContainerStyle = (): ViewStyle => {
    if (Platform.OS === 'web') {
      return {
        background: backgroundAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.backgroundColor, colors.pressedBackgroundColor],
        }),
        backdropFilter: 'blur(10px)',
        borderRadius: config.borderRadius,
        border: `1px solid ${colors.borderColor}`,
        transition: 'all 0.2s ease',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      } as ViewStyle;
    } else {
      return {
        backgroundColor: colors.backgroundColor,
        borderRadius: config.borderRadius,
        borderWidth: 1,
        borderColor: colors.borderColor,
        opacity: disabled ? 0.6 : 1,
      };
    }
  };

  // Render avatar
  const renderAvatar = () => {
    if (!avatar) return null;

    const avatarSize = avatar.size || config.avatarSize;

    return (
      <View
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            backgroundColor: colors.iconColor + '20',
          },
        ]}
      >
        {avatar.source ? (
          <Text style={styles.avatarText}>
            {/* In a real implementation, this would be an Image component */}
            {avatar.fallback?.[0]?.toUpperCase() || '?'}
          </Text>
        ) : (
          <Text
            style={[
              styles.avatarText,
              {
                color: colors.iconColor,
                fontSize: avatarSize * 0.4,
              },
            ]}
          >
            {avatar.fallback?.[0]?.toUpperCase() || '?'}
          </Text>
        )}
      </View>
    );
  };

  // Render badge
  const renderBadge = () => {
    if (!badge || (!badge.showZero && badge.count === 0)) return null;

    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: badge.color || colors.iconColor,
          },
        ]}
      >
        <Text style={styles.badgeText}>
          {badge.count && badge.count > 99 ? '99+' : badge.count}
        </Text>
      </View>
    );
  };

  // Render status indicator
  const renderStatusIndicator = () => {
    if (!metadata?.status) return null;

    const statusColors = {
      active: '#30D158',
      inactive: '#8E8E93',
      pending: '#FF9F0A',
      completed: theme.colors.primary,
    };

    return (
      <View
        style={[
          styles.statusIndicator,
          {
            backgroundColor: statusColors[metadata.status],
          },
        ]}
      />
    );
  };

  // Render swipe actions
  const renderSwipeActions = () => {
    if (!swipeEnabled || swipeActions.length === 0) return null;

    return (
      <Animated.View
        style={[
          styles.swipeActions,
          {
            opacity: actionOpacityAnim,
            transform: [
              {
                translateX: swipeAnim.interpolate({
                  inputRange: [-screenWidth, 0, screenWidth],
                  outputRange: [screenWidth, 0, -screenWidth],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        {swipeActions.map((action, index) => (
          <Pressable
            key={index}
            style={[
              styles.swipeAction,
              {
                backgroundColor: action.backgroundColor,
              },
            ]}
            onPress={action.onPress}
          >
            <Icon
              name={action.icon}
              size={config.iconSize}
              color={action.color}
            />
            <Text
              style={[
                styles.swipeActionText,
                {
                  color: action.color,
                  fontSize: config.subtitleFontSize,
                },
              ]}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
      </Animated.View>
    );
  };

  const content = (
    <Animated.View
      style={[
        styles.container,
        getContainerStyle(),
        {
          minHeight: config.minHeight,
          paddingVertical: config.paddingVertical,
          paddingHorizontal: config.paddingHorizontal,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>
        {/* Leading content */}
        <View style={styles.leading}>
          {avatar && renderAvatar()}
          {leading}
          {leadingIcon && !avatar && !leading && (
            <Icon
              name={leadingIcon}
              size={config.iconSize}
              color={colors.iconColor}
            />
          )}
        </View>

        {/* Main content */}
        <View style={styles.main}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.titleColor,
                  fontSize: config.titleFontSize,
                },
                titleStyle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {renderStatusIndicator()}
            {metadata?.timestamp && (
              <Text
                style={[
                  styles.timestamp,
                  {
                    color: colors.descriptionColor,
                    fontSize: config.descriptionFontSize,
                  },
                ]}
              >
                {metadata.timestamp}
              </Text>
            )}
          </View>

          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.subtitleColor,
                  fontSize: config.subtitleFontSize,
                },
                subtitleStyle,
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}

          {description && (
            <Text
              style={[
                styles.description,
                {
                  color: colors.descriptionColor,
                  fontSize: config.descriptionFontSize,
                },
                descriptionStyle,
              ]}
              numberOfLines={2}
            >
              {description}
            </Text>
          )}
        </View>

        {/* Trailing content */}
        <View style={styles.trailing}>
          {renderBadge()}
          {trailing}
          {trailingIcon && !trailing && (
            <Icon
              name={trailingIcon}
              size={config.iconSize}
              color={colors.iconColor}
            />
          )}
        </View>
      </View>

      {/* Divider */}
      {divider && (
        <View
          style={[
            styles.divider,
            {
              backgroundColor: colors.borderColor,
            },
          ]}
        />
      )}
    </Animated.View>
  );

  // If swipe is enabled, wrap in PanGestureHandler
  if (swipeEnabled && swipeActions.length > 0) {
    return (
      <View style={styles.swipeContainer}>
        {renderSwipeActions()}
        <PanGestureHandler
          onGestureEvent={handleSwipeGesture}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              handleSwipeEnd(event);
            }
          }}
        >
          <Animated.View
            style={{
              transform: [{ translateX: swipeAnim }],
            }}
          >
            <Pressable
              onPress={onPress}
              onLongPress={onLongPress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={disabled}
            >
              {content}
            </Pressable>
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  }

  // Regular pressable item
  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  swipeContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leading: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
  },
  trailing: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontWeight: '600',
    flex: 1,
  },
  subtitle: {
    fontWeight: '500',
    marginBottom: 2,
  },
  description: {
    fontWeight: '400',
    lineHeight: 18,
  },
  timestamp: {
    fontWeight: '400',
    marginLeft: 8,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 1,
  },
  swipeActions: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1,
  },
  swipeAction: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  swipeActionText: {
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default NeumorphicListItem;