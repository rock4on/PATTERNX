import React from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  Dimensions,
} from 'react-native';
import {
  Text,
  useTheme,
} from 'react-native-paper';
import { Icon } from './IconProvider';

const { width, height } = Dimensions.get('window');

export interface GlassmorphicModalProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
  intensity?: 'subtle' | 'medium' | 'strong';
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  position?: 'center' | 'bottom' | 'top';
  animationType?: 'fade' | 'slide' | 'none';
  closeOnBackdropPress?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const GlassmorphicModal: React.FC<GlassmorphicModalProps> = ({
  visible,
  onDismiss,
  children,
  title,
  subtitle,
  showCloseButton = true,
  intensity = 'medium',
  size = 'medium',
  position = 'center',
  animationType = 'fade',
  closeOnBackdropPress = true,
  style,
  contentStyle,
}) => {
  const theme = useTheme();

  // Size configurations
  const sizeConfig = {
    small: {
      width: Math.min(width * 0.8, 300),
      maxHeight: height * 0.6,
      borderRadius: 20,
    },
    medium: {
      width: Math.min(width * 0.9, 400),
      maxHeight: height * 0.8,
      borderRadius: 20, // MODIFIED: Changed from 24
    },
    large: {
      width: Math.min(width * 0.95, 600),
      maxHeight: height * 0.9,
      borderRadius: 20, // MODIFIED: Changed from 24
    },
    fullscreen: {
      width: width,
      maxHeight: height,
      borderRadius: 0,
    },
  };

  // Intensity configurations for dark glass
  const intensityConfig = {
    subtle: {
      background: 'rgba(58, 58, 60, 0.8)',
      backdropBlur: 50, // MODIFIED: Set to 50
      borderOpacity: 0.25, // MODIFIED: Set from request
      highlightOpacity: 0.5, // MODIFIED: Set from request
    },
    medium: {
      background: 'rgba(44, 44, 46, 0.85)',
      backdropBlur: 50, // MODIFIED: Set to 50
      borderOpacity: 0.25, // MODIFIED: Set from request
      highlightOpacity: 0.5, // MODIFIED: Set from request
    },
    strong: {
      background: 'rgba(28, 28, 30, 0.9)',
      backdropBlur: 50, // MODIFIED: Set to 50
      borderOpacity: 0.25, // MODIFIED: Set from request
      highlightOpacity: 0.5, // MODIFIED: Set from request
    },
  };

  // Position configurations
  const positionConfig = {
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottom: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: 40,
    },
    top: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 60,
    },
  };

  const config = sizeConfig[size];
  const colors = intensityConfig[intensity];
  const positionStyle = positionConfig[position];

  // Get modal content style
  const getModalContentStyle = (): ViewStyle => {
    if (Platform.OS === 'web') {
      return {
        backgroundColor: colors.background,
        backdropFilter: `blur(${colors.backdropBlur}px)`,
        WebkitBackdropFilter: `blur(${colors.backdropBlur}px)`,
        borderRadius: config.borderRadius,
        border: `1px solid rgba(255, 255, 255, ${colors.borderOpacity})`,
        borderTop: `1px solid rgba(255, 255, 255, ${colors.highlightOpacity})`,
        borderLeft: `1px solid rgba(255, 255, 255, ${colors.highlightOpacity})`,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.18)',
        width: config.width,
        maxHeight: config.maxHeight,
        overflow: 'hidden',
      } as ViewStyle;
    } else {
      return {
        backgroundColor: colors.background,
        borderRadius: config.borderRadius,
        borderWidth: 1,
        borderColor: `rgba(255, 255, 255, ${colors.borderOpacity})`,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 32,
        elevation: 8,
        width: config.width,
        maxHeight: config.maxHeight,
        overflow: 'hidden',
      };
    }
  };

  // Get backdrop style
  const getBackdropStyle = (): ViewStyle => {
    if (Platform.OS === 'web') {
      return {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      } as ViewStyle;
    } else {
      return {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      };
    }
  };

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.backdrop, getBackdropStyle(), positionStyle]}
        onPress={handleBackdropPress}
      >
        <Pressable
          style={[
            styles.modalContent,
            getModalContentStyle(),
            size === 'fullscreen' && { flex: 1 },
            style,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              <View style={styles.headerText}>
                {title && (
                  <Text variant="titleLarge" style={styles.title}>
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text variant="bodyMedium" style={styles.subtitle}>
                    {subtitle}
                  </Text>
                )}
              </View>
              {showCloseButton && (
                <Pressable
                  style={styles.closeButton}
                  onPress={onDismiss}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon
                    name="close"
                    size={24}
                    color="#FFFFFF"
                  />
                </Pressable>
              )}
            </View>
          )}

          {/* Content */}
          <View style={[
            styles.content, 
            size === 'fullscreen' && { flex: 1 },
            contentStyle
          ]}>
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: 20,
  },
  modalContent: {
    // flex will be set dynamically based on size prop
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  headerText: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#E5E7EB',
    opacity: 0.8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
});

export default GlassmorphicModal;