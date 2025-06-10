import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';



// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';

export const createUser = async (req, res) => {
  const { name, email, password, accountNumber, accountName, bankName } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      accountNumber,
      accountName,
      bankName
    });

    const savedUser = await user.save();

    // Generate JWT
    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
      },
      token
    });
  } catch (err) {
    console.error('Error in createUser:', err); // <--- Console logging the error
    res.status(400).json({ message: err.message });
  }
};




export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountNumber:user.accountNumber,
        accountName:user.accountName,
        bankName:user.bankName,
        createdAt: user.createdAt
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const createdAt = new Date(user.createdAt);
    const diffInMonths = (now - createdAt) / (1000 * 60 * 60 * 24 * 30); // Approx

    let memberLevel = 'Bronze';
    let progressPercent = 0;
    let nextLevel = 'Silver';

    if (diffInMonths >= 6) {
      memberLevel = 'Platinum';
      progressPercent = 100;
      nextLevel = null;
    } else if (diffInMonths >= 3) {
      memberLevel = 'Gold';
      progressPercent = Math.round((diffInMonths / 6) * 100);
      nextLevel = 'Platinum';
    } else if (diffInMonths >= 1) {
      memberLevel = 'Silver';
      progressPercent = Math.round((diffInMonths / 6) * 100);
      nextLevel = 'Gold';
    } else {
      memberLevel = 'Bronze';
      progressPercent = Math.round((diffInMonths / 6) * 100);
      nextLevel = 'Silver';
    }

    res.json({
      ...user.toObject(),
      memberLevel,
      progressPercent,
      nextLevel,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
