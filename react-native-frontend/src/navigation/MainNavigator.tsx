import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { Platform, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PointsHistoryScreen } from '../screens/profile/PointsHistoryScreen';

import { isWeb, isDesktop } from '../utils/platform';

import { DashboardScreen } from '../screens/main/DashboardScreen';
import { SurveysScreen } from '../screens/main/SurveysScreen';
import { RewardsScreen } from '../screens/main/RewardsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';

import type { MainTabParamList, ProfileStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
    </ProfileStack.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  
  // Calculate responsive dimensions
  const getTabBarWidth = () => {
    if (width < 400) return Math.min(width * 0.85, 320); // Small screens
    if (width < 768) return Math.min(width * 0.75, 350); // Medium screens
    return Math.min(width * 0.4, 400); // Large screens
  };
  
  const tabBarWidth = getTabBarWidth();
  const tabBarHeight = width < 400 ? 55 : 60;
  const borderRadius = tabBarHeight / 2;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'web' 
            ? 'rgba(0, 0, 0, 0.2)' 
            : 'rgba(28, 28, 30, 0.9)',
          position: 'fixed',
          bottom: 30,
          left: '50%',
          right: 'auto',
          width: tabBarWidth,
          height: tabBarHeight,
          borderRadius: borderRadius,
          marginLeft: -tabBarWidth / 2,
          zIndex: 1000,
          // Web-specific glassmorphism
          ...(isWeb && {
            paddingBottom: tabBarHeight < 60 ? 6 : 8,
            paddingTop: tabBarHeight < 60 ? 6 : 8,
            backdropFilter: 'blur(50px)',
            WebkitBackdropFilter: 'blur(50px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }),
          // Native iOS blur effect simulation
          ...(!isWeb && {
            elevation: 8,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          }),
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Surveys':
              iconName = focused ? 'file-document' : 'file-document-outline';
              break;
            case 'Rewards':
              iconName = focused ? 'gift' : 'gift-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Surveys" 
        component={SurveysScreen}
        options={{
          title: 'Surveys',
          tabBarLabel: 'Surveys',
        }}
      />
      <Tab.Screen 
        name="Rewards" 
        component={RewardsScreen}
        options={{
          title: 'Rewards',
          tabBarLabel: 'Rewards',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator}
        options={{
          headerShown: false,
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};