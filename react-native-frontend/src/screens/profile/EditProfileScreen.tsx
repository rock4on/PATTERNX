import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Snackbar,
  useTheme,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import { createGlassStyle, createNeumorphicContainerStyle, createInteractiveButtonStyle } from '../../theme/neumorphicTheme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'EditProfile'>;

interface ProfileFormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  county: string;
  city: string;
  education_level: string;
  residence_environment: string;
}

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const educationOptions = [
  { value: 'Elementary', label: 'Elementary' },
  { value: 'High School', label: 'High School' },
  { value: 'Bachelor', label: 'Bachelor' },
  { value: 'Master', label: 'Master' },
  { value: 'PhD', label: 'PhD' },
];

const residenceOptions = [
  { value: 'Urban', label: 'Urban' },
  { value: 'Rural', label: 'Rural' },
];

const { width } = Dimensions.get('window');

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { refreshUser } = useAuth();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    county: '',
    city: '',
    education_level: '',
    residence_environment: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    fetchProfile();
  }, []);
  
  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading]);

  const fetchProfile = async () => {
    try {
      const response = await apiService.getUserProfile();
      if (response.success && response.data) {
        const { user, profile } = response.data;
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          date_of_birth: profile?.date_of_birth || '',
          gender: profile?.gender || '',
          county: profile?.county || '',
          city: profile?.city || '',
          education_level: profile?.education_level || '',
          residence_environment: profile?.residence_environment || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setSnackbar({ visible: true, message: 'Failed to load profile', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setSnackbar({ visible: true, message: 'First name and last name are required', type: 'error' });
      return false;
    }

    // Validate date format if provided
    if (formData.date_of_birth) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.date_of_birth)) {
        setSnackbar({ visible: true, message: 'Date of birth must be in YYYY-MM-DD format', type: 'error' });
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const response = await apiService.updateUserProfile(formData);
      if (response.success) {
        setSnackbar({ visible: true, message: 'Profile updated successfully!', type: 'success' });
        await refreshUser(); // Refresh user data in context
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        setSnackbar({ visible: true, message: response.error || 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      setSnackbar({ visible: true, message: 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#0A0A0A' }]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text variant="bodyLarge" style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
          ✨ Loading profile data...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#0A0A0A' }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={[styles.card, createGlassStyle({ intensity: 'medium', radius: 24 })]}>
              <Text variant="headlineSmall" style={[styles.title, { color: '#6366F1', fontWeight: '700' }]}>
                ✏️ Edit Profile
              </Text>

              {/* Basic Information */}
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground, fontWeight: '600' }]}>
                👤 Basic Information
              </Text>

              <View style={styles.nameRow}>
                <View style={[styles.inputContainer, createNeumorphicContainerStyle({ size: 'medium', recessed: true })]}>
                  <TextInput
                    label="👤 First Name *"
                    value={formData.first_name}
                    onChangeText={(value) => updateField('first_name', value)}
                    mode="flat"
                    style={styles.nameInput}
                    autoCapitalize="words"
                    underlineStyle={{ display: 'none' }}
                    contentStyle={{ backgroundColor: 'transparent' }}
                    theme={{
                      colors: {
                        onSurfaceVariant: theme.colors.onSurfaceVariant,
                        primary: '#6366F1',
                      },
                    }}
                  />
                </View>
                <View style={[styles.inputContainer, createNeumorphicContainerStyle({ size: 'medium', recessed: true })]}>
                  <TextInput
                    label="👤 Last Name *"
                    value={formData.last_name}
                    onChangeText={(value) => updateField('last_name', value)}
                    mode="flat"
                    style={styles.nameInput}
                    autoCapitalize="words"
                    underlineStyle={{ display: 'none' }}
                    contentStyle={{ backgroundColor: 'transparent' }}
                    theme={{
                      colors: {
                        onSurfaceVariant: theme.colors.onSurfaceVariant,
                        primary: '#6366F1',
                      },
                    }}
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, createNeumorphicContainerStyle({ size: 'medium', recessed: true })]}>
                <TextInput
                  label="📅 Date of Birth (YYYY-MM-DD)"
                  value={formData.date_of_birth}
                  onChangeText={(value) => updateField('date_of_birth', value)}
                  mode="flat"
                  style={styles.input}
                  placeholder="1990-01-01"
                  keyboardType="numeric"
                  underlineStyle={{ display: 'none' }}
                  contentStyle={{ backgroundColor: 'transparent' }}
                  theme={{
                    colors: {
                      onSurfaceVariant: theme.colors.onSurfaceVariant,
                      primary: '#6366F1',
                    },
                  }}
                />
              </View>

              {/* Gender Selection */}
              <Text variant="titleSmall" style={[styles.fieldLabel, { color: theme.colors.onSurface, fontWeight: '600' }]}>
                🚻 Gender
              </Text>
              <View style={[styles.segmentedContainer, createGlassStyle({ intensity: 'subtle', radius: 16 })]}>
                <SegmentedButtons
                  value={formData.gender}
                  onValueChange={(value) => updateField('gender', value)}
                  buttons={genderOptions.map(option => ({
                    ...option,
                    style: { backgroundColor: 'transparent' }
                  }))}
                  style={styles.segmentedButtons}
                />
              </View>

              {/* Location */}
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground, fontWeight: '600' }]}>
                📍 Location
              </Text>

              <View style={[styles.inputContainer, createNeumorphicContainerStyle({ size: 'medium', recessed: true })]}>
                <TextInput
                  label="🏛️ County"
                  value={formData.county}
                  onChangeText={(value) => updateField('county', value)}
                  mode="flat"
                  style={styles.input}
                  autoCapitalize="words"
                  underlineStyle={{ display: 'none' }}
                  contentStyle={{ backgroundColor: 'transparent' }}
                  theme={{
                    colors: {
                      onSurfaceVariant: theme.colors.onSurfaceVariant,
                      primary: '#6366F1',
                    },
                  }}
                />
              </View>

              <View style={[styles.inputContainer, createNeumorphicContainerStyle({ size: 'medium', recessed: true })]}>
                <TextInput
                  label="🏙️ City"
                  value={formData.city}
                  onChangeText={(value) => updateField('city', value)}
                  mode="flat"
                  style={styles.input}
                  autoCapitalize="words"
                  underlineStyle={{ display: 'none' }}
                  contentStyle={{ backgroundColor: 'transparent' }}
                  theme={{
                    colors: {
                      onSurfaceVariant: theme.colors.onSurfaceVariant,
                      primary: '#6366F1',
                    },
                  }}
                />
              </View>

            {/* Education and Residence */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Additional Information
            </Text>

            <Text variant="titleSmall" style={styles.fieldLabel}>
              Education Level
            </Text>
            <SegmentedButtons
              value={formData.education_level}
              onValueChange={(value) => updateField('education_level', value)}
              buttons={educationOptions}
              style={styles.segmentedButtons}
            />

            <Text variant="titleSmall" style={styles.fieldLabel}>
              Residence Environment
            </Text>
            <SegmentedButtons
              value={formData.residence_environment}
              onValueChange={(value) => updateField('residence_environment', value)}
              buttons={residenceOptions}
              style={styles.segmentedButtons}
            />

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.button}
                loading={isSaving}
                disabled={isSaving}
              >
                Save Changes
              </Button>
            </View>
            </View>
          </Animated.View>
        </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={4000}
        style={{
          backgroundColor: snackbar.type === 'success' ? theme.colors.primary : theme.colors.error,
        }}
      >
        {snackbar.message}
      </Snackbar>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    elevation: 2,
  },
  cardContent: {
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '400',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 16,
    fontWeight: '500',
  },
  fieldLabel: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});