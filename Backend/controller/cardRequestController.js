import { v2 as cloudinary } from "cloudinary";
import GiftCard from "../model/cardRequestModel.js";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload image
const uploadImage = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "gift_cards",
  });
  return result.secure_url; // Return the image URL
};

// @desc    Create a new gift card sale
// @route   POST /api/giftcards
// @access  Public (or protected, as you wish!)
export const createGiftCard = async (req, res) => {
  try {
    const { type, amount, currency, cardNumber, ngnAmount, exchangeRate, userDescription, user } =
      req.body;

    if (!type || !amount || !currency || !cardNumber || !ngnAmount || !exchangeRate || !user) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Check if file was uploaded
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Please upload an image of the card." });
    }

    const imageFile = req.files.image;

    // Upload to Cloudinary
    const imageUrl = await uploadImage(imageFile.tempFilePath);

    // Create new GiftCard document
    const newGiftCard = await GiftCard.create({
      type,
      amount,
      currency,
      cardNumber,
      imageUrl,
      ngnAmount,
      exchangeRate,
      user,
      userDescription,
      status: "pending",
      read: false,      // explicitly set read to false
      readCount: 0,     // explicitly set readCount to 0
    });

    res.status(201).json({ message: "Gift card sale created successfully.", giftCard: newGiftCard });
  } catch (error) {
    console.error(error);
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
    const giftCards = await GiftCard.find().populate("user", "name email");
    res.json({ success: true, data: giftCards });
  } catch (err) {
    console.error("Get All Gift Cards Error:", err);
    res.status(500).json({ error: "Server error" });
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
