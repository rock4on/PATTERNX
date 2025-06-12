import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ViewStyle,
  Easing,
  Pressable,
  Image,
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/apiService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainTabParamList, 'Rewards'>;

const { width, height } = Dimensions.get('window');

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  category?: string;
  image_url?: string;
  available: boolean;
  redeemed: boolean;
  icon: string;
  color: string;
  status?: string;
  created_at?: string;
}

type BlobConfig = {
  id: number;
  colors: string[];
  size: number;
  initialTop: string;
  initialLeft: string;
  opacity: Animated.Value;
};

const AnimatedAuroraShape: React.FC<{ blob: BlobConfig }> = ({ blob }) => {
  const { opacity, size, colors, initialTop, initialLeft } = blob;
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }).start();
  }, [opacity]);

  useEffect(() => {
    const random = (min: number, max: number) => min + Math.random() * (max - min);
    const positionLoop = Animated.loop(Animated.sequence([
      Animated.timing(position, { toValue: { x: random(-70, 70), y: random(-90, 90) }, duration: random(5000, 8000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      Animated.timing(position, { toValue: { x: 0, y: 0 }, duration: random(5000, 8000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
    ]));
    const scaleLoop = Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 1.25, duration: random(4000, 7000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      Animated.timing(scale, { toValue: 1, duration: random(4000, 7000), useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
    ]));
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
    <Animated.View style={[{
      position: 'absolute',
      top: initialTop,
      left: initialLeft,
      width: size,
      height: size,
      opacity: opacity,
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ translateX: position.x }, { translateY: position.y }, { scale: scale }],
    }]}>
      {colors.map(renderShapeLayer)}
    </Animated.View>
  );
};

const RewardsBackground = () => {
  const theme = useTheme();
  const [blobs, setBlobs] = useState<BlobConfig[]>([]);
  const blobsRef = useRef(blobs);
  blobsRef.current = blobs;
  const isCyclingRef = useRef(false);

  const createBlob = (): BlobConfig => {
    const allColors = ['#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#10B981'];
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
      console.log('Fetching rewards data from API...');
      
      const [rewardsResponse, userResponse, dashboardResponse, userRewardsResponse] = await Promise.all([
        api.get('/rewards'),
        api.get('/user/points'),
        api.get('/dashboard'),
        api.get('/user/rewards')
      ]);
      
      console.log('API Responses:', {
        rewards: rewardsResponse,
        userPoints: userResponse,
        dashboard: dashboardResponse,
        userRewards: userRewardsResponse
      });
      
      if (rewardsResponse.success) {
        console.log('Using real API rewards data:', rewardsResponse.data);
        
        // Process rewards from API with proper fallbacks
        const apiRewards = rewardsResponse.data?.rewards || [];
        const processedRewards = apiRewards.map((reward: any) => {
          const processed = {
            ...reward,
            category: reward.category || 'general',
            icon: reward.icon || 'gift',
            color: reward.color || '#6366F1',
            // Map API field to component field
            points_required: reward.points_cost || 0,
            image_url: reward.image_url || reward.image || null,
            available: reward.is_available !== undefined ? reward.is_available : (reward.available !== undefined ? reward.available : true),
            redeemed: reward.redeemed !== undefined ? reward.redeemed : false,
          };
          console.log('API Reward processed:', { 
            name: reward.name, 
            original_cost: reward.points_cost, 
            final_cost: processed.points_required,
            available: processed.available
          });
          return processed;
        });
        
        // Process user rewards from separate endpoint
        let processedMyRewards: Reward[] = [];
        console.log('User rewards API response:', userRewardsResponse);
        
        if (userRewardsResponse.success && userRewardsResponse.data?.redemptions) {
          const apiMyRewards = userRewardsResponse.data.redemptions;
          console.log('Raw user redemptions from API:', apiMyRewards);
          console.log('Number of redemptions found:', apiMyRewards.length);
          
          processedMyRewards = apiMyRewards.map((redemption: any) => {
            const rewardName = redemption.reward?.name || 'Unknown Reward';
            const redemptionDate = new Date(redemption.created_at).toLocaleDateString();
            const isPending = redemption.status === 'pending';
            
            return {
              id: redemption.id,
              name: rewardName,
              description: isPending ? `Pending fulfillment (redeemed ${redemptionDate})` : `Fulfilled on ${redemptionDate}`,
              points_required: redemption.points_spent || 0,
              category: 'redeemed',
              icon: isPending ? 'clock' : 'check-circle',
              color: isPending ? '#F59E0B' : '#4ADE80',
              image_url: redemption.reward?.image_url || null,
              available: false,
              redeemed: true,
              created_at: redemption.created_at,
              status: redemption.status
            };
          });
        } else {
          console.log('No user redemptions found or API call failed:');
          console.log('- API success:', userRewardsResponse.success);
          console.log('- API data:', userRewardsResponse.data);
          console.log('- API error:', userRewardsResponse.error);
          console.log('- Full response:', userRewardsResponse);
        }
        
        console.log('Final API rewards:', processedRewards);
        console.log('Final API my rewards:', processedMyRewards);
        
        
        setRewards(processedRewards);
        setMyRewards(processedMyRewards);
      } else {
        console.log('Rewards API call failed, throwing error');
        throw new Error('API call failed');
      }
      
      // Try multiple sources for user points
      let points = 0;
      if (userResponse.success && userResponse.data?.available_points) {
        points = userResponse.data.available_points;
      } else if (dashboardResponse.success && dashboardResponse.data?.user?.available_points) {
        points = dashboardResponse.data.user.available_points;
      } else if (user?.available_points) {
        points = user.available_points;
      }
      
      setUserPoints(points);
      
      if (!rewardsResponse.success) {
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
          color: '#FF9900',
          image_url: 'https://m.media-amazon.com/images/G/01/gc/designs/livepreview/amazon_dkblue_noto_email_v2016_us-main._CB468775337_.png',
        },
        {
          id: 2,
          name: '$25 Starbucks Gift Card',
          description: 'Perfect for your coffee fix',
          points_required: 1000,
          category: 'gift_cards',
          available: true,
          redeemed: false,
          icon: 'local-cafe',
          color: '#00704A',
          image_url: 'https://globalassets.starbucks.com/digitalassets/cards/starbucks-card-green-logo.png',
        },
        {
          id: 3,
          name: 'Premium Survey Access',
          description: 'Access to high-paying premium surveys',
          points_required: 750,
          category: 'premium',
          available: true,
          redeemed: false,
          icon: 'workspace-premium',
          color: '#FFD700',
          image_url: 'https://cdn-icons-png.flaticon.com/512/2583/2583788.png',
        },
        {
          id: 4,
          name: '$5 PayPal Cash',
          description: 'Direct cash transfer to PayPal',
          points_required: 250,
          category: 'cash',
          available: true,
          redeemed: false,
          icon: 'payments',
          color: '#009CDE',
          image_url: 'https://logos-world.net/wp-content/uploads/2020/07/PayPal-Logo.png',
        },
        {
          id: 5,
          name: 'Netflix 1 Month',
          description: '1 month Netflix subscription',
          points_required: 800,
          category: 'subscriptions',
          available: true,
          redeemed: false,
          icon: 'play-arrow',
          color: '#E50914',
          image_url: 'https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.png',
        },
        {
          id: 6,
          name: 'Charity Donation $20',
          description: 'Donate to your favorite charity',
          points_required: 400,
          category: 'charity',
          available: true,
          redeemed: false,
          icon: 'favorite',
          color: '#E91E63',
          image_url: 'https://cdn-icons-png.flaticon.com/512/3176/3176366.png',
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
          color: '#FF9900',
          image_url: 'https://m.media-amazon.com/images/G/01/gc/designs/livepreview/amazon_dkblue_noto_email_v2016_us-main._CB468775337_.png',
        }
      ];
      
      console.log('Using mock rewards data:', mockRewards);
      setRewards(mockRewards);
      setMyRewards(mockMyRewards);
      
      // Try to get user points from auth context or use mock data
      let fallbackPoints = 850;
      if (user?.available_points !== undefined) {
        fallbackPoints = user.available_points;
      } else if (user?.total_points !== undefined) {
        fallbackPoints = user.total_points;
      }
      console.log('Setting user points to:', fallbackPoints);
      setUserPoints(fallbackPoints);
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

  // Sync points from auth context
  useEffect(() => {
    if (user?.available_points !== undefined && userPoints === 0) {
      setUserPoints(user.available_points);
    }
  }, [user?.available_points]);

  // Debug effect to log current state
  useEffect(() => {
    console.log('Current rewards state:', {
      rewards: rewards.map(r => ({ name: r.name, points: r.points_required, available: r.available })),
      myRewards: myRewards.map(r => ({ name: r.name, points: r.points_required, status: r.status })),
      userPoints,
      rewardsCount: rewards.length,
      myRewardsCount: myRewards.length,
      activeTab
    });
  }, [rewards, myRewards, userPoints, activeTab]);

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
    const requiredPoints = reward.points_required || 0;
    const currentPoints = Number(userPoints) || 0;
    
    console.log('Redemption attempt:', {
      rewardName: reward.name,
      rewardId: reward.id,
      requiredPoints,
      currentPoints,
      hasEnoughPoints: currentPoints >= requiredPoints,
      rewardAvailable: reward.available
    });
    
    if (requiredPoints === 0) {
      setSnackbar({
        visible: true,
        message: 'This reward has invalid pricing. Please contact support.'
      });
      return;
    }
    
    if (currentPoints < requiredPoints) {
      setSnackbar({
        visible: true,
        message: `You need ${(requiredPoints - currentPoints).toLocaleString()} more points to redeem this reward`
      });
      return;
    }
    
    if (!reward.available) {
      setSnackbar({
        visible: true,
        message: 'This reward is no longer available.'
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
              console.log(`Attempting to redeem reward ${reward.id} for ${requiredPoints} points`);
              
              // Show loading state
              setSnackbar({
                visible: true,
                message: 'Processing redemption...'
              });
              
              // Call the real API
              const response = await api.post(`/rewards/${reward.id}/redeem`);
              
              console.log('Redemption API response:', response);
              console.log('Response success:', response.success);
              console.log('Response data:', response.data);
              console.log('Response error:', response.error);
              
              if (response.success) {
                console.log('Redemption successful, refreshing data');
                
                // Show success message
                setSnackbar({
                  visible: true,
                  message: `Successfully redeemed ${reward.name}!`
                });
                
                // Refresh all data from API to get the updated state
                console.log('Refreshing rewards data after successful redemption');
                await fetchRewards();
              } else {
                console.log('Redemption API returned error:', response.message);
                // API returned an error
                setSnackbar({
                  visible: true,
                  message: response.message || response.error || 'Failed to redeem reward. Please try again.'
                });
              }
            } catch (error) {
              console.error('Redemption API network error:', error);
              setSnackbar({
                visible: true,
                message: 'Network error. Please check your connection and try again.'
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
    <View
      key={reward.id}
      style={[
        styles.rewardCard,
        {
          opacity: !reward.available || (userPoints < reward.points_required && !isRedeemed) ? 0.6 : 1,
        }
      ]}
    >
      {/* Reward Image */}
      {reward.image_url && (
        <View style={styles.rewardImageContainer}>
          <Image
            source={{ uri: reward.image_url }}
            style={styles.rewardImage}
            resizeMode="contain"
            onError={() => console.log('Failed to load image:', reward.image_url)}
          />
        </View>
      )}
      
      <View style={styles.rewardHeader}>
        <View style={[styles.rewardIconContainer, { backgroundColor: `${reward.color}20` }]}>
          <Icon name={reward.icon} size={28} color={reward.color} />
        </View>
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardName}>
            {reward.name}
          </Text>
          <Text style={styles.rewardDescription}>
            {reward.description}
          </Text>
          <View style={styles.rewardMeta}>
            <View style={styles.pointsChip}>
              <Icon name="star" size={14} color="#6366F1" />
              <Text style={styles.pointsText}>
                {reward.points_required ? reward.points_required.toLocaleString() : '0'} pts
              </Text>
            </View>
            {reward.category && (
              <View style={[styles.categoryChip, { backgroundColor: `${reward.color}15` }]}>
                <Text style={[styles.categoryText, { color: reward.color }]}>{reward.category.replace('_', ' ')}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {!isRedeemed && (
        <View style={styles.rewardActions}>
          <Pressable
            style={({ pressed }) => [
              styles.redeemButton,
              (Number(userPoints) || 0) >= (reward.points_required || 0) ? styles.redeemButtonEnabled : styles.redeemButtonDisabled,
              pressed && styles.redeemButtonPressed
            ]}
            onPress={() => {
              console.log('Redeem button clicked for reward:', reward.name);
              handleRedeem(reward);
            }}
            disabled={!reward.available || (Number(userPoints) || 0) < (reward.points_required || 0)}
          >
            <Icon 
              name={(Number(userPoints) || 0) >= (reward.points_required || 0) ? "gift" : "lock"} 
              size={16} 
              color={(Number(userPoints) || 0) >= (reward.points_required || 0) ? "#fff" : "rgba(255,255,255,0.5)"} 
            />
            <Text style={[
              styles.redeemButtonText,
              (Number(userPoints) || 0) >= (reward.points_required || 0) ? styles.redeemButtonTextEnabled : styles.redeemButtonTextDisabled
            ]}>
              {(Number(userPoints) || 0) >= (reward.points_required || 0) ? 'Redeem Now' : `Need ${((reward.points_required || 0) - (Number(userPoints) || 0)).toLocaleString()} more`}
            </Text>
          </Pressable>
        </View>
      )}
      
      {isRedeemed && (
        <View style={styles.rewardActions}>
          <View style={[styles.redeemedChip, reward.status === 'pending' && styles.pendingChip]}>
            <Icon 
              name={reward.status === 'pending' ? "clock" : "check"} 
              size={16} 
              color={reward.status === 'pending' ? "#F59E0B" : "#4ADE80"} 
            />
            <Text style={[styles.redeemedText, reward.status === 'pending' && styles.pendingText]}>
              {reward.status === 'pending' ? 'Pending' : 'Fulfilled'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>
          Loading rewards...
        </Text>
      </View>
    );
  }

  const nextRewardProgress = getProgressToNextReward();

  return (
    <View style={styles.container}>
      <RewardsBackground />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Points Header */}
        <View style={styles.header}>
          <View style={styles.pointsCard}>
            <View style={styles.pointsContent}>
              <View style={styles.pointsLeft}>
                <Text style={styles.pointsLabel}>
                  Your Points
                </Text>
                <Text style={styles.pointsValue}>
                  {(userPoints || 0).toLocaleString()}
                </Text>
                <Text style={styles.pointsHint}>
                  Complete surveys to earn more
                </Text>
              </View>
              <View style={styles.pointsIconContainer}>
                <Icon name="wallet-giftcard" size={32} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
          </View>
        </View>

        {/* Progress to Next Reward */}
        {nextRewardProgress && (
          <View style={styles.section}>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>
                  Next Reward Progress
                </Text>
                <Text style={styles.progressSubtitle}>
                  {nextRewardProgress.needed} points to go
                </Text>
              </View>
              <View style={styles.progressContent}>
                <Text style={styles.nextRewardName}>
                  {nextRewardProgress.reward.name}
                </Text>
                <ProgressBar
                  progress={nextRewardProgress.progress}
                  color="#6366F1"
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {(userPoints || 0).toLocaleString()} / {(nextRewardProgress.reward.points_required || 0).toLocaleString()} points
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab Selection */}
        <View style={styles.section}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={(value) => {
              console.log('Tab changed to:', value);
              setActiveTab(value);
            }}
            buttons={[
              {
                value: 'available',
                label: 'Available',
                icon: ({ size, color }) => <Icon name="gift" size={size} color={color} />,
                labelStyle: { color: activeTab === 'available' ? '#fff' : 'rgba(255,255,255,0.7)', fontWeight: '600' },
                style: { 
                  backgroundColor: activeTab === 'available' ? '#F59E0B' : 'transparent',
                  borderColor: 'transparent',
                },
              },
              {
                value: 'my-rewards',
                label: 'My Rewards',
                icon: ({ size, color }) => <Icon name="trophy" size={size} color={color} />,
                labelStyle: { color: activeTab === 'my-rewards' ? '#fff' : 'rgba(255,255,255,0.7)', fontWeight: '600' },
                style: { 
                  backgroundColor: activeTab === 'my-rewards' ? '#F59E0B' : 'transparent',
                  borderColor: 'transparent',
                },
              },
            ]}
            style={styles.segmentedButtons}
            theme={{
              colors: {
                onSurface: '#fff',
                outline: 'transparent',
                onSurfaceVariant: 'rgba(255,255,255,0.7)',
              },
            }}
          />
        </View>

        {/* Rewards List */}
        <View style={styles.section}>
          {activeTab === 'available' ? (
            <View style={styles.rewardsList}>
              <Text style={styles.sectionTitle}>
                Available Rewards
              </Text>
              <Text style={styles.sectionSubtitle}>
                Redeem your points for amazing rewards
              </Text>
              {rewards.map(reward => renderRewardCard(reward))}
            </View>
          ) : (
            <View style={styles.rewardsList}>
              <Text style={styles.sectionTitle}>
                My Rewards
              </Text>
              <Text style={styles.sectionSubtitle}>
                Your redeemed rewards and history
              </Text>
              {myRewards.length > 0 ? (
                myRewards.map(reward => renderRewardCard(reward, true))
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Icon name="trophy" size={48} color="#6366F1" />
                  </View>
                  <Text style={styles.emptyTitle}>
                    No rewards yet
                  </Text>
                  <Text style={styles.emptyDescription}>
                    Complete surveys to earn points and redeem your first reward!
                  </Text>
                  <Pressable
                    style={styles.emptyCta}
                    onPress={() => navigation.navigate('Surveys')}
                  >
                    <Text style={styles.emptyCtaText}>Browse Surveys</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>

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
    backgroundColor: '#0A0A0A',
  },
  backgroundContainer: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: '#0A0A0A', 
    overflow: 'hidden' 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 70,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    marginTop: 16,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  header: {
    marginBottom: 24,
  },
  pointsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    ...(Platform.OS === 'web' && { 
      backdropFilter: 'blur(40px)', 
      WebkitBackdropFilter: 'blur(40px)' 
    }),
  },
  pointsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsLeft: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  pointsHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  pointsIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    ...(Platform.OS === 'web' && { 
      backdropFilter: 'blur(40px)', 
      WebkitBackdropFilter: 'blur(40px)' 
    }),
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  progressContent: {
    gap: 8,
  },
  nextRewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  segmentedButtons: {
    marginHorizontal: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...(Platform.OS === 'web' && { 
      backdropFilter: 'blur(40px)', 
      WebkitBackdropFilter: 'blur(40px)' 
    }),
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  rewardsList: {
    gap: 16,
  },
  rewardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    ...(Platform.OS === 'web' && { 
      backdropFilter: 'blur(40px)', 
      WebkitBackdropFilter: 'blur(40px)' 
    }),
  },
  rewardImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardImage: {
    width: '100%',
    height: '100%',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rewardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  rewardMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  rewardPoints: {
    marginLeft: 16,
  },
  pointsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  pointsText: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 12,
  },
  categoryChip: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  rewardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  redeemButtonEnabled: {
    backgroundColor: '#6366F1',
  },
  redeemButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  redeemButtonPressed: {
    opacity: 0.8,
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  redeemButtonTextEnabled: {
    color: '#fff',
  },
  redeemButtonTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
  redeemedBadge: {
    alignItems: 'flex-end',
  },
  redeemedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  pendingChip: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  redeemedText: {
    color: '#4ADE80',
    fontWeight: '600',
    fontSize: 14,
  },
  pendingText: {
    color: '#F59E0B',
  },
  redemptionDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...(Platform.OS === 'web' && { 
      backdropFilter: 'blur(40px)', 
      WebkitBackdropFilter: 'blur(40px)' 
    }),
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyCta: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyCtaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 24,
  },
});