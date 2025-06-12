import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import BottomTab from '../../components/tab/tab';

const { width, height } = Dimensions.get('window');

const GiftCardHomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();

  const categories = [
    { id: 1, name: 'All' },
    { id: 2, name: 'Entertainment' },
    { id: 3, name: 'Shopping' },
    { id: 4, name: 'Food' },
    { id: 5, name: 'Gaming' },
  ];

const cardNumberLengths = {
  Amazon: 14,
  Netflix: 11,
  Spotify: 12,
  Steam: 15,
  Starbucks: 16,
  iTunes: 16,
  RazorGold: 12,
  GooglePlay: 20,
  Xbox: 25,
  Playstation: 12,
  Nintendo: 16,
  Walmart: 16,
  Google: 20,
  Uber: 15,
  Target: 15,
};

const giftCards = [
  {
    id: 1,
    name: 'Amazon',
    category: 'Shopping',
    discount: '5% OFF',
    image: '🛒',
    color: '#FF9900',
    popular: true,
    cardLimit: cardNumberLengths.Amazon,
    types: [
      { country: 'Brazil', rate: 820, currency: 'BRL' },
      { country: 'Germany', rate: 800, currency: 'EUR' },
      { country: 'USA', rate: 780, currency: 'USD' },
    ],
  },
  {
    id: 2,
    name: 'Netflix',
    category: 'Entertainment',
    discount: '10% OFF',
    image: '🎬',
    color: '#E50914',
    popular: true,
    cardLimit: cardNumberLengths.Netflix,
    types: [{ country: 'Global', rate: 850, currency: 'USD' }],
  },
  {
    id: 3,
    name: 'Spotify',
    category: 'Entertainment',
    discount: '15% OFF',
    image: '🎵',
    color: '#1DB954',
    popular: false,
    cardLimit: cardNumberLengths.Spotify,
    types: [{ country: 'Global', rate: 860, currency: 'USD' }],
  },
  {
    id: 4,
    name: 'Steam',
    category: 'Gaming',
    discount: '8% OFF',
    image: '🎮',
    color: '#171A21',
    popular: true,
    cardLimit: cardNumberLengths.Steam,
    types: [
      { country: 'USA', rate: 650, currency: 'USD' },
      { country: 'EU', rate: 630, currency: 'EUR' },
    ],
  },
  {
    id: 5,
    name: 'Starbucks',
    category: 'Food',
    discount: '12% OFF',
    image: '☕',
    color: '#00704A',
    popular: false,
    cardLimit: cardNumberLengths.Starbucks,
    types: [
      { country: 'USA', rate: 720, currency: 'USD' },
      { country: 'UK', rate: 710, currency: 'GBP' },
    ],
  },
  {
    id: 6,
    name: 'iTunes',
    category: 'Entertainment',
    discount: '7% OFF',
    image: '🎵',
    color: '#FA57C1',
    popular: false,
    cardLimit: cardNumberLengths.iTunes,
    types: [
      { country: 'USA', rate: 750, currency: 'USD' },
      { country: 'Canada', rate: 740, currency: 'CAD' },
    ],
  },
  {
    id: 7,
    name: 'RazorGold',
    category: 'Gaming',
    discount: '5% OFF',
    image: '💎',
    color: '#00BFFF',
    popular: true,
    cardLimit: cardNumberLengths.RazorGold,
    types: [{ country: 'Global', rate: 900, currency: 'USD' }],
  },
  {
    id: 8,
    name: 'GooglePlay',
    category: 'Entertainment',
    discount: '10% OFF',
    image: '▶️',
    color: '#4285F4',
    popular: true,
    cardLimit: cardNumberLengths.GooglePlay,
    types: [{ country: 'Global', rate: 880, currency: 'USD' }],
  },
  {
    id: 9,
    name: 'Xbox',
    category: 'Gaming',
    discount: '12% OFF',
    image: '🎮',
    color: '#107C10',
    popular: true,
    cardLimit: cardNumberLengths.Xbox,
    types: [{ country: 'Global', rate: 860, currency: 'USD' }],
  },
  {
    id: 10,
    name: 'Playstation',
    category: 'Gaming',
    discount: '15% OFF',
    image: '🎮',
    color: '#003087',
    popular: true,
    cardLimit: cardNumberLengths.Playstation,
    types: [{ country: 'Global', rate: 870, currency: 'USD' }],
  },
  {
    id: 11,
    name: 'Nintendo',
    category: 'Gaming',
    discount: '8% OFF',
    image: '🎮',
    color: '#E60012',
    popular: true,
    cardLimit: cardNumberLengths.Nintendo,
    types: [{ country: 'Global', rate: 840, currency: 'USD' }],
  },
  {
    id: 12,
    name: 'Walmart',
    category: 'Shopping',
    discount: '5% OFF',
    image: '🛒',
    color: '#0071CE',
    popular: false,
    cardLimit: cardNumberLengths.Walmart,
    types: [{ country: 'USA', rate: 790, currency: 'USD' }],
  },
  {
    id: 13,
    name: 'Uber',
    category: 'Transport',
    discount: '7% OFF',
    image: '🚗',
    color: '#000000',
    popular: false,
    cardLimit: cardNumberLengths.Uber,
    types: [{ country: 'Global', rate: 760, currency: 'USD' }],
  },
  {
    id: 14,
    name: 'Target',
    category: 'Shopping',
    discount: '10% OFF',
    image: '🎯',
    color: '#CC0000',
    popular: false,
    cardLimit: cardNumberLengths.Target,
    types: [{ country: 'USA', rate: 770, currency: 'USD' }],
  },
];



  const filteredCards = giftCards.filter(card =>
    (selectedCategory === 'All' || card.category === selectedCategory) &&
    card.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGiftCard = (card) => (
    <TouchableOpacity key={card.id} style={styles.giftCard}>
      {card.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>🔥 Popular</Text>
        </View>
      )}
      <View style={[styles.cardIcon, { backgroundColor: card.color }]}>
        <Text style={styles.cardEmoji}>{card.image}</Text>
      </View>
      <Text style={styles.cardName}>{card.name}</Text>
      <Text style={styles.cardCategory}>{card.category}</Text>
      <View style={styles.discountContainer}>
        <Text style={styles.discountText}>{card.discount}</Text>
      </View>
    <TouchableOpacity
      style={styles.buyButton}
      onPress={() =>
        router.push({
          pathname: 'form/cardForm',
          params: { card: JSON.stringify(card) }, // ✅ pass full card data
        })
      }
    >
      <Text style={styles.buyButtonText}>Trade</Text>
    </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="black" />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Welcome back! 👋</Text>
              <Text style={styles.headerTitle}>Buy Gift Cards</Text>
            </View>
           <TouchableOpacity
  style={styles.profileButton}
  onPress={() => router.push('profile/profile')}
>
  <Text style={styles.profileIcon}>👤</Text>
</TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search gift cards..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Gift Cards</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>Up to 20%</Text>
            <Text style={styles.statLabel}>Discounts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>Instant</Text>
            <Text style={styles.statLabel}>Delivery</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.name && styles.categoryButtonSelected
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.name && styles.categoryTextSelected
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'Popular Gift Cards' : `${selectedCategory} Cards`}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.giftCardsGrid}>
            {filteredCards.map(renderGiftCard)}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
        <BottomTab />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    fontSize: width * 0.05,
    marginRight: width * 0.03,
  },
  searchInput: {
    flex: 1,
    height: height * 0.06,
    fontSize: width * 0.04,
    color: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.03,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: width * 0.04,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: width * 0.01,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  sectionContainer: {
    marginBottom: height * 0.03,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: width * 0.035,
    color: '#6366f1',
    fontWeight: '600',
  },
  categoryScroll: {
    marginTop: height * 0.015,
  },
  categoryButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.015,
    borderRadius: 20,
    marginRight: width * 0.03,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryText: {
    fontSize: width * 0.035,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  giftCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  giftCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: width * 0.04,
    width: (width - width * 0.15) / 2,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: width * 0.02,
    right: width * 0.02,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.005,
    zIndex: 1,
  },
  popularText: {
    fontSize: width * 0.025,
    color: '#92400e',
    fontWeight: '600',
  },
  cardIcon: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.015,
    alignSelf: 'center',
  },
  cardEmoji: {
    fontSize: width * 0.06,
  },
  cardName: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: height * 0.005,
  },
  cardCategory: {
    fontSize: width * 0.03,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: height * 0.01,
  },
  discountContainer: {
    backgroundColor: '#dcfce7',
    borderRadius: 6,
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.005,
    alignSelf: 'center',
    marginBottom: height * 0.015,
  },
  discountText: {
    fontSize: width * 0.03,
    color: '#166534',
    fontWeight: '600',
  },
  buyButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: height * 0.01,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: width * 0.035,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: height * 0.05,
  },
});


export default GiftCardHomePage;