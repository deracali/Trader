import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';
import GiftCard from "../model/cardRequestModel.js";
import User from '../model/userModel.js';

// Cloudinary Configuration
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload image
const uploadImage = async (filePath) => {
  try {
    console.log("📤 Uploading image to Cloudinary...");
    console.log("📝 File path:", filePath);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "teacher_profiles",
    });

    console.log("✅ Image uploaded successfully. URL:", result.secure_url);
    return result.secure_url;
  } catch (uploadErr) {
    console.error("❌ Cloudinary upload error:");
    console.error("Message:", uploadErr.message);
    if (uploadErr.response && uploadErr.response.body) {
      console.error("Cloudinary response body:", uploadErr.response.body);
    } else {
      console.error(uploadErr);
    }
    throw uploadErr;
  }
};

// @desc    Create a new gift card sale
// @route   POST /api/giftcards
// @access  Public
export const createGiftCard = async (req, res) => {
  try {
    const {
      type,
      amount,
      currency,
      cardNumber,
      userDescription,
      user, // userId
      bankName,
      accountName,
      accountNumber,
      ngnAmount,
      exchangeRate,
      imageUrl: imageFromBody,
      paymentMethod,
      cryptoPayout,
      walletAddress,
      phoneNumber, // ✅ added phoneNumber
    } = req.body;

    // Validate required fields
    if (!type || !amount || !currency || !cardNumber) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Parse numbers
    const parsedAmount = Number(amount.toString().replace(/,/g, ""));
    const parsedNgnAmount = ngnAmount ? Number(ngnAmount.toString().replace(/,/g, "")) : null;
    const parsedExchangeRate = exchangeRate ? Number(exchangeRate.toString().replace(/,/g, "")) : null;
    const parsedCryptoPayout = cryptoPayout ? Number(cryptoPayout.toString().replace(/,/g, "")) : null;

    if (isNaN(parsedAmount)) {
      return res.status(400).json({ message: "Invalid card amount." });
    }

    // Handle image
    let finalImageUrl = null;
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      if (!imageFile.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Invalid file type. Please upload an image." });
      }
      finalImageUrl = await uploadImage(imageFile.tempFilePath);
    } else if (imageFromBody?.startsWith("http")) {
      finalImageUrl = imageFromBody;
    } else {
      return res.status(400).json({ message: "Please upload an image or provide a valid image URL." });
    }

    // 👉 Check for referrer
    let referrerBankDetails = null;
    if (user) {
      const foundUser = await User.findById(user).populate('referrer');
      if (foundUser?.referrer) {
        referrerBankDetails = {
          accountName: foundUser.referrer.accountName,
          accountNumber: foundUser.referrer.accountNumber,
          bankName: foundUser.referrer.bankName
        };
      }
    }

    // Save gift card with referrer info and phone number
    const newGiftCard = await GiftCard.create({
      type,
      amount: parsedAmount,
      currency,
      cardNumber,
      imageUrl: finalImageUrl,
      ngnAmount: isNaN(parsedNgnAmount) ? null : parsedNgnAmount,
      exchangeRate: isNaN(parsedExchangeRate) ? null : parsedExchangeRate,
      user: user || null,
      userDescription: userDescription || null,
      status: "pending",
      read: false,
      readCount: 0,
      bankDetails: {
        bankName: bankName || null,
        accountName: accountName || null,
        accountNumber: accountNumber || null,
      },
      referrerBankDetails, // ✅ includes referrer account info
      phoneNumber: phoneNumber || null, // ✅ added here
      paymentMethod: paymentMethod || null,
      cryptoPayout: isNaN(parsedCryptoPayout) ? null : parsedCryptoPayout,
      walletAddress: walletAddress || null,
    });

    res.status(201).json({
      message: "Gift card sale created successfully.",
      giftCard: newGiftCard
    });
  } catch (error) {
    console.error("❗ Error in createGiftCard:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};







export const updateGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Only update fields that are present in req.body
    const allowedUpdates = [
      'status',
      'companyFeedback',
      'userDescription',
      'amount',
      'ngnAmount'
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (updateFields[field] !== undefined) {
        updates[field] = updateFields[field];
      }
    });

    // Check if there’s anything to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updatedGiftCard = await GiftCard.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!updatedGiftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    res.json({ success: true, data: updatedGiftCard });
  } catch (err) {
    console.error('Update Gift Card Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};





// GET /api/gift-cards
export const getAllGiftCards = async (req, res) => {
  try {
    const giftCards = await GiftCard
      .find()                      // get all cards
      .sort({ createdAt: -1 })     // newest first
      .populate('user', 'name email'); // join user info

    res.json({ success: true, data: giftCards });
  } catch (err) {
    console.error('Get All Gift Cards Error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};



// DELETE /api/gift-cards
export const deleteAllGiftCards = async (req, res) => {
  try {
    await GiftCard.deleteMany({});
    res.json({ success: true, message: "All gift cards have been deleted." });
  } catch (err) {
    console.error("Delete All Gift Cards Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};







export const getUserAchievements = async (req, res) => {
   const { id } = req.params;
  const userId = id;  
console.log('Route params:', req.params);
console.log('All cards for user:', await GiftCard.find({ user: userId }));
console.log('Sample cards in DB:', (await GiftCard.find().limit(3)).map(c => ({ id: c._id, user: c.user.toString(), status: c.status })));

  try {
    const giftCards = await GiftCard.find({ user: userId, status: 'successful' }).sort({ createdAt: 1 });
    const user = await User.findById(userId);

    const achievements = [];

   if (giftCards.length >= 1) {
      achievements.push({
        id: 1,
        title: 'First Purchase',
        description: 'Made your first gift card purchase',
        icon: '🎉',
        earned: true,
        color: 'black',
      });
    } 

    
    // Big Spender
    const totalSpent = giftCards.reduce((sum, gc) => sum + gc.amount, 0);
    if (totalSpent > 500) {
      achievements.push({
        id: 2,
        title: 'Big Spender',
        description: 'Spent over $500 on gift cards',
        icon: '💰',
        earned: true,
        date: giftCards.find(gc => gc.amount >= 500)?.createdAt || giftCards[0].createdAt,
        color: '#10b981',
      });
    }

    // Streak Master (7 consecutive days)
    const dateSet = new Set(giftCards.map(gc => new Date(gc.createdAt).toDateString()));
    let streak = 1;
    let maxStreak = 1;
    const sortedDates = Array.from(dateSet).map(d => new Date(d)).sort((a, b) => a - b);

    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 3600 * 24);
      if (diff === 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }

    if (maxStreak >= 7) {
      achievements.push({
        id: 3,
        title: 'Streak Master',
        description: 'Made purchases for 7 consecutive days',
        icon: '🔥',
        earned: true,
        color: '#f59e0b',
      });
    }

    // Category Explorer (10 unique types)
    const categorySet = new Set(giftCards.map(gc => gc.type));
    const categoryCount = categorySet.size;

    if (categoryCount >= 10) {
      achievements.push({
        id: 4,
        title: 'Category Explorer',
        description: 'Purchased from 10 different categories',
        icon: '🗺️',
        earned: true,
        color: 'black',
      });
    } else {
      achievements.push({
        id: 4,
        title: 'Category Explorer',
        description: 'Purchased from 10 different categories',
        icon: '🗺️',
        earned: false,
        progress: categoryCount,
        total: 10,
        color: 'black',
      });
    }

    // Loyalty Member (registered over 6 months ago)
    const now = new Date();
    const memberDurationInMonths =
      user && user.createdAt ? (now - new Date(user.createdAt)) / (1000 * 3600 * 24 * 30) : 0;

    if (memberDurationInMonths >= 6) {
      achievements.push({
        id: 5,
        title: 'Loyalty Member',
        description: 'Been a member for over 6 months',
        icon: '👑',
        earned: true,
        date: user.createdAt,
        color: '#f97316',
      });
    }

    // Gift Master (50 gift cards)
    if (giftCards.length >= 50) {
      achievements.push({
        id: 6,
        title: 'Gift Master',
        description: 'Purchased 50 gift cards',
        icon: '🎁',
        earned: true,
        color: '#ec4899',
      });
    } else {
      achievements.push({
        id: 6,
        title: 'Gift Master',
        description: 'Purchased 50 gift cards',
        icon: '🎁',
        earned: false,
        progress: giftCards.length,
        total: 50,
        color: '#ec4899',
      });
    }

    res.json(achievements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load achievements' });
  }
};