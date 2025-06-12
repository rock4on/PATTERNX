import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import {
  Text,
  useTheme,
} from 'react-native-paper';
import { Icon } from './IconProvider';

export interface NeumorphicTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'success' | 'error' | 'warning';
  disabled?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  helperText?: string;
  errorText?: string;
  showCharacterCount?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  blurOnSubmit?: boolean;
  floatingLabel?: boolean;
}

export const NeumorphicTextInput: React.FC<NeumorphicTextInputProps> = ({
  value,
  onChangeText,
  label,
  placeholder,
  icon,
  iconPosition = 'left',
  size = 'medium',
  variant = 'default',
  disabled = false,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  autoFocus = false,
  maxLength,
  helperText,
  errorText,
  showCharacterCount = false,
  style,
  inputStyle,
  onFocus,
  onBlur,
  onSubmitEditing,
  returnKeyType = 'done',
  blurOnSubmit = true,
  floatingLabel = true,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLabelFloating, setIsLabelFloating] = useState(value.length > 0);

  const focusAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(value.length > 0 ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Size configurations
  const sizeConfig = {
    small: {
      height: 40,
      fontSize: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      iconSize: 16,
      labelFontSize: 12,
    },
    medium: {
      height: 48,
      fontSize: 16,
      paddingHorizontal: 16,
      borderRadius: 16,
      iconSize: 20,
      labelFontSize: 14,
    },
    large: {
      height: 56,
      fontSize: 18,
      paddingHorizontal: 20,
      borderRadius: 20,
      iconSize: 24,
      labelFontSize: 16,
    },
  };

  // Variant configurations
  const variantConfig = {
    default: {
      borderColor: 'rgba(255, 255, 255, 0.15)',
      focusedBorderColor: theme.colors.primary,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      textColor: theme.colors.onSurface,
      labelColor: theme.colors.onSurfaceVariant,
      iconColor: theme.colors.onSurfaceVariant,
    },
    success: {
      borderColor: 'rgba(48, 209, 88, 0.3)',
      focusedBorderColor: '#30D158',
      backgroundColor: 'rgba(48, 209, 88, 0.05)',
      textColor: theme.colors.onSurface,
      labelColor: '#30D158',
      iconColor: '#30D158',
    },
    error: {
      borderColor: 'rgba(255, 69, 58, 0.3)',
      focusedBorderColor: '#FF453A',
      backgroundColor: 'rgba(255, 69, 58, 0.05)',
      textColor: theme.colors.onSurface,
      labelColor: '#FF453A',
      iconColor: '#FF453A',
    },
    warning: {
      borderColor: 'rgba(255, 159, 10, 0.3)',
      focusedBorderColor: '#FF9F0A',
      backgroundColor: 'rgba(255, 159, 10, 0.05)',
      textColor: theme.colors.onSurface,
      labelColor: '#FF9F0A',
      iconColor: '#FF9F0A',
    },
  };

  const config = sizeConfig[size];
  const colors = variantConfig[variant];

  // Animation effects
  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  useEffect(() => {
    if (floatingLabel) {
      const shouldFloat = isFocused || value.length > 0;
      setIsLabelFloating(shouldFloat);
      
      Animated.timing(labelAnim, {
        toValue: shouldFloat ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, value, floatingLabel]);

  // Handlers
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleIconPress = () => {
    if (secureTextEntry && iconPosition === 'right') {
      setShowPassword(!showPassword);
    } else {
      inputRef.current?.focus();
    }
  };

  // Get container style
  const getContainerStyle = (): ViewStyle => {
    const baseHeight = multiline ? Math.max(config.height, numberOfLines * 20 + 16) : config.height;
    
    if (Platform.OS === 'web') {
      return {
        backgroundColor: colors.backgroundColor,
        backdropFilter: 'blur(10px)',
        borderRadius: config.borderRadius,
        border: `1px solid ${borderAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.borderColor, colors.focusedBorderColor],
        })}`,
        height: baseHeight,
        boxShadow: focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [
            'inset 2px 2px 6px rgba(0, 0, 0, 0.2)',
            `inset 2px 2px 6px rgba(0, 0, 0, 0.2), 0 0 0 2px ${colors.focusedBorderColor}20`,
          ],
        }),
        transition: 'all 0.2s ease',
      } as ViewStyle;
    } else {
      return {
        backgroundColor: colors.backgroundColor,
        borderRadius: config.borderRadius,
        borderWidth: 1,
        borderColor: colors.borderColor,
        height: baseHeight,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 0,
      };
    }
  };

  // Get label style
  const getLabelStyle = (): ViewStyle & TextStyle => {
    if (!floatingLabel || !label) return {};

    return {
      position: 'absolute',
      left: icon && iconPosition === 'left' ? config.iconSize + 24 : 16,
      top: labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [config.height / 2 - config.fontSize / 2, 8],
      }),
      fontSize: labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [config.fontSize, config.labelFontSize],
      }),
      color: colors.labelColor,
      backgroundColor: 'transparent',
      zIndex: 1,
    };
  };

  // Calculate input padding
  const getInputPadding = () => {
    const leftPadding = icon && iconPosition === 'left' 
      ? config.iconSize + 24 
      : config.paddingHorizontal;
    
    const rightPadding = (icon && iconPosition === 'right') || secureTextEntry
      ? config.iconSize + 24
      : config.paddingHorizontal;

    const topPadding = floatingLabel && label && isLabelFloating
      ? config.labelFontSize + 8
      : multiline ? 12 : 0;

    return {
      paddingLeft: leftPadding,
      paddingRight: rightPadding,
      paddingTop: topPadding,
      paddingBottom: multiline ? 12 : 0,
    };
  };

  const currentVariant = errorText ? 'error' : variant;
  const displayText = helperText || errorText;
  const currentCharCount = value.length;

  return (
    <View style={[styles.wrapper, style]}>
      {/* Fixed label for non-floating design */}
      {label && !floatingLabel && (
        <Text
          style={[
            styles.fixedLabel,
            {
              color: variantConfig[currentVariant].labelColor,
              fontSize: config.labelFontSize,
              marginBottom: 8,
            },
          ]}
        >
          {label}
        </Text>
      )}

      {/* Input container */}
      <View style={[styles.container, getContainerStyle()]}>
        {/* Floating label */}
        {label && floatingLabel && (
          <Animated.Text
            style={[
              styles.floatingLabel,
              getLabelStyle(),
            ]}
            pointerEvents="none"
          >
            {label}
          </Animated.Text>
        )}

        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          <Pressable
            style={[styles.iconContainer, { left: 12 }]}
            onPress={handleIconPress}
          >
            <Icon
              name={icon}
              size={config.iconSize}
              color={variantConfig[currentVariant].iconColor}
            />
          </Pressable>
        )}

        {/* Text input */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={!floatingLabel ? placeholder : (isLabelFloating ? placeholder : '')}
          placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoFocus={autoFocus}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          editable={!disabled}
          style={[
            styles.input,
            {
              fontSize: config.fontSize,
              color: variantConfig[currentVariant].textColor,
              textAlignVertical: multiline ? 'top' : 'center',
              ...getInputPadding(),
            },
            inputStyle,
          ]}
        />

        {/* Right icon or password toggle */}
        {((icon && iconPosition === 'right') || secureTextEntry) && (
          <Pressable
            style={[styles.iconContainer, { right: 12 }]}
            onPress={handleIconPress}
          >
            <Icon
              name={
                secureTextEntry
                  ? showPassword
                    ? 'eye-off'
                    : 'eye'
                  : icon!
              }
              size={config.iconSize}
              color={variantConfig[currentVariant].iconColor}
            />
          </Pressable>
        )}
      </View>

      {/* Helper/Error text and character count */}
      {(displayText || (showCharacterCount && maxLength)) && (
        <View style={styles.bottomRow}>
          {displayText && (
            <Text
              style={[
                styles.helperText,
                {
                  color: errorText 
                    ? variantConfig.error.labelColor
                    : theme.colors.onSurfaceVariant,
                  fontSize: config.labelFontSize,
                },
              ]}
            >
              {displayText}
            </Text>
          )}
          
          {showCharacterCount && maxLength && (
            <Text
              style={[
                styles.characterCount,
                {
                  color: currentCharCount > maxLength * 0.9
                    ? variantConfig.warning.labelColor
                    : theme.colors.onSurfaceVariant,
                  fontSize: config.labelFontSize,
                },
              ]}
            >
              {currentCharCount}/{maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  fixedLabel: {
    fontWeight: '500',
  },
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  floatingLabel: {
    fontWeight: '500',
    pointerEvents: 'none',
  },
  input: {
    flex: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    minWidth: 24,
    minHeight: 24,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  helperText: {
    flex: 1,
    fontWeight: '400',
  },
  characterCount: {
    fontWeight: '400',
    marginLeft: 8,
  },
});

export default NeumorphicTextInput;