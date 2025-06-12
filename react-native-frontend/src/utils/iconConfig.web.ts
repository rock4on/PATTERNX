// src/utils/iconConfig.web.ts

import { Platform } from 'react-native';
// 1. Import your theme to access its colors
import { lightTheme } from '../theme/materialTheme';

export const configurePaperIcons = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Ensure Material Icons font is loaded
    const existingLink = document.querySelector('link[href*="Material+Icons"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Add additional Material Icons variants
    const variants = [
      'Material+Icons+Outlined',
      'Material+Icons+Round',
      'Material+Icons+Sharp',
      'Material+Icons+Two+Tone'
    ];
    
    variants.forEach(variant => {
      const existingVariant = document.querySelector(`link[href*="${variant}"]`);
      if (!existingVariant) {
        const linkVariant = document.createElement('link');
        linkVariant.href = `https://fonts.googleapis.com/icon?family=${variant}`;
        linkVariant.rel = 'stylesheet';
        document.head.appendChild(linkVariant);
      }
    });

    // Ensure Material Design Icons (MDI) font is loaded
    const existingMDI = document.querySelector('link[href*="materialdesignicons"]');
    if (!existingMDI) {
      const mdiLink = document.createElement('link');
      mdiLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/7.3.67/css/materialdesignicons.min.css';
      mdiLink.rel = 'stylesheet';
      document.head.appendChild(mdiLink);
    }

    // Add custom CSS for layout, icons, and theme synchronization
    const existingStyle = document.querySelector('#patternx-icon-styles');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'patternx-icon-styles';
      style.type = 'text/css';
      
      const newStyles = `
        /* 2. Apply theme colors to the root elements */
        html, body, #root {
          height: 100%;
          display: flex;
          flex-direction: column;
          background-color: ${lightTheme.colors.background}; /* Use theme background */
          color: ${lightTheme.colors.onBackground};          /* Use theme text color */
        }

        #root {
          flex: 1;
        }

        /* --- Rest of the icon styles --- */
        .material-icons {
          font-family: 'Material Icons';
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
        }
        
        .mdi {
          font-family: 'Material Design Icons';
          font-weight: normal;
          font-style: normal;
          display: inline-block;
          line-height: 1;
          text-decoration: inherit;
        }
        
        [data-testid*="icon"], .material-icons, .mdi {
          vertical-align: middle;
          user-select: none;
        }
      `;
      
      style.appendChild(document.createTextNode(newStyles));
      document.head.appendChild(style);
    }
  }
};

// Icon name mapping for better compatibility
export const getCompatibleIconName = (iconName: string): string => {
  // Map React Native Paper icon names to Material Icons names
  const iconMap: { [key: string]: string } = {
    // Authentication icons
    'email': 'email',
    'lock': 'lock',
    'eye': 'visibility',
    'eye-off': 'visibility_off',
    'account': 'person',
    'at': 'alternate_email',
    'lock-check': 'lock',
    
    // Navigation icons
    'home': 'home',
    'arrow-left': 'arrow_back',
    'arrow-right': 'arrow_forward',
    'chevron-left': 'chevron_left',
    'chevron-right': 'chevron_right',
    'menu': 'menu',
    'close': 'close',
    
    // Action icons
    'plus': 'add',
    'check': 'check',
    'check-circle': 'check_circle',
    'star': 'star',
    'heart': 'favorite',
    'heart-outline': 'favorite_border',
    'bookmark': 'bookmark',
    'bookmark-outline': 'bookmark_border',
    'share': 'share',
    'download': 'download',
    'upload': 'upload',
    'edit': 'edit',
    'delete': 'delete',
    'copy': 'content_copy',
    'refresh': 'refresh',
    
    // Survey and rewards icons
    'poll': 'poll',
    'gift': 'card_giftcard',
    'trophy': 'emoji_events',
    'cash': 'payments',
    'coin': 'monetization_on',
    'wallet': 'account_balance_wallet',
    'credit-card': 'credit_card',
    
    // Social and communication
    'bell': 'notifications',
    'comment': 'comment',
    'phone': 'phone',
    'message': 'message',
    
    // Utility icons
    'search': 'search',
    'filter': 'filter_list',
    'sort': 'sort',
    'settings': 'settings',
    'help': 'help',
    'info': 'info',
    'warning': 'warning',
    'error': 'error',
    
    // Time and calendar
    'calendar': 'event',
    'clock': 'schedule',
    
    // Location
    'map-marker': 'location_on',
    'navigation': 'navigation',
    
    // Media
    'play': 'play_arrow',
    'pause': 'pause',
    'stop': 'stop',
    'volume-high': 'volume_up',
    'volume-off': 'volume_off',
    
    // File and data
    'file': 'description',
    'folder': 'folder',
    'cloud': 'cloud',
    'database': 'storage',
    
    // Business and work
    'briefcase': 'work',
    'building': 'business',
    'chart': 'analytics',
    'trending-up': 'trending_up',
    
    // Categories
    'shopping': 'shopping_cart',
    'laptop': 'laptop',
    'airplane': 'flight',
    'school': 'school',
    'movie': 'movie',
    
    // User and profile
    'account-circle': 'account_circle',
    'account-group': 'group',
    'logout': 'logout',
    'login': 'login',
  };
  
  return iconMap[iconName] || iconName;
};

export default configurePaperIcons;