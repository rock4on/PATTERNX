import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ViewStyle,
  Easing,
  Animated,
} from 'react-native';
import {
  Text,
  useTheme,
  Avatar,
  Icon as PaperIcon,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainTabParamList, 'Profile'>;

// MODIFIED: A new animated background component with a unique color palette for the profile screen.
type BlobConfig = { id: number; colors: string[]; size: number; initialTop: string; initialLeft: string; opacity: Animated.Value; };

const AnimatedAuroraShape: React.FC<{ blob: BlobConfig }> = ({ blob }) => {
  const { opacity, size, colors, initialTop, initialLeft } = blob;
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => { Animated.timing(opacity, { toValue: 1, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }).start(); }, [opacity]);

  useEffect(() => {
    const random = (min: number, max: number) => min + Math.random() * (max - min);
    const positionLoop = Animated.loop(Animated.sequence([ Animated.timing(position, { toValue: { x: random(-70, 70), y: random(-90, 90) }, duration: random(5000, 8000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) }), Animated.timing(position, { toValue: { x: 0, y: 0 }, duration: random(5000, 8000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) }) ]));
    const scaleLoop = Animated.loop(Animated.sequence([ Animated.timing(scale, { toValue: 1.25, duration: random(4000, 7000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) }), Animated.timing(scale, { toValue: 1, duration: random(4000, 7000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) }) ]));
    positionLoop.start();
    scaleLoop.start();
    return () => { positionLoop.stop(); scaleLoop.stop(); };
  }, [position, scale]);
  
  const renderShapeLayer = (color: string, i: number) => {
    const layerSize = size * (1 - i * 0.15);
    const shapeStyle: ViewStyle = { position: 'absolute', width: layerSize, height: layerSize, borderRadius: layerSize / 2 };
    const webStyle: ViewStyle = Platform.OS === 'web' ? { background: `radial-gradient(circle, ${color}99 0%, transparent 60%)`, filter: `blur(${100 - i * 20}px)` } : {};
    const nativeStyle: ViewStyle = Platform.OS !== 'web' ? { backgroundColor: color, opacity: 0.5 - i * 0.1 } : {};
    return <View key={i} style={[shapeStyle, webStyle, nativeStyle]} />;
  };

  return (
    <Animated.View style={[{ position: 'absolute', top: initialTop, left: initialLeft, width: size, height: size, opacity: opacity, alignItems: 'center', justifyContent: 'center', transform: [ { translateX: position.x }, { translateY: position.y }, { scale: scale }]}]}>
      {colors.map(renderShapeLayer)}
    </Animated.View>
  );
};

