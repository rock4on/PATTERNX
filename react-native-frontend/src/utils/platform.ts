import { Platform, Dimensions } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isMobile = isIOS || isAndroid;

// Get screen dimensions
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Check if device is tablet-sized (for responsive design)
export const isTablet = () => {
  const { width } = getScreenDimensions();
  return width >= 768;
};

// Check if device is desktop-sized
export const isDesktop = () => {
  const { width } = getScreenDimensions();
  return width >= 1024;
};

// Get appropriate navigation style based on platform and screen size
export const getNavigationStyle = () => {
  if (isWeb) {
    if (isDesktop()) {
      return 'sidebar'; // Desktop web can use sidebar navigation
    } else if (isTablet()) {
      return 'tabs'; // Tablet web uses tab navigation
    }
  }
  return 'tabs'; // Mobile always uses tab navigation
};

// Platform-specific styles helper
export const platformSelect = <T>(options: {
  web?: T;
  ios?: T;
  android?: T;
  native?: T;
  default?: T;
}): T | undefined => {
  if (isWeb && options.web !== undefined) {
    return options.web;
  }
  if (isIOS && options.ios !== undefined) {
    return options.ios;
  }
  if (isAndroid && options.android !== undefined) {
    return options.android;
  }
  if (isMobile && options.native !== undefined) {
    return options.native;
  }
  return options.default;
};