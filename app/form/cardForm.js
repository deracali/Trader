
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const GiftCardPurchaseForm = () => {
  // form state
   const router = useRouter();
  const [cardAmount, setCardAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [ngnAmount, setNgnAmount] = useState('0');
  const [cardImage, setCardImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // pull in your param
  const { card } = useLocalSearchParams();
  
  // More robust parsing with error handling
  const parsedCard = (() => {
    try {
      if (typeof card === 'string') {
        return JSON.parse(card);
      } else if (typeof card === 'object' && card !== null) {
        return card;
      }
      return null;
    } catch (error) {
      console.warn('Failed to parse card data:', error);
      return null;
    }
  })();

  // build types, rates, currencies, and optional number-lengths from parsedCard with better error handling
  const availableCardTypes = parsedCard?.types?.map((t) => `${parsedCard.name} (${t.country})`) || [];

  const cardExchangeRates = parsedCard?.types?.reduce((acc, t) => {
    const key = `${parsedCard.name} (${t.country})`;
    acc[key] = parseFloat(t.rate) || 0;
    return acc;
  }, {}) || {};

  const cardCurrencies = parsedCard?.types?.reduce((acc, t) => {
    const key = `${parsedCard.name} (${t.country})`;
    acc[key] = t.currency || 'USD';
    return acc;
  }, {}) || {};

  const cardNumberLengths = parsedCard?.types?.reduce((acc, t) => {
    if (t.numberLength && !isNaN(parseInt(t.numberLength))) {
      const key = `${parsedCard.name} (${t.country})`;
      acc[key] = parseInt(t.numberLength);
    }
    return acc;
  }, {}) || {};

  // single state for which card is selected
  const [selectedCard, setSelectedCard] = useState('');
  
  // Add state for current currency to ensure proper updates
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  
  // Initialize selected card when available types change
  useEffect(() => {
    if (availableCardTypes.length > 0 && !selectedCard) {
      const firstCard = availableCardTypes[0];
      setSelectedCard(firstCard);
      setCurrentCurrency(cardCurrencies[firstCard] || 'USD');
    }
  }, [availableCardTypes.length]);

  // Update currency whenever selected card changes
  useEffect(() => {
    if (selectedCard && cardCurrencies[selectedCard]) {
      setCurrentCurrency(cardCurrencies[selectedCard]);
    }
  }, [selectedCard, cardCurrencies]);

  // Get current currency for selected card
  const getCurrentCurrency = () => {
    return currentCurrency;
  };

  // recalc NGN whenever amount or selectedCard changes
  useEffect(() => {
    if (cardAmount && selectedCard && !isNaN(parseFloat(cardAmount))) {
      const rate = cardExchangeRates[selectedCard] || 0;
      const val = parseFloat(cardAmount) * rate;
      setNgnAmount(Number.isFinite(val) ? val.toLocaleString() : '0');
    } else {
      setNgnAmount('0');
    }
  }, [cardAmount, selectedCard, cardExchangeRates]);

  // format and validate card number
  const formatCardNumber = (txt) =>
    txt
      .replace(/[^A-Za-z0-9]/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim()
      .toUpperCase();

  const handleCardNumberChange = (txt) => {
    setCardNumber(formatCardNumber(txt));
    // Clear card number error when user starts typing
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: undefined }));
    }
  };

  const validateCardNumber = () => {
    if (!selectedCard) return true;
    const cleaned = cardNumber.replace(/\s/g, '');
    const expected = cardNumberLengths[selectedCard];
    return expected ? cleaned.length === expected : cleaned.length > 0;
  };

  // image pickers
  const pickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        return Alert.alert('Permission Required', 'Need gallery access to upload image.');
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setCardImage(result.assets[0]);
        // Clear image error when image is selected
        if (errors.image) {
          setErrors(prev => ({ ...prev, image: undefined }));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery.');
    }
  };

  const takePhoto = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        return Alert.alert('Permission Required', 'Need camera access to take photo.');
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setCardImage(result.assets[0]);
        // Clear image error when image is taken
        if (errors.image) {
          setErrors(prev => ({ ...prev, image: undefined }));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const showImageOptions = () =>
    Alert.alert('Add Card Image', 'Choose an option', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const removeImage = () => setCardImage(null);

  // Handle card type selection
  const handleCardTypeSelection = (type) => {
    setSelectedCard(type);
    setCurrentCurrency(cardCurrencies[type] || 'USD');
    setCardNumber(''); // Reset card number when type changes
    // Clear related errors
    setErrors(prev => ({ 
      ...prev, 
      card: undefined, 
      cardNumber: undefined 
    }));
  };

  // Handle amount input
  const handleAmountChange = (text) => {
    // Only allow numbers and decimal point
    const cleanText = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleanText.split('.');
    if (parts.length > 2) {
      return;
    }
    setCardAmount(cleanText);
    // Clear amount error when user starts typing
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  };

  // form validation
  const validateForm = () => {
    const errs = {};
    
    if (!selectedCard) {
      errs.card = 'Please select a gift card type';
    }
    
    if (!cardAmount) {
      errs.amount = 'Please enter card amount';
    } else {
      const amount = parseFloat(cardAmount);
      const currency = getCurrentCurrency();
      if (isNaN(amount)) {
        errs.amount = 'Please enter a valid amount';
      } else if (amount < 10) {
        errs.amount = `Minimum amount is ${currency} 10`;
      } else if (amount > 500) {
        errs.amount = `Maximum amount is ${currency} 500`;
      }
    }

    if (!cardNumber) {
      errs.cardNumber = 'Please enter card number';
    } else if (!validateCardNumber()) {
      const len = cardNumberLengths[selectedCard];
      if (len) {
        errs.cardNumber = `${selectedCard} number must be ${len} digits`;
      } else {
        errs.cardNumber = 'Please enter a valid card number';
      }
    }

    if (!cardImage) {
      errs.image = 'Please upload a clear image';
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePurchase = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Purchase Successful!',
        `You will receive ₦${ngnAmount} for your ${getCurrentCurrency()} ${cardAmount} ${selectedCard} card.`,
        [{ 
          text: 'OK',
          onPress: () => {
            // Reset form
            setCardAmount('');
            setCardNumber('');
            setCardImage(null);
            setNgnAmount('0');
            setErrors({});
            if (availableCardTypes.length > 0) {
              const firstCard = availableCardTypes[0];
              setSelectedCard(firstCard);
              setCurrentCurrency(cardCurrencies[firstCard] || 'USD');
            }
          }
        }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process purchase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debug logging (remove in production)
  useEffect(() => {
    console.log('Card data:', parsedCard);
    console.log('Available types:', availableCardTypes);
    console.log('Selected card:', selectedCard);
    console.log('Exchange rates:', cardExchangeRates);
    console.log('Card currencies:', cardCurrencies);
    console.log('Current currency:', getCurrentCurrency());
  }, [parsedCard, availableCardTypes, selectedCard, cardExchangeRates, cardCurrencies, currentCurrency]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.keyboardView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>💳</Text>
      </View>
      <Text style={styles.appName}>GiftCard Exchange</Text>
      <Text style={styles.subtitle}>
        Sell your gift cards instantly{'\n'}Get paid in Nigerian Naira
      </Text>
    </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Gift Card Type Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select Gift Card Type *</Text>
            {availableCardTypes.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.cardTypeContainer}>
                  {availableCardTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.cardTypeButton,
                        selectedCard === type && styles.cardTypeButtonActive,
                      ]}
                      onPress={() => handleCardTypeSelection(type)}
                    >
                      <Text
                        style={[
                          styles.cardTypeText,
                          selectedCard === type && styles.cardTypeTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                      <Text style={styles.rateText}>
                        ₦{cardExchangeRates[type]}/{cardCurrencies[type] || 'USD'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.noCardTypesContainer}>
                <Text style={styles.noCardTypesText}>
                  No card types available. Please check your card data.
                </Text>
              </View>
            )}
            {errors.card && <Text style={styles.errorText}>{errors.card}</Text>}
          </View>

          {/* Card Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Card Amount ({getCurrentCurrency()}) *</Text>
            <TextInput
              style={[styles.input, errors.amount && styles.inputError]}
              value={cardAmount}
              onChangeText={handleAmountChange}
              placeholder={`Enter amount in ${getCurrentCurrency()}`}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
          </View>

          {/* Card Number Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Card Number *
              {cardNumberLengths[selectedCard] && (
                <Text style={styles.labelNote}>
                  ({cardNumberLengths[selectedCard]} digits)
                </Text>
              )}
            </Text>
            <TextInput
              style={[styles.input, errors.cardNumber && styles.inputError]}
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder={
                selectedCard ? `Enter ${selectedCard} number` : 'Select card type first'
              }
              keyboardType="default"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
              maxLength={
                cardNumberLengths[selectedCard]
                  ? cardNumberLengths[selectedCard] + Math.floor(cardNumberLengths[selectedCard] / 4)
                  : 50
              }
              editable={!!selectedCard}
            />
            {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
          </View>

          {/* Card Image Upload */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Card Image *</Text>
            <Text style={styles.imageNote}>
              Upload a clear photo of your gift card (front side)
            </Text>
            {cardImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: cardImage.uri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.imageUploadButton, errors.image && styles.imageUploadButtonError]}
                onPress={showImageOptions}
              >
                <Text style={styles.imageUploadIcon}>📷</Text>
                <Text style={styles.imageUploadText}>Tap to add image</Text>
                <Text style={styles.imageUploadSubtext}>Camera or Gallery</Text>
              </TouchableOpacity>
            )}
            {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
          </View>

          {/* NGN Amount Display */}
          <View style={styles.conversionContainer}>
            <View style={styles.conversionHeader}>
              <Text style={styles.conversionLabel}>You will receive:</Text>
              <Text style={styles.ngnAmount}>₦{ngnAmount}</Text>
            </View>
            {selectedCard && cardAmount && (
              <Text style={styles.conversionRate}>
                Rate: ₦{cardExchangeRates[selectedCard]} per {getCurrentCurrency()}
              </Text>
            )}
          </View>

          {/* Purchase Button */}
          <TouchableOpacity
            style={[styles.authButton, isLoading && styles.authButtonDisabled]}
            onPress={handlePurchase}
            disabled={isLoading}
          >
            <Text style={styles.authButtonText}>
              {isLoading ? 'Processing...' : 'Sell Gift Card'}
            </Text>
          </TouchableOpacity>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • Instant payment after verification{'\n'}
              • Secure and trusted platform{'\n'}
              • 24/7 customer support{'\n'}
              • Clear card images ensure faster processing
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    keyboardView: {
        flex: 1,
    },
    backButton: {
  position: 'absolute',
  left: 10,
  top: 10,
  zIndex: 1,
  padding: 10,
},

    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: width * 0.08,
        paddingVertical: height * 0.02,
    },
    header: {
        alignItems: 'center',
        marginTop: height * 0.05,
        marginBottom: height * 0.04,
    },
    logoContainer: {
        width: width * 0.2,
        height: width * 0.2,
        borderRadius: width * 0.1,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: height * 0.02,
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logoText: {
        fontSize: width * 0.1,
    },
    appName: {
        fontSize: width * 0.08,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: height * 0.01,
    },
    subtitle: {
        fontSize: width * 0.04,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: width * 0.06,
    },
    formContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: width * 0.06,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: height * 0.03,
    },
    inputContainer: {
        marginBottom: height * 0.025,
    },
    label: {
        fontSize: width * 0.035,
        fontWeight: '600',
        color: '#374151',
        marginBottom: height * 0.01,
    },
    labelNote: {
        fontSize: width * 0.03,
        fontWeight: '400',
        color: '#6b7280',
    },
    input: {
        height: height * 0.06,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: width * 0.04,
        fontSize: width * 0.04,
        color: '#1f2937',
        backgroundColor: '#f9fafb',
    },
    inputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    cardTypeContainer: {
        flexDirection: 'row',
        paddingVertical: height * 0.01,
    },
    cardTypeButton: {
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.015,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
        marginRight: width * 0.03,
        alignItems: 'center',
        minWidth: width * 0.25,
    },
    cardTypeButtonActive: {
        borderColor: '#6366f1',
        backgroundColor: '#eef2ff',
    },
    cardTypeText: {
        fontSize: width * 0.035,
        color: '#6b7280',
        fontWeight: '500',
        marginBottom: 2,
    },
    cardTypeTextActive: {
        color: '#6366f1',
        fontWeight: '600',
    },
    rateText: {
        fontSize: width * 0.03,
        color: '#9ca3af',
    },
    imageNote: {
        fontSize: width * 0.032,
        color: '#6b7280',
        marginBottom: height * 0.01,
        fontStyle: 'italic',
    },
    imageUploadButton: {
        height: height * 0.12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    imageUploadButtonError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    imageUploadIcon: {
        fontSize: width * 0.08,
        marginBottom: height * 0.005,
    },
    imageUploadText: {
        fontSize: width * 0.04,
        color: '#374151',
        fontWeight: '500',
    },
    imageUploadSubtext: {
        fontSize: width * 0.032,
        color: '#6b7280',
        marginTop: 2,
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: height * 0.2,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    conversionContainer: {
        backgroundColor: '#f0f9ff',
        borderRadius: 12,
        padding: width * 0.04,
        marginBottom: height * 0.025,
        borderWidth: 1,
        borderColor: '#bae6fd',
    },
    conversionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: height * 0.005,
    },
    conversionLabel: {
        fontSize: width * 0.04,
        color: '#0369a1',
        fontWeight: '500',
    },
    ngnAmount: {
        fontSize: width * 0.05,
        fontWeight: 'bold',
        color: '#0c4a6e',
    },
    conversionRate: {
        fontSize: width * 0.032,
        color: '#0284c7',
        textAlign: 'center',
    },
    authButton: {
        backgroundColor: '#6366f1',
        height: height * 0.06,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: height * 0.03,
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    authButtonDisabled: {
        backgroundColor: '#9ca3af',
        shadowOpacity: 0.1,
    },
    authButtonText: {
        color: '#ffffff',
        fontSize: width * 0.045,
        fontWeight: '600',
    },
    infoContainer: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: width * 0.04,
        borderLeftWidth: 4,
        borderLeftColor: '#6366f1',
    },
    infoText: {
        fontSize: width * 0.035,
        color: '#6b7280',
        lineHeight: width * 0.05,
    },
    errorText: {
        color: '#ef4444',
        fontSize: width * 0.032,
        marginTop: height * 0.005,
        fontWeight: '500',
    },
});

export default GiftCardPurchaseForm;