import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';
import GiftCard from "../model/cardRequestModel.js";
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
    console.log("🔐 Received gift card data:", req.body);
    console.log("📦 Uploaded files:", req.files);

    const {
      type,
      amount,
      currency,
      cardNumber,
      ngnAmount,
      exchangeRate,
      userDescription,
      user,
    } = req.body;

    // Validate required fields
    if (!type || !amount || !currency || !cardNumber || !ngnAmount || !exchangeRate || !user) {
      console.warn("⚠️ Missing required fields.");
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Validate image upload
    if (!req.files || !req.files.image) {
      console.warn("⚠️ No image uploaded in request.");
      return res.status(400).json({ message: "Please upload an image of the card." });
    }

    const imageFile = req.files.image;
    console.log("🖼️ Image file metadata:", {
      name: imageFile.name,
      mimetype: imageFile.mimetype,
      size: imageFile.size,
      tempFilePath: imageFile.tempFilePath,
    });

    // Validate image type
    if (!imageFile.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Invalid file type. Please upload an image." });
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImage(imageFile.tempFilePath);

    // Save gift card data to DB
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
      read: false,
      readCount: 0,
    });

    console.log("💾 Gift card saved to DB:", newGiftCard);

    res.status(201).json({
      message: "Gift card sale created successfully.",
      giftCard: newGiftCard,
    });
  } catch (error) {
    console.error("❗ Error in createGiftCard handler:");
    console.error("Message:", error.message);
    if (error.stack) console.error("Stack:", error.stack);
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
