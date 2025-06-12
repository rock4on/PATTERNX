import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { neumorphicDarkTheme } from './src/theme/neumorphicTheme';
import { PatternxLoader } from './src/components/PatternxLoader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// MODIFIED: This function injects a more forceful CSS rule to guarantee the page doesn't scroll.
const applyWebAppStyles = () => {
  if (Platform.OS !== 'web' || document.getElementById('global-layout-fix')) return;

  const style = document.createElement('style');
  style.id = 'global-layout-fix';
  style.textContent = `
    html, body, #root {
      width: 100%;
      height: 100%;
      /* This is the crucial part that disables scrolling on the page itself */
      overflow: hidden !important; 
    }
  `;
  document.head.append(style);
};


const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Applying the global style fix on app start
    applyWebAppStyles();

    const initializeApp = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
    };
    
    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider 
        theme={neumorphicDarkTheme}
        settings={{
          icon: (props) => <MaterialCommunityIcons {...props} />,
        }}
      >
        <AuthProvider>
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: '#6366F1',
                background: '#121212', // Set the base background color here
                card: '#1C1C1E',
                text: '#FFFFFF',
                border: 'rgba(255, 255, 255, 0.15)',
                notification: '#FF453A',
              },
            }}
          >
            <AppNavigator />
          </NavigationContainer>
          <PatternxLoader 
            visible={isLoading} 
            message="Initializing Patternx..." 
          />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;