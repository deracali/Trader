import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import BottomTab from '../../components/tab/tab';

const { width, height } = Dimensions.get('window');

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('achievements');
 const router = useRouter();



  const achievements = [
    {
      id: 1,
      title: 'First Purchase',
      description: 'Made your first gift card purchase',
      icon: '🎉',
      earned: true,
      date: '2024-01-15',
      color: '#6366f1'
    },
    {
      id: 2,
      title: 'Big Spender',
      description: 'Spent over $500 on gift cards',
      icon: '💰',
      earned: true,
      date: '2024-02-20',
      color: '#10b981'
    },
    {
      id: 3,
      title: 'Streak Master',
      description: 'Made purchases for 7 consecutive days',
      icon: '🔥',
      earned: true,
      date: '2024-03-10',
      color: '#f59e0b'
    },
    {
      id: 4,
      title: 'Category Explorer',
      description: 'Purchased from 10 different categories',
      icon: '🗺️',
      earned: false,
      progress: 7,
      total: 10,
      color: '#8b5cf6'
    },
    {
      id: 5,
      title: 'Loyalty Member',
      description: 'Been a member for over 6 months',
      icon: '👑',
      earned: true,
      date: '2024-04-01',
      color: '#f97316'
    },
    {
      id: 6,
      title: 'Gift Master',
      description: 'Purchased 50 gift cards',
      icon: '🎁',
      earned: false,
      progress: 32,
      total: 50,
      color: '#ec4899'
    }
  ];

  const stats = [
    { label: 'Total Spent', value: '$1,247', icon: '💵' },
    { label: 'Cards Bought', value: '32', icon: '🎯' },
    { label: 'Days Active', value: '156', icon: '📅' },
    { label: 'Achievements', value: '4/6', icon: '🏆' }
  ];

  const recentActivity = [
    { action: 'Purchased Amazon Gift Card', amount: '$50', date: '2 hours ago' },
    { action: 'Earned "Streak Master" achievement', amount: '', date: '1 day ago' },
    { action: 'Purchased Netflix Gift Card', amount: '$25', date: '3 days ago' },
    { action: 'Purchased Spotify Gift Card', amount: '$30', date: '5 days ago' }
  ];

  const styles = {
    container: {
      flex: 1,
      backgroundColor: 'white',
      paddingTop:20,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: width * 0.05,
    },
    header: {
      marginTop: height * 0.02,
      marginBottom: height * 0.03,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: height * 0.02,
    },
    welcomeText: {
      fontSize: width * 0.04,
      color: '#6b7280',
      marginBottom: height * 0.005,
    },
    headerTitle: {
      fontSize: width * 0.07,
      fontWeight: 'bold',
      color: '#1f2937',
    },
    profileButton: {
      width: width * 0.12,
      height: width * 0.12,
      borderRadius: width * 0.06,
      backgroundColor: '#6366f1',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#6366f1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    profileIcon: {
      fontSize: width * 0.06,
      color: '#ffffff',
    },
    profileInfoCard: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: width * 0.04,
      marginBottom: height * 0.03,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: height * 0.02,
    },
    profileAvatar: {
      width: width * 0.16,
      height: width * 0.16,
      borderRadius: width * 0.08,
      backgroundColor: '#6366f1',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: width * 0.04,
    },
    avatarText: {
      fontSize: width * 0.06,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    profileName: {
      fontSize: width * 0.05,
      fontWeight: 'bold',
      color: '#1f2937',
    },
    profileStatus: {
      fontSize: width * 0.035,
      color: '#6b7280',
    },
    profileMember: {
      fontSize: width * 0.03,
      color: '#6366f1',
      fontWeight: '600',
    },
    levelContainer: {
      backgroundColor: '#f3f4f6',
      borderRadius: 12,
      padding: width * 0.04,
    },
    levelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: height * 0.015,
    },
    levelText: {
      fontSize: width * 0.03,
      color: '#6b7280',
      marginBottom: height * 0.005,
    },
    levelValue: {
      fontSize: width * 0.035,
      fontWeight: 'bold',
      color: '#6366f1',
    },
    progressBar: {
      backgroundColor: '#e5e7eb',
      height: height * 0.008,
      borderRadius: height * 0.004,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#6366f1',
      width: '87%',
      borderRadius: height * 0.004,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: height * 0.03,
    },
    statCard: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: width * 0.04,
      alignItems: 'center',
      width: (width - width * 0.15) / 2,
      marginBottom: height * 0.02,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statIcon: {
      fontSize: width * 0.06,
      marginBottom: height * 0.01,
    },
    statNumber: {
      fontSize: width * 0.045,
      fontWeight: 'bold',
      color: '#6366f1',
      marginBottom: height * 0.005,
    },
    statLabel: {
      fontSize: width * 0.03,
      color: '#6b7280',
      textAlign: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: height * 0.03,
    },
    tabButton: {
      flex: 1,
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.04,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      alignItems: 'center',
    },
    tabButtonLeft: {
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    tabButtonRight: {
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      borderLeftWidth: 0,
    },
    tabButtonActive: {
      backgroundColor: '#6366f1',
      borderColor: '#6366f1',
    },
    tabText: {
      fontSize: width * 0.035,
      fontWeight: '600',
      color: '#6b7280',
    },
    tabTextActive: {
      color: '#ffffff',
    },
    sectionTitle: {
      fontSize: width * 0.05,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: height * 0.01,
    },
    sectionSubtitle: {
      fontSize: width * 0.035,
      color: '#6b7280',
      marginBottom: height * 0.02,
    },
    achievementCard: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: width * 0.04,
      marginBottom: height * 0.02,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderLeftWidth: 4,
    },
    achievementEarned: {
      borderLeftColor: '#10b981',
    },
    achievementPending: {
      borderLeftColor: '#e5e7eb',
    },
    achievementHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    achievementIcon: {
      width: width * 0.12,
      height: width * 0.12,
      borderRadius: width * 0.06,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: width * 0.04,
      backgroundColor: '#f3f4f6',
    },
    achievementIconEarned: {
      backgroundColor: '#dcfce7',
    },
    achievementEmoji: {
      fontSize: width * 0.05,
    },
    achievementContent: {
      flex: 1,
    },
    achievementTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: height * 0.01,
    },
    achievementTitle: {
      fontSize: width * 0.04,
      fontWeight: 'bold',
      color: '#1f2937',
    },
    achievementDescription: {
      fontSize: width * 0.035,
      color: '#6b7280',
    },
    achievementBadge: {
      backgroundColor: '#dcfce7',
      borderRadius: width * 0.02,
      padding: width * 0.01,
    },
    achievementBadgeText: {
      fontSize: width * 0.025,
      color: '#166534',
    },
    achievementDate: {
      fontSize: width * 0.03,
      color: '#10b981',
      fontWeight: '600',
    },
    progressContainer: {
      marginTop: height * 0.01,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: height * 0.005,
    },
    progressText: {
      fontSize: width * 0.03,
      color: '#6b7280',
    },
    progressBarContainer: {
      backgroundColor: '#e5e7eb',
      height: height * 0.008,
      borderRadius: height * 0.004,
      overflow: 'hidden',
    },
    activityCard: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: width * 0.04,
      marginBottom: height * 0.015,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    activityLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    activityIcon: {
      width: width * 0.1,
      height: width * 0.1,
      backgroundColor: '#eef2ff',
      borderRadius: width * 0.05,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: width * 0.03,
    },
    activityIconText: {
      fontSize: width * 0.04,
    },
    activityAction: {
      fontSize: width * 0.035,
      fontWeight: '600',
      color: '#1f2937',
    },
    activityDate: {
      fontSize: width * 0.03,
      color: '#6b7280',
    },
    activityAmount: {
      fontSize: width * 0.035,
      fontWeight: 'bold',
      color: '#6366f1',
    },
    bottomSpacing: {
      height: height * 0.05,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
       <View style={styles.header}>
      <View style={styles.headerTop}>
        {/* Back button on the left */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Your Profile</Text>
        </View>

        <View style={styles.profileButton}>
          <Text style={styles.profileIcon}>👤</Text>
        </View>
      </View>
    </View>

        {/* Profile Info Card */}
        <View style={styles.profileInfoCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <View>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileStatus}>Premium Member</Text>
              <Text style={styles.profileMember}>Member since Jan 2024</Text>
            </View>
          </View>
          
          <View style={styles.levelContainer}>
            <View style={styles.levelHeader}>
              <View>
                <Text style={styles.levelText}>Member Level</Text>
                <Text style={styles.levelValue}>Gold Member</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.levelText}>Next Level</Text>
                <Text style={[styles.levelValue, { color: '#8b5cf6' }]}>Platinum (87%)</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statNumber}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('achievements')}
            style={[
              styles.tabButton,
              styles.tabButtonLeft,
              activeTab === 'achievements' && styles.tabButtonActive
            ]}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'achievements' && styles.tabTextActive
            ]}>
              Achievements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('activity')}
            style={[
              styles.tabButton,
              styles.tabButtonRight,
              activeTab === 'activity' && styles.tabButtonActive
            ]}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'activity' && styles.tabTextActive
            ]}>
              Recent Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <View>
            <Text style={styles.sectionTitle}>Your Achievements</Text>
            <Text style={styles.sectionSubtitle}>Unlock rewards by completing challenges</Text>
            
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  achievement.earned ? styles.achievementEarned : styles.achievementPending
                ]}
              >
                <View style={styles.achievementHeader}>
                  <View style={[
                    styles.achievementIcon,
                    achievement.earned && styles.achievementIconEarned
                  ]}>
                    <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                  </View>
                  
                  <View style={styles.achievementContent}>
                    <View style={styles.achievementTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.achievementTitle}>{achievement.title}</Text>
                        <Text style={styles.achievementDescription}>{achievement.description}</Text>
                      </View>
                      {achievement.earned && (
                        <View style={styles.achievementBadge}>
                          <Text style={styles.achievementBadgeText}>✓</Text>
                        </View>
                      )}
                    </View>
                    
                    {achievement.earned ? (
                      <Text style={styles.achievementDate}>
                        Earned on {new Date(achievement.date).toLocaleDateString()}
                      </Text>
                    ) : (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressText}>Progress</Text>
                          <Text style={styles.progressText}>
                            {achievement.progress}/{achievement.total}
                          </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={{
                              height: '100%',
                              backgroundColor: achievement.color,
                              width: `${(achievement.progress / achievement.total) * 100}%`,
                              borderRadius: height * 0.004,
                            }}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity Tab */}
        {activeTab === 'activity' && (
          <View>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.sectionSubtitle}>Your latest purchases and achievements</Text>
            
            {recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityCard}>
                <View style={styles.activityRow}>
                  <View style={styles.activityLeft}>
                    <View style={styles.activityIcon}>
                      <Text style={styles.activityIconText}>
                        {activity.amount ? '🎁' : '⭐'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.activityAction}>{activity.action}</Text>
                      <Text style={styles.activityDate}>{activity.date}</Text>
                    </View>
                  </View>
                  {activity.amount && (
                    <Text style={styles.activityAmount}>{activity.amount}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
      <BottomTab/>
    </SafeAreaView>
  );
};

export default ProfilePage;