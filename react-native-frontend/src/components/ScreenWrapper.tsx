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
    backgroundColor: '#0A0A0A', // Base background color matching dashboard
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24, // Spacing from the top of the safe area
    paddingBottom: 100, // Adjusted padding for disconnected control bar
  },
});