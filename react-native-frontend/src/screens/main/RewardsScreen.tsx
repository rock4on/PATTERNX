import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  useTheme,
  ActivityIndicator,
  Snackbar,
  SegmentedButtons,
  Divider,
  Surface,
  IconButton,
  Avatar,
  ProgressBar,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/apiService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainTabParamList, 'Rewards'>;

const { width } = Dimensions.get('window');

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  category: string;
  image_url?: string;
  available: boolean;
  redeemed: boolean;
  icon: string;
  color: string;
}

// Platform-specific gradient implementation
const GradientBackground: React.FC<{ colors: string[]; style: any }> = ({ colors, style }) => {
  if (Platform.OS === 'web') {
    return (
      <div 
        style={{
          ...style,
          background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
        }}
      />
    );
  }
  return <View style={[style, { backgroundColor: colors[0] }]} />;
};

export const RewardsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [myRewards, setMyRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('available');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [userPoints, setUserPoints] = useState(0);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  const fetchRewards = async () => {
    try {
      const [rewardsResponse, userResponse] = await Promise.all([
        api.get('/rewards'),
        api.get('/user/points')
      ]);
      
      if (rewardsResponse.success && userResponse.success) {
        setRewards(rewardsResponse.data?.rewards || []);
        setMyRewards(rewardsResponse.data?.my_rewards || []);
        setUserPoints(userResponse.data?.available_points || 0);
      } else {
        throw new Error('Failed to fetch rewards data');
      }
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      // Mock data for development
      const mockRewards = [
        {
          id: 1,
          name: '$10 Amazon Gift Card',
          description: 'Redeem for Amazon purchases',
          points_required: 500,
          category: 'gift_cards',
          available: true,
          redeemed: false,
          icon: 'gift',
          color: theme.colors.primary,
        },
        {
          id: 2,
          name: '$25 Starbucks Gift Card',
          description: 'Perfect for your coffee fix',
          points_required: 1000,
          category: 'gift_cards',
          available: true,
          redeemed: false,
          icon: 'coffee',
          color: '#00A862',
        },
        {
          id: 3,
          name: 'Premium Survey Access',
          description: 'Access to high-paying premium surveys',
          points_required: 750,
          category: 'premium',
          available: true,
          redeemed: false,
          icon: 'crown',
          color: '#FFD700',
        },
        {
          id: 4,
          name: '$5 PayPal Cash',
          description: 'Direct cash transfer to PayPal',
          points_required: 250,
          category: 'cash',
          available: true,
          redeemed: false,
          icon: 'cash',
          color: '#009CDE',
        },
        {
          id: 5,
          name: 'Netflix 1 Month',
          description: '1 month Netflix subscription',
          points_required: 800,
          category: 'subscriptions',
          available: true,
          redeemed: false,
          icon: 'play',
          color: '#E50914',
        },
        {
          id: 6,
          name: 'Charity Donation $20',
          description: 'Donate to your favorite charity',
          points_required: 400,
          category: 'charity',
          available: true,
          redeemed: false,
          icon: 'heart',
          color: theme.colors.tertiary,
        }
      ];
      
      const mockMyRewards = [
        {
          id: 101,
          name: '$5 Amazon Gift Card',
          description: 'Redeemed on Jan 15, 2024',
          points_required: 250,
          category: 'gift_cards',
          available: false,
          redeemed: true,
          icon: 'gift',
          color: theme.colors.primary,
        }
      ];
      
      setRewards(mockRewards);
      setMyRewards(mockMyRewards);
      setUserPoints(850);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRewards();
  };

  useEffect(() => {
    fetchRewards();
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

  const handleRedeem = async (reward: Reward) => {
    if (userPoints < reward.points_required) {
      setSnackbar({
        visible: true,
        message: `You need ${reward.points_required - userPoints} more points to redeem this reward`
      });
      return;
    }

    Alert.alert(
      'Confirm Redemption',
      `Are you sure you want to redeem "${reward.name}" for ${reward.points_required} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            try {
              await api.post(`/rewards/${reward.id}/redeem`);
              setSnackbar({
                visible: true,
                message: `Successfully redeemed ${reward.name}!`
              });
              setUserPoints(prev => prev - reward.points_required);
              fetchRewards(); // Refresh the list
            } catch (error) {
              setSnackbar({
                visible: true,
                message: 'Failed to redeem reward. Please try again.'
              });
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      gift_cards: 'gift',
      cash: 'cash',
      premium: 'crown',
      subscriptions: 'play',
      charity: 'heart',
      merchandise: 'tshirt-crew',
    };
    return icons[category] || 'gift';
  };

  const getProgressToNextReward = () => {
    const affordableRewards = rewards.filter(r => r.points_required <= userPoints);
    const nextReward = rewards
      .filter(r => r.points_required > userPoints)
      .sort((a, b) => a.points_required - b.points_required)[0];
    
    if (!nextReward) return null;
    
    const progress = userPoints / nextReward.points_required;
    const needed = nextReward.points_required - userPoints;
    
    return { reward: nextReward, progress, needed };
  };

  const renderRewardCard = (reward: Reward, isRedeemed = false) => (
    <Surface
      key={reward.id}
      style={[
        styles.rewardCard,
        {
          backgroundColor: theme.colors.surface,
          opacity: !reward.available || (userPoints < reward.points_required && !isRedeemed) ? 0.6 : 1,
        }
      ]}
      elevation={2}
    >
      <View style={styles.rewardHeader}>
        <Avatar.Icon
          size={48}
          icon={reward.icon}
          style={{ backgroundColor: reward.color }}
        />
        <View style={styles.rewardInfo}>
          <Text variant="titleMedium" style={[styles.rewardName, { color: theme.colors.onSurface }]}>
            {reward.name}
          </Text>
          <Text variant="bodyMedium" style={[styles.rewardDescription, { color: theme.colors.onSurfaceVariant }]}>
            {reward.description}
          </Text>
        </View>
        <View style={styles.rewardPoints}>
          <Chip
            mode="outlined"
            style={[
              styles.pointsChip,
              { backgroundColor: theme.colors.primaryContainer }
            ]}
            textStyle={{ color: theme.colors.primary, fontWeight: '600' }}
          >
            {reward.points_required}
          </Chip>
        </View>
      </View>
      
      {!isRedeemed && (
        <View style={styles.rewardActions}>
          <Button
            mode={userPoints >= reward.points_required ? 'contained' : 'outlined'}
            onPress={() => handleRedeem(reward)}
            disabled={!reward.available || userPoints < reward.points_required}
            style={styles.redeemButton}
            contentStyle={styles.buttonContent}
          >
            {userPoints >= reward.points_required ? 'Redeem Now' : `Need ${reward.points_required - userPoints} more`}
          </Button>
        </View>
      )}
      
      {isRedeemed && (
        <View style={styles.redeemedBadge}>
          <Chip
            icon="check"
            style={{ backgroundColor: theme.colors.tertiaryContainer }}
            textStyle={{ color: theme.colors.tertiary }}
          >
            Redeemed
          </Chip>
        </View>
      )}
    </Surface>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
          Loading rewards...
        </Text>
      </View>
    );
  }

  const nextRewardProgress = getProgressToNextReward();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Points Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Surface style={[styles.pointsCard, { backgroundColor: theme.colors.primary }]} elevation={3}>
            <GradientBackground
              colors={[theme.colors.primary, theme.colors.primaryVariant || theme.colors.primary]}
              style={styles.gradientOverlay}
            />
            <View style={styles.pointsContent}>
              <View style={styles.pointsLeft}>
                <Text variant="titleMedium" style={[styles.pointsLabel, { color: theme.colors.onPrimary }]}>
                  Your Points
                </Text>
                <Text variant="displaySmall" style={[styles.pointsValue, { color: theme.colors.onPrimary }]}>
                  {userPoints.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={[styles.pointsHint, { color: theme.colors.onPrimary + '80' }]}>
                  Complete surveys to earn more
                </Text>
              </View>
              <IconButton
                icon="star"
                size={32}
                style={{ backgroundColor: theme.colors.onPrimary + '20' }}
                iconColor={theme.colors.onPrimary}
              />
            </View>
          </Surface>
        </Animated.View>

        {/* Progress to Next Reward */}
        {nextRewardProgress && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Surface style={[styles.progressCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={styles.progressHeader}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  Next Reward Progress
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {nextRewardProgress.needed} points to go
                </Text>
              </View>
              <View style={styles.progressContent}>
                <Text variant="bodyLarge" style={[styles.nextRewardName, { color: theme.colors.onSurface }]}>
                  {nextRewardProgress.reward.name}
                </Text>
                <ProgressBar
                  progress={nextRewardProgress.progress}
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {userPoints} / {nextRewardProgress.reward.points_required} points
                </Text>
              </View>
            </Surface>
          </Animated.View>
        )}

        {/* Tab Selection */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
              {
                value: 'available',
                label: 'Available',
                icon: 'gift',
              },
              {
                value: 'my-rewards',
                label: 'My Rewards',
                icon: 'trophy',
              },
            ]}
            style={styles.segmentedButtons}
          />
        </Animated.View>

        {/* Rewards List */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {activeTab === 'available' ? (
            <View style={styles.rewardsList}>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                Available Rewards
              </Text>
              <Text variant="bodyMedium" style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Redeem your points for amazing rewards
              </Text>
              {rewards.map(reward => renderRewardCard(reward))}
            </View>
          ) : (
            <View style={styles.rewardsList}>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                My Rewards
              </Text>
              <Text variant="bodyMedium" style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Your redeemed rewards and history
              </Text>
              {myRewards.length > 0 ? (
                myRewards.map(reward => renderRewardCard(reward, true))
              ) : (
                <Surface style={[styles.emptyState, { backgroundColor: theme.colors.surface }]} elevation={1}>
                  <IconButton
                    icon="trophy"
                    size={48}
                    style={{ backgroundColor: theme.colors.primaryContainer }}
                    iconColor={theme.colors.primary}
                  />
                  <Text variant="titleMedium" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                    No rewards yet
                  </Text>
                  <Text variant="bodyMedium" style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Complete surveys to earn points and redeem your first reward!
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Surveys')}
                    style={styles.emptyCta}
                  >
                    Browse Surveys
                  </Button>
                </Surface>
              )}
            </View>
          )}
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbar({ visible: false, message: '' }),
        }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  pointsCard: {
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pointsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  pointsLeft: {
    flex: 1,
  },
  pointsLabel: {
    opacity: 0.9,
    marginBottom: 8,
  },
  pointsValue: {
    fontWeight: '700',
    marginBottom: 4,
  },
  pointsHint: {
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressContent: {
    gap: 8,
  },
  nextRewardName: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  segmentedButtons: {
    marginHorizontal: 0,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  sectionSubtitle: {
    marginBottom: 20,
    opacity: 0.8,
  },
  rewardsList: {
    gap: 16,
  },
  rewardCard: {
    borderRadius: 16,
    padding: 20,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rewardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  rewardName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardDescription: {
    opacity: 0.8,
  },
  rewardPoints: {
    marginLeft: 16,
  },
  pointsChip: {
    borderRadius: 8,
  },
  rewardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  redeemButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  redeemedBadge: {
    alignItems: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyCta: {
    borderRadius: 12,
  },
  bottomSpacer: {
    height: 24,
  },
});