// src/config/icon-setup.web.ts

// Import the font files
import MaterialCommunityIcons from 'react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf';
import MaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf';

// Define the @font-face rules
const iconFontStyles = `
  @font-face {
    src: url(${MaterialCommunityIcons});
    font-family: 'MaterialCommunityIcons';
  }
  @font-face {
    src: url(${MaterialIcons});
    font-family: 'MaterialIcons';
  }
`;

// Create a style tag and inject it into the document head
const style = document.createElement('style');
style.type = 'text/css';

if ((style as any).styleSheet) {
  (style as any).styleSheet.cssText = iconFontStyles;
} else {
  style.appendChild(document.createTextNode(iconFontStyles));
}

document.head.appendChild(style);