import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const CardSuccessPage = ({ 
  status = 'successful', // 'successful', 'pending', 'failed'
  onContinue,
  onGoHome 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'successful':
        return {
          icon: '✓',
          color: '#10b981',
          bgColor: '#ecfdf5',
          borderColor: '#6ee7b7',
          title: 'Card Request Successful!',
          message: 'Your card is being processed',
          description: 'Your card request has been successfully submitted and is now being processed. You will receive updates via SMS and email as your card moves through production.'
        };
      case 'pending':
        return {
          icon: '⏳',
          color: '#f59e0b',
          bgColor: '#fffbeb',
          borderColor: '#fde68a',
          title: 'Card Request Pending',
          message: 'Your card is being processed',
          description: 'Your card request is currently being reviewed. This may take a few minutes. Please do not close the app or navigate away from this page.'
        };
      case 'failed':
        return {
          icon: '✗',
          color: '#ef4444',
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
          title: 'Card Request Failed',
          message: 'Your card processing encountered an issue',
          description: 'We encountered an issue while processing your card request. Please check your information and try again, or contact support if the problem persists.'
        };
      default:
        return getStatusConfig('successful');
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View style={styles.container}>
      <View style={styles.keyboardView}>
        <View style={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>💳</Text>
            </View>
            <Text style={styles.appName}>Card Status</Text>
            <Text style={styles.subtitle}>Your card request update</Text>
          </View>

          {/* Status Container */}
          <View style={[
            styles.statusContainer,
            { 
              backgroundColor: statusConfig.bgColor,
              borderColor: statusConfig.borderColor 
            }
          ]}>
            <View style={[
              styles.statusIconContainer,
              { backgroundColor: statusConfig.color }
            ]}>
              <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
            </View>
            
            <Text style={[styles.statusTitle, { color: statusConfig.color }]}>
              {statusConfig.title}
            </Text>
            
            <Text style={styles.processingMessage}>
              {statusConfig.message}
            </Text>
            
            <Text style={styles.statusDescription}>
              {statusConfig.description}
            </Text>
          </View>

          {/* Additional Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {status === 'successful' 
                ? "Your card will be delivered to your registered address within 5-7 business days. Track your delivery status in the app."
                : status === 'pending'
                ? "Please keep this page open while we process your request. This usually takes 2-3 minutes."
                : "If you continue to experience issues, please contact our support team at support@cardapp.com or call +234 800 123 4567."
              }
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {status === 'successful' && (
              <>
                <TouchableOpacity 
                  style={styles.authButton}
                  onPress={onContinue}
                >
                  <Text style={styles.authButtonText}>Continue to Dashboard</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.authButton, styles.secondaryButton]}
                  onPress={onGoHome}
                >
                  <Text style={[styles.authButtonText, styles.secondaryButtonText]}>
                    Go to Home
                  </Text>
                </TouchableOpacity>
              </>
            )}
            
            {status === 'pending' && (
              <TouchableOpacity 
                style={[styles.authButton, styles.authButtonDisabled]}
                disabled={true}
              >
                <Text style={styles.authButtonText}>Processing...</Text>
              </TouchableOpacity>
            )}
            
            {status === 'failed' && (
              <>
                <TouchableOpacity 
                  style={styles.authButton}
                  onPress={onContinue}
                >
                  <Text style={styles.authButtonText}>Try Again</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.authButton, styles.secondaryButton]}
                  onPress={onGoHome}
                >
                  <Text style={[styles.authButtonText, styles.secondaryButtonText]}>
                    Contact Support
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
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
  statusContainer: {
    borderRadius: 16,
    padding: width * 0.06,
    alignItems: 'center',
    marginBottom: height * 0.03,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIconContainer: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  statusIcon: {
    fontSize: width * 0.08,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statusTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: height * 0.01,
  },
  processingMessage: {
    fontSize: width * 0.045,
    color: '#374151',
    textAlign: 'center',
    marginBottom: height * 0.015,
    fontWeight: '500',
  },
  statusDescription: {
    fontSize: width * 0.035,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: width * 0.05,
  },
  infoContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: width * 0.04,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    marginBottom: height * 0.03,
  },
  infoText: {
    fontSize: width * 0.035,
    color: '#6b7280',
    lineHeight: width * 0.05,
  },
  buttonContainer: {
    marginTop: height * 0.02,
  },
  authButton: {
    backgroundColor: '#6366f1',
    height: height * 0.06,
    borderRadius: 12,
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
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#6366f1',
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryButtonText: {
    color: '#6366f1',
  },
});

export default CardSuccessPage;