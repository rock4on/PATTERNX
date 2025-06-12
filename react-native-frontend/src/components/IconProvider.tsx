import React from 'react';
import { Platform } from 'react-native';
import { configureFonts } from 'react-native-paper';

// Web icon component that uses CSS classes
const WebIcon: React.FC<{ name: string; size?: number; color?: string }> = ({ 
  name, 
  size = 24, 
  color = '#000' 
}) => {
  if (Platform.OS !== 'web') {
    return null;
  }

  // Map React Native Paper icon names to Material Icons
  const iconMap: { [key: string]: string } = {
    'email': 'email',
    'lock': 'lock',
    'eye': 'visibility',
    'eye-off': 'visibility_off',
    'account': 'person',
    'at': 'alternate_email',
    'lock-check': 'lock',
    'poll': 'poll',
    'check-circle': 'check_circle',
    'gift': 'card_giftcard',
    'bell': 'notifications',
    'star': 'star',
    'information': 'info',
    'home': 'home',
    'clipboard-list': 'assignment',
    'trophy': 'emoji_events',
    'account-circle': 'account_circle',
    'menu': 'menu',
    'chevron-right': 'chevron_right',
    'chevron-left': 'chevron_left',
    'plus': 'add',
    'close': 'close',
    'check': 'check',
    'arrow-left': 'arrow_back',
    'dots-vertical': 'more_vert',
    'filter': 'filter_list',
    'sort': 'sort',
    'search': 'search',
    'refresh': 'refresh',
    'share': 'share',
    'download': 'download',
    'upload': 'upload',
    'calendar': 'event',
    'clock': 'schedule',
    'map-marker': 'location_on',
    'phone': 'phone',
    'web': 'public',
    'bookmark': 'bookmark',
    'bookmark-outline': 'bookmark_border',
    'heart': 'favorite',
    'heart-outline': 'favorite_border',
    'thumb-up': 'thumb_up',
    'thumb-down': 'thumb_down',
    'comment': 'comment',
    'share-variant': 'share',
    'link': 'link',
    'content-copy': 'content_copy',
    'delete': 'delete',
    'edit': 'edit',
    'settings': 'settings',
    'help': 'help',
    'logout': 'logout',
    'login': 'login',
    'cash': 'payments',
    'coin': 'monetization_on',
    'wallet': 'account_balance_wallet',
    'credit-card': 'credit_card',
    'qrcode': 'qr_code',
    'barcode': 'qr_code_scanner',
    'shopping': 'shopping_cart',
    'laptop': 'laptop',
    'airplane': 'flight',
    'school': 'school',
    'movie': 'movie',
    'briefcase': 'work',
    'account-group': 'group',
    'coffee': 'local_cafe',
    'crown': 'workspace_premium',
    'play': 'play_arrow',
  };

  const iconName = iconMap[name] || name;

  return React.createElement('i', {
    className: 'material-icons',
    style: {
      fontSize: size,
      color: color,
      lineHeight: 1,
      fontFamily: 'Material Icons',
      fontWeight: 'normal',
      fontStyle: 'normal',
      display: 'inline-block',
      textTransform: 'none',
      letterSpacing: 'normal',
      wordWrap: 'normal',
      whiteSpace: 'nowrap',
      direction: 'ltr',
      WebkitFontFeatureSettings: 'liga',
      WebkitFontSmoothing: 'antialiased',
      verticalAlign: 'middle',
    },
    children: iconName,
  });
};

// Configure icons for React Native Paper
export const configureIcons = () => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    // Load Material Icons font
    const loadFont = (family: string, url: string) => {
      const existingLink = document.querySelector(`link[href*="${family}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = url;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    };

    // Load all required icon fonts
    loadFont('Material+Icons', 'https://fonts.googleapis.com/icon?family=Material+Icons');
    loadFont('Material+Icons+Outlined', 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined');
    loadFont('materialdesignicons', 'https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/7.3.67/css/materialdesignicons.min.css');
    
    // Add custom CSS for icon styling
    const styleId = 'patternx-icon-styles';
    const existingStyle = document.getElementById(styleId);
    
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .material-icons {
          font-family: 'Material Icons' !important;
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          vertical-align: middle;
          user-select: none;
        }
        
        .material-icons-outlined {
          font-family: 'Material Icons Outlined' !important;
        }
        
        /* React Native Paper specific fixes */
        [data-testid*="icon"] .material-icons,
        .react-native-paper .material-icons {
          vertical-align: middle;
        }
        
        /* Ensure icons work in buttons and other components */
        button .material-icons,
        .pressable .material-icons {
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }
  }
};

// Export the web icon component for direct use
export { WebIcon };

// Create a universal icon component
export const Icon: React.FC<{ name: string; size?: number; color?: string }> = (props) => {
  if (Platform.OS === 'web') {
    return <WebIcon {...props} />;
  }
  
  // For native platforms, you would use react-native-vector-icons here
  // This is a fallback for web-only development
  return null;
};

export default configureIcons;