const ProfileBackground = () => {
  const [blobs, setBlobs] = useState<BlobConfig[]>([]);
  const blobsRef = useRef(blobs);
  blobsRef.current = blobs;

  const createBlob = (size?: number): BlobConfig => {
    // A new, cooler color palette for the profile section
    const allColors = ['#818CF8', '#38BDF8', '#A78BFA', '#7DD3FC'];
    const numColors = Math.random() < 0.7 ? 1 : 2;
    const blobColors = Array.from({ length: numColors }, () => allColors[Math.floor(Math.random() * allColors.length)]);
    return {
      id: Date.now() + Math.random(),
      colors: blobColors,
      size: size || Math.random() * 200 + 400,
      initialTop: `${Math.random() * 100 - 25}%`,
      initialLeft: `${Math.random() * 100 - 25}%`,
      opacity: new Animated.Value(0),
    };
  };

  useEffect(() => {
    setBlobs(Array.from({ length: 4 }, () => createBlob()));
    const interval = setInterval(() => {
      const currentBlobs = blobsRef.current;
      if (!currentBlobs || currentBlobs.length === 0) return;
      const action = Math.random();
      if (action < 0.2 && currentBlobs.length > 2) {
        const blob1 = currentBlobs[0];
        const blob2 = currentBlobs[1];
        Animated.parallel([ Animated.timing(blob1.opacity, { toValue: 0, duration: 2500, useNativeDriver: true }), Animated.timing(blob2.opacity, { toValue: 0, duration: 2500, useNativeDriver: true }) ]).start(() => setBlobs(prev => [...prev.slice(2), createBlob(650)]));
      } else if (action < 0.4 && currentBlobs.length < 6) {
        const blobToSplit = currentBlobs[0];
        if (blobToSplit) Animated.timing(blobToSplit.opacity, { toValue: 0, duration: 2500, useNativeDriver: true }).start(() => setBlobs(prev => [...prev.slice(1), createBlob(blobToSplit.size * 0.6), createBlob(blobToSplit.size * 0.6)]));
      } else {
        const blobToCycle = currentBlobs[0];
        Animated.timing(blobToCycle.opacity, { toValue: 0, duration: 2500, useNativeDriver: true }).start(() => setBlobs(prev => [...prev.slice(1), createBlob()]));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return ( <View style={styles.backgroundContainer}>{blobs.map(blob => (<AnimatedAuroraShape key={blob.id} blob={blob} />))}</View> );
};

const GradientCard: React.FC<{style?: ViewStyle, children: React.ReactNode, colors: string[]}> = ({ style, children, colors }) => {
    if (Platform.OS === 'web') { return ( <View style={[style, { background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`}]}>{children}</View> ); }
    return ( <View style={[style, { backgroundColor: colors[0] }]}>{children}</View> );
};

const ListItem: React.FC<{label: string, icon: string, onPress: () => void}> = ({ label, icon, onPress }) => (
    <Pressable style={styles.listItem} onPress={onPress}>
        <View style={styles.listItemIconContainer}>
            <PaperIcon source={icon} size={20} color="rgba(255,255,255,0.7)" />
        </View>
        <Text style={styles.listItemLabel}>{label}</Text>
        <PaperIcon source="chevron-right" size={22} color="rgba(255,255,255,0.5)" />
    </Pressable>
);

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, loading } = useAuth();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ProfileBackground />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'A'}
            style={styles.avatar}
            color="#fff"
          />
          <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.row}>
            <GradientCard style={styles.statCard} colors={['#2A2834', '#1C1B23']}>
                <PaperIcon source="star-four-points-outline" size={24} color="#A78BFA" />
                <Text style={styles.statValue}>12,450</Text>
                <Text style={styles.statLabel}>Total Points</Text>
            </GradientCard>
            <GradientCard style={styles.statCard} colors={['#1F2F29', '#15201C']}>
                <PaperIcon source="check-circle-outline" size={24} color="#4ADE80" />
                <Text style={styles.statValue}>32</Text>
                <Text style={styles.statLabel}>Surveys Completed</Text>
            </GradientCard>
        </View>

        {/* Settings & More */}
        <Text style={styles.sectionTitle}>Settings & More</Text>
        <GradientCard style={styles.card} colors={['#1C1C1E', '#1C1C1E']}>
            <ListItem label="Edit Profile" icon="account-edit-outline" onPress={() => navigation.navigate('EditProfile')} />
            <Divider style={styles.divider} />
            <ListItem label="Points History" icon="history" onPress={() => navigation.navigate('PointsHistory')} />
            <Divider style={styles.divider} />
            <ListItem label="Settings" icon="cog-outline" onPress={() => {}} />
            <Divider style={styles.divider} />
            <ListItem label="Help & Support" icon="help-circle-outline" onPress={() => {}} />
        </GradientCard>
        
        {/* Logout Button */}
        <Pressable 
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
            onPress={logout}
            disabled={loading}
        >
            <Text style={styles.logoutButtonText}>{loading ? 'Logging out...' : 'Logout'}</Text>
            <PaperIcon source="logout" size={20} color="#FF453A" />
        </Pressable>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backgroundContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#121212', overflow: 'hidden',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 90,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    backgroundColor: 'rgba(120, 120, 128, 0.3)',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listItemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listItemLabel: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
    borderRadius: 16,
    marginTop: 32,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoutButtonPressed: {
    backgroundColor: 'rgba(255, 69, 58, 0.3)',
  },
  logoutButtonText: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: 'bold',
  }
});