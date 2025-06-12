// Enhanced web icon configuration
import { Platform } from 'react-native';

export const setupWebIcons = () => {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  // Load Material Icons fonts
  const fontLinks = [
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined', 
    'https://fonts.googleapis.com/icon?family=Material+Icons+Round',
    'https://fonts.googleapis.com/icon?family=Material+Icons+Sharp',
    'https://fonts.googleapis.com/icon?family=Material+Icons+Two+Tone',
    'https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/7.3.67/css/materialdesignicons.min.css'
  ];

  fontLinks.forEach(href => {
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  });

  // Add comprehensive icon styles
  const styleId = 'react-native-paper-web-icons';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Material Icons base styling */
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

      /* Material Icons variants */
      .material-icons-outlined {
        font-family: 'Material Icons Outlined' !important;
      }
      
      .material-icons-round {
        font-family: 'Material Icons Round' !important;
      }
      
      .material-icons-sharp {
        font-family: 'Material Icons Sharp' !important;
      }
      
      .material-icons-two-tone {
        font-family: 'Material Icons Two Tone' !important;
      }

      /* Material Design Icons (MDI) */
      .mdi {
        font-family: 'Material Design Icons' !important;
        font-weight: normal;
        font-style: normal;
        display: inline-block;
        line-height: 1;
        text-decoration: inherit;
        vertical-align: middle;
      }

      /* React Native Paper specific fixes */
      [data-testid*="icon"] {
        vertical-align: middle;
        user-select: none;
      }

      /* Button icon fixes */
      button .material-icons,
      .pressable .material-icons,
      [role="button"] .material-icons {
        pointer-events: none;
        vertical-align: middle;
      }

      /* TextInput icon fixes */
      .react-native-paper-text-input-icon .material-icons {
        vertical-align: middle;
      }

      /* Chip and other component icon fixes */
      .react-native-paper-chip .material-icons,
      .react-native-paper-surface .material-icons {
        vertical-align: middle;
      }

      /* Ensure icons work in all Paper components */
      .react-native-paper * .material-icons {
        vertical-align: middle;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }
};

// Configure React Native Paper to use web icons
export const configureReactNativePaperIcons = () => {
  if (Platform.OS !== 'web') {
    return;
  }

  // Override React Native Paper's icon resolution
  const setupPaperIconOverride = () => {
    // This runs after React Native Paper is loaded
    if (typeof window !== 'undefined' && (window as any).ReactNativePaper) {
      const { configureFonts } = (window as any).ReactNativePaper;
      // Additional configuration if needed
    }
  };

  // Run setup after a short delay to ensure React Native Paper is loaded
  setTimeout(setupPaperIconOverride, 100);
};

export default setupWebIcons;