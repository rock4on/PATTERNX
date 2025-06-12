// index.web.js

import { AppRegistry } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { materialTheme } from './src/theme/materialTheme';

// 1. Import your working icon setup file. This is the crucial fix.
import './src/config/icon-setup.web.ts';

const Root = () => (
  <NavigationContainer>
    <AuthProvider>
      <PaperProvider theme={materialTheme}>
        <AppNavigator />
      </PaperProvider>
    </AuthProvider>
  </NavigationContainer>
);

AppRegistry.registerComponent('main', () => Root);

AppRegistry.runApplication('main', {
  rootTag: document.getElementById('root'),
});