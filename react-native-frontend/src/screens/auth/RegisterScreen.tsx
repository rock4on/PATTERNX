import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
  Pressable,
  TextInput,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import {
  Text,
  Snackbar,
  useTheme,
  ProgressBar,
  Icon as PaperIcon,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
const { width, height } = Dimensions.get('window');

const AnimatedGradientLayer: React.FC<{ layerConfig: any }> = ({ layerConfig }) => {
  const { color, size, initialTop, initialLeft } = layerConfig;
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    const random = (min: number, max: number) => min + Math.random() * (max - min);
    const positionLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(position, { toValue: { x: random(-width * 0.2, width * 0.2), y: random(-height * 0.2, height * 0.2) }, duration: random(15000, 20000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(position, { toValue: { x: 0, y: 0 }, duration: random(15000, 20000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    positionLoop.start();
    return () => positionLoop.stop();
  }, [position]);

  const layerStyle: ViewStyle = { position: 'absolute', width: size, height: size, borderRadius: size / 2, top: initialTop, left: initialLeft, backgroundColor: color, opacity: 0.6 };
  return ( <Animated.View style={[{ transform: position.getTranslateTransform() }]}><View style={layerStyle} /></Animated.View> );
};

const SlowGradientBackground = () => {
  const [layers, setLayers] = useState([]);
  useEffect(() => {
    const gradientLayers = [
      { id: 1, color: '#F59E0B', size: width * 1.5, initialTop: '-25%', initialLeft: '-50%' },
      { id: 2, color: '#EC4899', size: width * 1.5, initialTop: '0%', initialLeft: '25%' },
      { id: 3, color: '#8B5CF6', size: width * 1.2, initialTop: '50%', initialLeft: '-25%' },
    ];
    setLayers(gradientLayers);
  }, []);

  return (
    <View style={styles.backgroundContainer}>
      <View style={styles.gradientOverlay} />
      {layers.map(layer => (<AnimatedGradientLayer key={layer.id} layerConfig={layer} />))}
    </View>
  );
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', username: '', password: '', confirmPassword: '', first_name: '', last_name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 0.25;
    if (password.match(/[a-z]/)) strength += 0.25;
    if (password.match(/[A-Z]/)) strength += 0.25;
    if (password.match(/[0-9]/)) strength += 0.25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 0.25; // Bonus for special character
    setPasswordStrength(Math.min(strength, 1));
  }, [formData.password]);

  const handleRegister = async () => {
    // Validation logic...
    const result = await register(formData);
    if (!result.success) {
      setError(result.error || 'Registration failed');
      setShowError(true);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 0.4) return theme.colors.error;
    if (passwordStrength < 0.8) return '#F59E0B'; // amber
    return '#4ADE80'; // green
  };

  return (
    <View style={styles.container}>
      <SlowGradientBackground />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Create Account</Text>
                <Text style={styles.headerSubtitle}>Join Patternx to start earning.</Text>
            </View>
            
            <View style={styles.formContainer}>
                <View style={styles.nameRow}>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                        <TextInput placeholder="First Name" placeholderTextColor="rgba(255,255,255,0.4)" value={formData.first_name} onChangeText={(val) => setFormData(p => ({...p, first_name: val}))} style={styles.input} />
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                        <TextInput placeholder="Last Name" placeholderTextColor="rgba(255,255,255,0.4)" value={formData.last_name} onChangeText={(val) => setFormData(p => ({...p, last_name: val}))} style={styles.input} />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput placeholder="Username" placeholderTextColor="rgba(255,255,255,0.4)" value={formData.username} onChangeText={(val) => setFormData(p => ({...p, username: val}))} style={styles.input} autoCapitalize="none" />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput placeholder="Email" placeholderTextColor="rgba(255,255,255,0.4)" value={formData.email} onChangeText={(val) => setFormData(p => ({...p, email: val}))} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput placeholder="Password" placeholderTextColor="rgba(255,255,255,0.4)" value={formData.password} onChangeText={(val) => setFormData(p => ({...p, password: val}))} secureTextEntry={!showPassword} style={styles.input} />
                    <Pressable onPress={() => setShowPassword(!showPassword)}><PaperIcon source={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(255,255,255,0.4)" /></Pressable>
                </View>
                {formData.password.length > 0 && (
                  <ProgressBar progress={passwordStrength} color={getPasswordStrengthColor()} style={styles.strengthBar} />
                )}

                <View style={styles.inputContainer}>
                    <TextInput placeholder="Confirm Password" placeholderTextColor="rgba(255,255,255,0.4)" value={formData.confirmPassword} onChangeText={(val) => setFormData(p => ({...p, confirmPassword: val}))} secureTextEntry={!showConfirmPassword} style={styles.input} />
                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}><PaperIcon source={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(255,255,255,0.4)" /></Pressable>
                </View>

                <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleRegister} disabled={isLoading}>
                    <Text style={styles.buttonText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
                </Pressable>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Pressable onPress={() => navigation.navigate('Login')}><Text style={styles.linkText}>Sign In</Text></Pressable>
            </View>
        </View>
      </ScrollView>

      <Snackbar visible={showError} onDismiss={() => setShowError(false)} duration={4000} style={{ backgroundColor: theme.colors.errorContainer }}>
        <Text style={{color: theme.colors.onErrorContainer}}>{error}</Text>
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0A0A0A', overflow: 'hidden' },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 10, 10, 0.5)', zIndex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24, zIndex: 2 },
  content: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)' },
  formContainer: { backgroundColor: 'rgba(28, 28, 30, 0.7)', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', ...(Platform.OS === 'web' && { backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }) },
  nameRow: { flexDirection: 'row', gap: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, height: 50, backgroundColor: 'transparent', color: '#fff', fontSize: 16, outlineStyle: 'none', borderWidth: 0 },
  strengthBar: { height: 4, borderRadius: 2, marginTop: -12, marginBottom: 16 },
  button: { backgroundColor: '#6366F1', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonPressed: { backgroundColor: '#4F46E5' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 8 },
  footerText: { color: 'rgba(255,255,255,0.6)' },
  linkText: { color: '#6366F1', fontWeight: 'bold' },
});