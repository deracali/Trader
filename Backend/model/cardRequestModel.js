import mongoose from 'mongoose';

const giftCardSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
  },
  cardNumber: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  ngnAmount: {
    type: Number,
    required: true,
  },
  exchangeRate: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
    default: 'pending',
  },
  userDescription: {
    type: String,
    trim: true,
  },
  companyFeedback: {
    type: String,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,  // false means not read yet
  },
  readCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GiftCard = mongoose.model('GiftCard', giftCardSchema);

export default GiftCard;
