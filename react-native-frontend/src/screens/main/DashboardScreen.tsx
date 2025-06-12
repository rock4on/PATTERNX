import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
  ViewStyle,
  Easing,
  Pressable,
  UIManager,
} from 'react-native';
import {
  Text,
  Avatar,
  useTheme,
  ActivityIndicator,
  ProgressBar,
  Icon as PaperIcon,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/apiService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<MainTabParamList, 'Dashboard'>;

const { width, height } = Dimensions.get('window');

type BlobConfig = {
  id: number;
  colors: string[];
  size: number;
  initialTop: string;
  initialLeft: string;
  opacity: Animated.Value;
};

interface Survey {
  id: number;
  title: string;
  points_value: number;
  estimated_time?: number;
  is_available: boolean;
  is_completed: boolean;
}

interface DashboardData {
  user: { first_name: string; total_points: number; available_points: number; };
  stats: { available_surveys: number; completed_surveys: number; total_rewards: number; };
}

const AnimatedAuroraShape: React.FC<{ blob: BlobConfig }> = ({ blob }) => {
  const { opacity, size, colors, initialTop, initialLeft } = blob;
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }).start();
  }, [opacity]);

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
    <Animated.View style={[
        {
          position: 'absolute',
          top: initialTop,
          left: initialLeft,
          width: size,
          height: size,
          opacity: opacity,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [ { translateX: position.x }, { translateY: position.y }, { scale: scale } ],
        },
      ]}>
      {colors.map(renderShapeLayer)}
    </Animated.View>
  );
};

// MODIFIED: Re-engineered the blob lifecycle logic to be stable and robust.
const DashboardBackground = () => {
  const theme = useTheme();
  const [blobs, setBlobs] = useState<BlobConfig[]>([]);
  const blobsRef = useRef(blobs);
  blobsRef.current = blobs;
  const isCyclingRef = useRef(false);

  const createBlob = (): BlobConfig => {
    const allColors = [theme.colors.primary, theme.colors.secondary, theme.colors.tertiary, theme.colors.info, '#F59E0B'];
    const numColors = Math.random() < 0.7 ? 1 : 2;
    const blobColors = Array.from({ length: numColors }, () => allColors[Math.floor(Math.random() * allColors.length)]);
    return {
      id: Date.now() + Math.random(),
      colors: blobColors,
      size: Math.random() * 200 + 400,
      initialTop: `${Math.random() * 100 - 25}%`,
      initialLeft: `${Math.random() * 100 - 25}%`,
      opacity: new Animated.Value(0),
    };
  };

  useEffect(() => {
    const initialBlobs = Array.from({ length: 4 }, () => createBlob());
    setBlobs(initialBlobs);

    const interval = setInterval(() => {
      if (isCyclingRef.current) return;

      const currentBlobs = blobsRef.current;
      if (currentBlobs.length > 0) {
        isCyclingRef.current = true;
        const blobToCycle = currentBlobs[0];

        Animated.timing(blobToCycle.opacity, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }).start(() => {
          setBlobs(prev => {
            const newBlobs = prev.filter(b => b.id !== blobToCycle.id);
            newBlobs.push(createBlob());
            return newBlobs;
          });
          isCyclingRef.current = false;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.backgroundContainer}>
      {blobs.map(blob => (
        <AnimatedAuroraShape key={blob.id} blob={blob} />
      ))}
    </View>
  );
};

const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, { toValue: value, duration: 1000, useNativeDriver: false, easing: Easing.out(Easing.ease) }).start();
    const listener = animatedValue.addListener(({ value }) => setDisplayValue(Math.round(value)));
    return () => animatedValue.removeListener(listener);
  }, [value, animatedValue]);

  return <Text style={styles.pointsValue}>{displayValue.toLocaleString()}</Text>;
};

const SurveyPreviewCard: React.FC<{ survey: Survey; onPress: () => void }> = ({ survey, onPress }) => {
    const theme = useTheme();
    return (
        <Pressable onPress={onPress} style={styles.surveyPreviewPressable}>
            <View style={styles.surveyPreviewCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.2)'}]}>
                    <PaperIcon source="clipboard-text-outline" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.surveyPreviewTextContainer}>
                    <Text style={styles.surveyPreviewTitle} numberOfLines={1}>{survey.title}</Text>
                    <Text style={styles.surveyPreviewInfo}>
                        +{survey.points_value} Points  ·  {survey.estimated_time || '?'} min
                    </Text>
                </View>
                <PaperIcon source="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
            </View>
        </Pressable>
    );
};


