import React, { useState, useRef, useEffect } from 'react';
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
  ViewStyle
} from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator, // MODIFIED: Using Paper's ActivityIndicator for the button
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
const { width, height } = Dimensions.get('window');

// --- NOTIFICATION COMPONENT ---
const LoginNotification: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
    const slideAnim = useRef(new Animated.Value(-150)).current;
    const theme = useTheme();

    useEffect(() => {
        if (message) {
            Animated.sequence([
                Animated.spring(slideAnim, { toValue: Platform.OS === 'web' ? 24 : 60, useNativeDriver: true, tension: 100, friction: 15 }),
                Animated.delay(4000),
                Animated.timing(slideAnim, { toValue: -150, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
            ]).start(() => {
                onDismiss();
            });
        }
    }, [message, slideAnim, onDismiss]);

    if (!message) return null;
    
    const backgroundColor = 'rgba(255, 69, 58, 0.7)';
    const borderColor = theme.colors.error;

    return (
        <Animated.View style={[styles.notificationContainer, { backgroundColor, borderColor, transform: [{ translateY: slideAnim }] }]}>
            <Icon name="alert-circle-outline" size={24} color="#fff" />
            <Text style={styles.notificationText}>{message}</Text>
        </Animated.View>
    );
};

// ... (Background components remain the same)
const AnimatedGradientLayer: React.FC<{ layerConfig: any }> = ({ layerConfig }) => {
  const { color, size, initialTop, initialLeft } = layerConfig;
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  useEffect(() => {
    const random = (min: number, max: number) => min + Math.random() * (max - min);
    const positionLoop = Animated.loop( Animated.sequence([ Animated.timing(position, { toValue: { x: random(-width * 0.2, width * 0.2), y: random(-height * 0.2, height * 0.2) }, duration: random(15000, 20000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) }), Animated.timing(position, { toValue: { x: 0, y: 0 }, duration: random(15000, 20000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) }) ]) );
    positionLoop.start();
    return () => positionLoop.stop();
  }, [position]);
  const layerStyle: ViewStyle = { position: 'absolute', width: size, height: size, borderRadius: size / 2, top: initialTop, left: initialLeft, backgroundColor: color, opacity: 0.6 };
  return ( <Animated.View style={[{ transform: position.getTranslateTransform() }]}><View style={layerStyle} /></Animated.View> );
};
const SlowGradientBackground = () => {
  const [layers, setLayers] = useState([]);
  useEffect(() => {
    const gradientLayers = [ { id: 1, color: '#F59E0B', size: width * 1.5, initialTop: '-25%', initialLeft: '-50%' }, { id: 2, color: '#EC4899', size: width * 1.5, initialTop: '0%', initialLeft: '25%' }, { id: 3, color: '#8B5CF6', size: width * 1.2, initialTop: '50%', initialLeft: '-25%' } ];
    setLayers(gradientLayers);
  }, []);
  return ( <View style={styles.backgroundContainer}><View style={styles.gradientOverlay} />{layers.map(layer => <AnimatedGradientLayer key={layer.id} layerConfig={layer} />)}</View> );
};


export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState('');
  // MODIFIED: Added local loading state for the button
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  
  const handleLogin = async () => {
    if (isButtonLoading) return;
    if (!email || !password) {
      setNotification('Please fill in all fields');
      return;
    }
    
    setIsButtonLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setNotification(result.error || 'Login failed');
      }
    } catch (error) {
        setNotification('An unknown error occurred.');
    } finally {
        setIsButtonLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SlowGradientBackground />
      <LoginNotification message={notification} onDismiss={() => setNotification('')} />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Welcome Back</Text>
                <Text style={styles.headerSubtitle}>Sign in to your Patternx account.</Text>
            </View>
            
            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Icon name="email-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                    <TextInput placeholder="Email" placeholderTextColor="rgba(255,255,255,0.4)" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
                </View>

                <View style={styles.inputContainer}>
                    <Icon name="lock-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                    <TextInput placeholder="Password" placeholderTextColor="rgba(255,255,255,0.4)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} style={styles.input} />
                    <Pressable onPress={() => setShowPassword(!showPassword)}><Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} /></Pressable>
                </View>

                <Pressable
                    style={({ pressed }) => [styles.signInButton, (pressed || isButtonLoading) && styles.buttonPressed]}
                    onPress={handleLogin}
                    disabled={isButtonLoading}
                >
                    {isButtonLoading ? (
                        <ActivityIndicator animating={true} color="#fff" />
                    ) : (
                        <Text style={styles.signInButtonText}>Sign In</Text>
                    )}
                </Pressable>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <Pressable onPress={() => navigation.navigate('Register')} disabled={isButtonLoading}>
                    <Text style={styles.signUpText}>Sign Up</Text>
                </Pressable>
            </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ... (Styles remain the same, adding notification styles)
const styles = StyleSheet.create({
  // ... (all previous styles are the same)
  container: { flex: 1 },
  backgroundContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0A0A0A', overflow: 'hidden' },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 10, 10, 0.5)', zIndex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24, zIndex: 2 },
  content: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)' },
  formContainer: { backgroundColor: 'rgba(28, 28, 30, 0.7)', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', ...(Platform.OS === 'web' && { backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }) },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inputIcon: { marginRight: 12, },
  input: { flex: 1, height: 50, backgroundColor: 'transparent', color: '#fff', fontSize: 16, outlineStyle: 'none', borderWidth: 0 },
  signInButton: { backgroundColor: '#6366F1', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 8, flexDirection: 'row' },
  buttonPressed: { backgroundColor: '#4F46E5' },
  signInButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 8 },
  footerText: { color: 'rgba(255,255,255,0.6)' },
  signUpText: { color: '#6366F1', fontWeight: 'bold' },
  notificationContainer: { position: 'absolute', top: 0, left: 24, right: 24, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, zIndex: 9999, ...(Platform.OS === 'web' && { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }) },
  notificationText: { color: '#fff', fontSize: 16, fontWeight: '500', marginLeft: 12, flex: 1 },
});