import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  SafeAreaView
} from 'react-native';

interface ScreenWrapperProps {
  children: React.ReactNode;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* The ScrollView now correctly wraps the content passed to it */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Base background color for all screens
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24, // Spacing from the top of the safe area
    paddingBottom: 120, // Crucial padding so content isn't hidden by the fixed bottom nav bar
  },
});