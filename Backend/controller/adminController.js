import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Admin from '../model/adminModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Admin Signup
export const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin Signin
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Login successful', token, admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Admin Info
export const updateAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedAdmin) return res.status(404).json({ message: 'Admin not found' });

    res.status(200).json({ message: 'Admin updated successfully', admin: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// 1️⃣ Send reset code to admin email
export const sendAdminResetCode = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    admin.resetCode = resetCode;
    admin.resetCodeExpires = resetCodeExpires;
    await admin.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: 'Admin Password Reset Code',
      html: `
      <div style="font-family: Poppins, sans-serif; text-align:center; padding:30px; background:#f5f6fa;">
        <div style="max-width:600px; margin: auto; background:#fff; padding:30px; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color:#2563EB;">Admin Password Reset</h2>
          <p>Hello ${admin.name},</p>
          <p>Use the code below to reset your password. It expires in 15 minutes.</p>
          <div style="display:inline-block; background:#f0f4ff; color:#2563EB; font-size:28px; font-weight:bold; padding:15px 25px; border-radius:8px; letter-spacing:4px; margin:20px 0;">
            ${resetCode}
          </div>
          <p>If you did not request a password reset, ignore this email.</p>
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Reset code sent to admin email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ Verify code and reset admin password
export const resetAdminPasswordWithCode = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({
      email,
      resetCode: code,
      resetCodeExpires: { $gt: Date.now() },
    });

    if (!admin) return res.status(400).json({ message: 'Invalid or expired code' });

    // Hash new password
    admin.password = await bcrypt.hash(newPassword, 10);

    // Clear code and expiry
    admin.resetCode = undefined;
    admin.resetCodeExpires = undefined;

    await admin.save();

    res.json({ message: 'Admin password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