export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [surveyPreviews, setSurveyPreviews] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  const fetchAllDashboardData = async () => {
    try {
      const [dashboardResponse, surveysResponse] = await Promise.all([
        api.get('/dashboard'),
        api.get('/surveys')
      ]);

      if (dashboardResponse.success && dashboardResponse.data) {
        setDashboardData(dashboardResponse.data);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
      
      if (surveysResponse.success && surveysResponse.data?.surveys) {
        const availableSurveys = surveysResponse.data.surveys.filter(
          (s: Survey) => s.is_available && !s.is_completed
        );
        setSurveyPreviews(availableSurveys.slice(0, 3));
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardData({
        user: { first_name: user?.first_name || 'Admin', total_points: 32320, available_points: 32320 },
        stats: { available_surveys: 6, completed_surveys: 0, total_rewards: 1 },
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllDashboardData();
  };

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
    }
  }, [isLoading]);

  const getGreeting = () => "Good Morning,";

  if (isLoading || !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DashboardBackground />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <Animated.View style={{opacity: fadeAnim, transform: [{translateY: slideAnim}]}}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerGreeting}>{getGreeting()}</Text>
                    <Text style={styles.headerName}>{dashboardData.user.first_name} ✨</Text>
                </View>
                <Pressable style={styles.notificationButton}>
                    <PaperIcon source="bell-outline" size={24} color="#fff" />
                </Pressable>
            </View>

            <View style={styles.gridContainer}>
                <View style={[styles.gridItem, styles.pointsCard]}>
                    <PaperIcon source="wallet-giftcard" size={32} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.pointsLabel}>Available Points</Text>
                    <AnimatedCounter value={dashboardData.user.available_points} />
                    <View style={styles.progressWrapper}>
                        <Text style={styles.progressLabel}>of {dashboardData.user.total_points.toLocaleString()} total</Text>
                        <ProgressBar progress={dashboardData.user.available_points / dashboardData.user.total_points} color="#fff" style={styles.progressBar} />
                    </View>
                </View>

                <View style={[styles.gridItem, styles.statCard]}>
                    <View style={styles.statHeader}>
                        <View style={[styles.statIconContainer, {backgroundColor: 'rgba(48, 209, 88, 0.2)'}]}>
                            <PaperIcon source="text-box-check-outline" size={20} color="#30D158" />
                        </View>
                        <Text style={styles.statValue}>{dashboardData.stats.available_surveys}</Text>
                    </View>
                    <Text style={styles.statLabel}>Available</Text>
                </View>

                <View style={[styles.gridItem, styles.statCard]}>
                    <View style={styles.statHeader}>
                        <View style={[styles.statIconContainer, {backgroundColor: 'rgba(99, 102, 241, 0.2)'}]}>
                            <PaperIcon source="check-circle-outline" size={20} color="#6366F1" />
                        </View>
                        <Text style={styles.statValue}>{dashboardData.stats.completed_surveys}</Text>
                    </View>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
                
                <View style={[styles.gridItem, styles.statCard]}>
                    <View style={styles.statHeader}>
                        <View style={[styles.statIconContainer, {backgroundColor: 'rgba(245, 158, 11, 0.2)'}]}>
                            <PaperIcon source="trophy-outline" size={20} color="#F59E0B" />
                        </View>
                        <Text style={styles.statValue}>{dashboardData.stats.total_rewards}</Text>
                    </View>
                    <Text style={styles.statLabel}>Rewards</Text>
                </View>

                <Pressable style={[styles.gridItem, styles.actionCard]} onPress={() => navigation.navigate('Surveys')}>
                    <Text style={styles.actionLabel}>Browse Surveys</Text>
                    <PaperIcon source="arrow-right" size={20} color="#fff" />
                </Pressable>

                <Pressable style={[styles.gridItem, styles.actionCard]} onPress={() => navigation.navigate('Rewards')}>
                    <Text style={styles.actionLabel}>View Rewards</Text>
                    <PaperIcon source="arrow-right" size={20} color="#fff" />
                </Pressable>
            </View>

            {surveyPreviews.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Jump Back In</Text>
                    <View style={styles.surveyPreviewList}>
                        {surveyPreviews.map((survey) => (
                            <SurveyPreviewCard 
                                key={survey.id} 
                                survey={survey} 
                                onPress={() => navigation.navigate('Surveys')} 
                            />
                        ))}
                    </View>
                </>
            )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0A0A0A', overflow: 'hidden' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
  scrollContent: { padding: 16, paddingTop: 70, paddingBottom: 90 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerGreeting: { fontSize: 22, color: 'rgba(255,255,255,0.7)' },
  headerName: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  notificationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', margin: -6 },
  gridItem: {
    margin: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(40px)', '-webkit-backdrop-filter': 'blur(40px)' }),
  },
  pointsCard: { width: '100%', gap: 8 },
  pointsLabel: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  pointsValue: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  progressWrapper: { marginTop: 16 },
  progressLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)' },
  statCard: { flexGrow: 1, width: '25%', gap: 12 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statIconContainer: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  actionCard: { flex: 1, minWidth: '40%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', margin: 6, marginTop: 24, marginBottom: 12 },
  surveyPreviewList: { gap: 12 },
  surveyPreviewPressable: { borderRadius: 20 },
  surveyPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(40px)', '-webkit-backdrop-filter': 'blur(40px)' }),
  },
  surveyPreviewTextContainer: { flex: 1 },
  surveyPreviewTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  surveyPreviewInfo: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
});