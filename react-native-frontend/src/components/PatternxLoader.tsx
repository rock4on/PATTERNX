import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';

const { width, height } = Dimensions.get('window');

interface PatternxLoaderProps {
  visible: boolean;
  message?: string;
}

// Enhanced Patternx logo with animated elements
const AnimatedPatternxLogo: React.FC<{ size?: number }> = ({ size = 80 }) => {
  const theme = useTheme();
  const scaleAnim = new Animated.Value(0.8);
  const rotateAnim = new Animated.Value(0);
  const glowAnim = new Animated.Value(0);

  useEffect(() => {
    // Create pulsing animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Create rotation animation
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Create glow animation
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    rotate.start();
    glow.start();

    return () => {
      pulse.stop();
      rotate.stop();
      glow.stop();
    };
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={[styles.logoContainer, { width: size, height: size }]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size * 0.75,
            opacity: glowOpacity,
            borderColor: theme.colors.primary,
            transform: [{ rotate: rotation }],
          },
        ]}
      />
      
      {/* Main logo */}
      <Animated.View
        style={[
          styles.logo,
          {
            width: size,
            height: size,
            borderRadius: size * 0.5,
            backgroundColor: theme.colors.primary,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text
          variant="headlineLarge"
          style={[
            styles.logoText,
            {
              color: theme.colors.onPrimary,
              fontSize: size * 0.3,
            },
          ]}
        >
          P
        </Text>
      </Animated.View>
      
      {/* Inner pulse */}
      <Animated.View
        style={[
          styles.innerPulse,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: size * 0.3,
            backgroundColor: theme.colors.onPrimary + '20',
            opacity: glowOpacity,
          },
        ]}
      />
    </View>
  );
};

// Floating particles background
const FloatingParticles: React.FC = () => {
  const theme = useTheme();
  
  const renderParticle = (index: number) => {
    const animValue = new Animated.Value(0);
    const startDelay = index * 200;
    
    React.useEffect(() => {
      const float = Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 3000 + (index * 100),
            delay: startDelay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 3000 + (index * 100),
            useNativeDriver: true,
          }),
        ])
      );
      
      float.start();
      return () => float.stop();
    }, []);

    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [height + 50, -50],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });

    const scale = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1, 0.5],
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.particle,
          {
            left: Math.random() * width,
            backgroundColor: theme.colors.primary + '30',
            transform: [
              { translateY },
              { scale },
            ],
            opacity,
          },
        ]}
      />
    );
  };

  const particles = Array.from({ length: 12 }, (_, i) => renderParticle(i));

  return <View style={styles.particlesContainer}>{particles}</View>;
};

export const PatternxLoader: React.FC<PatternxLoaderProps> = ({
  visible,
  message = 'Loading...',
}) => {
  const theme = useTheme();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Gradient Background */}
      {Platform.OS === 'web' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.secondary}10, ${theme.colors.background})`,
          }}
        />
      )}
      
      <FloatingParticles />
      
      <View style={styles.content}>
        <AnimatedPatternxLogo size={120} />
        
        <Text
          variant="displaySmall"
          style={[
            styles.brandName,
            {
              color: theme.colors.primary,
              marginTop: 24,
              marginBottom: 8,
            },
          ]}
        >
          Patternx
        </Text>
        
        <Text
          variant="titleMedium"
          style={[
            styles.tagline,
            {
              color: theme.colors.onSurfaceVariant,
              marginBottom: 48,
            },
          ]}
        >
          Survey Platform
        </Text>
        
        <View style={styles.loadingSection}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.spinner}
          />
          <Text
            variant="bodyLarge"
            style={[
              styles.loadingText,
              {
                color: theme.colors.onSurfaceVariant,
                marginTop: 16,
              },
            ]}
          >
            {message}
          </Text>
        </View>
        
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <LoadingDot key={i} delay={i * 200} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

// Animated loading dots
const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const theme = useTheme();
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: theme.colors.primary,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoText: {
    fontWeight: '900',
    textAlign: 'center',
  },
  innerPulse: {
    position: 'absolute',
  },
  brandName: {
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingSection: {
    alignItems: 'center',
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
  loadingText: {
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});