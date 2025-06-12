import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Animated,
  Easing,
  ViewStyle,
  Dimensions,
  Linking,
  Alert,
  RefreshControl,
  TextInput, // MODIFIED: Using TextInput for custom search bar
} from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import { api } from '../../services/apiService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<MainTabParamList, 'Surveys'>;
const { width, height } = Dimensions.get('window');

// --- BACKGROUND COMPONENT ---
const AnimatedGradientLayer: React.FC<{ layerConfig: any }> = ({ layerConfig }) => {
  const { color, size, initialTop, initialLeft } = layerConfig;
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    const random = (min, max) => min + Math.random() * (max - min);
    const positionLoop = Animated.loop(Animated.sequence([
      Animated.timing(position, { toValue: { x: random(-width * 0.2, width * 0.2), y: random(-height * 0.2, height * 0.2) }, duration: random(15000, 20000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      Animated.timing(position, { toValue: { x: 0, y: 0 }, duration: random(15000, 20000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
    ]));
    positionLoop.start();
    return () => positionLoop.stop();
  }, [position]);

  const layerStyle: ViewStyle = { position: 'absolute', width: size, height: size, borderRadius: size / 2, top: initialTop, left: initialLeft, backgroundColor: color, opacity: 0.6 };
  return <Animated.View style={[{ transform: position.getTranslateTransform() }]}><View style={layerStyle} /></Animated.View>;
};

const CalmBackground = () => {
  const [layers, setLayers] = useState([]);
  useEffect(() => {
    const gradientLayers = [
      { id: 1, color: '#6366F1', size: width * 1.5, initialTop: '-25%', initialLeft: '-50%' },
      { id: 2, color: '#10B981', size: width * 1.5, initialTop: '0%', initialLeft: '25%' },
      { id: 3, color: '#EC4899', size: width * 1.2, initialTop: '50%', initialLeft: '-25%' },
    ];
    setLayers(gradientLayers);
  }, []);

  return (
    <View style={styles.backgroundContainer}>
      <View style={styles.gradientOverlay} />
      {layers.map(layer => <AnimatedGradientLayer key={layer.id} layerConfig={layer} />)}
    </View>
  );
};

const GradientCard: React.FC<{style?: ViewStyle, children: React.ReactNode, colors: string[]}> = ({ style, children, colors }) => {
    if (Platform.OS === 'web') { return ( <View style={[style, { background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`}]}>{children}</View> ); }
    return ( <View style={[style, { backgroundColor: colors[0] }]}>{children}</View> );
};

// --- MAIN COMPONENT ---
export const SurveysScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [allSurveys, setAllSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchSurveys = async () => {
    try {
      const response = await api.get('/surveys');
      if (response.success && Array.isArray(response.data.surveys)) {
        const processedSurveys = response.data.surveys.map(s => ({ ...s, difficulty: s.difficulty || (s.points_value > 200 ? 'medium' : 'easy'), estimated_time: s.estimated_time || Math.ceil(s.points_value / 10) }));
        setAllSurveys(processedSurveys);
      } else {
        setAllSurveys([]);
      }
    } catch (error) {
      console.error("Failed to fetch surveys:", error);
      setAllSurveys([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSurveys(); }, []);
  
  const onRefresh = React.useCallback(() => { setRefreshing(true); fetchSurveys(); }, []);

  useEffect(() => {
    let surveys = [...allSurveys];
    if (searchQuery) { surveys = surveys.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())); }
    if (activeFilter === 'available') { surveys = surveys.filter(s => !s.is_completed); } 
    else if (activeFilter === 'completed') { surveys = surveys.filter(s => s.is_completed); }
    setFilteredSurveys(surveys);
  }, [searchQuery, activeFilter, allSurveys]);

  const handleStartSurvey = async (survey) => {
    if (survey.is_completed) return;
    const startAction = async () => {
        try {
            const response = await api.post(`/surveys/${survey.id}/start`);
            if (response.success && response.data.survey_url) { Linking.openURL(response.data.survey_url); } 
            else { Alert.alert("Error", "Could not start the survey. Please try again."); }
        } catch (error) { Alert.alert("Error", "An unexpected error occurred."); }
    };
    Alert.alert("Start Survey", `You are about to start "${survey.title}".`, [ { text: "Cancel", style: "cancel" }, { text: "Start", onPress: startAction } ]);
  };

  if (isLoading) {
    return ( <View style={styles.loadingContainer}><ActivityIndicator color={theme.colors.primary} /></View> );
  }

  return (
    <View style={styles.container}>
      <CalmBackground />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff"/>}
      >
        <Text style={styles.screenTitle}>Available Surveys</Text>
        
        <GradientCard style={styles.card} colors={['#2A2834', '#1C1B23']}>
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={22} color="rgba(255,255,255,0.5)" />
                <TextInput
                    placeholder="Search surveys..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <SegmentedButtons
                value={activeFilter}
                onValueChange={setActiveFilter}
                buttons={[ { value: 'all', label: 'All' }, { value: 'available', label: 'Available' }, { value: 'completed', label: 'Done' } ]}
                style={styles.segmentedButtons}
            />
        </GradientCard>

        {filteredSurveys.length > 0 ? (
            filteredSurveys.map((survey) => (
                <GradientCard key={survey.id} style={styles.surveyCard} colors={survey.is_completed ? ['#1F2F29', '#15201C'] : ['#1C1C1E', '#1C1C1E']}>
                    <View style={styles.surveyHeader}>
                        <Text style={styles.surveyTitle}>{survey.title}</Text>
                        <Text style={styles.pointsValue}>+{survey.points_value} pts</Text>
                    </View>
                    <Text style={styles.surveyDescription}>{survey.description}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaChip}><Icon name="clock-time-four-outline" size={14} color="#A78BFA" /><Text style={styles.metaText}>{survey.estimated_time} min</Text></View>
                        <View style={styles.metaChip}><Icon name="speedometer" size={14} color="#FBBF24" /><Text style={styles.metaText}>{survey.difficulty}</Text></View>
                    </View>
                    <Pressable 
                        style={({pressed}) => [styles.actionButton, survey.is_completed && styles.completedButton, pressed && styles.buttonPressed]}
                        onPress={() => handleStartSurvey(survey)}
                        disabled={survey.is_completed}
                    >
                        <Text style={styles.actionButtonText}>{survey.is_completed ? 'Completed' : 'Start Survey'}</Text>
                        { !survey.is_completed && <Icon name="arrow-right" size={20} color="#fff" />}
                    </Pressable>
                </GradientCard>
            ))
        ) : (
            <View style={styles.emptyStateContainer}>
                <Icon name="cloud-search-outline" size={64} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyStateText}>No surveys found.</Text>
                <Text style={styles.emptyStateSubtext}>Try adjusting your search or check back later.</Text>
            </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#121212', overflow: 'hidden' },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18, 18, 18, 0.6)', zIndex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  scrollContent: { padding: 16, paddingTop: 60, paddingBottom: 90, zIndex: 2 },
  screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderTopColor: 'rgba(255,255,255,0.1)' },
  // MODIFIED: Styles for the new custom search input
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingLeft: 12,
    color: '#fff',
    fontSize: 16,
    // For web compatibility
    outlineStyle: 'none',
    borderWidth: 0,
  },
  segmentedButtons: { },
  surveyCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderTopColor: 'rgba(255,255,255,0.1)', gap: 16 },
  surveyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  surveyTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#fff' },
  pointsValue: { fontSize: 16, fontWeight: 'bold', color: '#A78BFA' },
  surveyDescription: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  metaText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },
  actionButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#6366F1', borderRadius: 12, padding: 14, gap: 8 },
  buttonPressed: { backgroundColor: '#4F46E5' },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  completedButton: { backgroundColor: 'rgba(74, 222, 128, 0.2)' },
  emptyStateContainer: { alignItems: 'center', paddingVertical: 48, gap: 16 },
  emptyStateText: { fontSize: 18, fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' },
  emptyStateSubtext: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: 250 }
});