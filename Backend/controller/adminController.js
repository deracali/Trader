import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import sgMail from "@sendgrid/mail";
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



export const sendAdminResetCode = async (req, res) => {
  const { email } = req.body;
  console.log('📩 Reset code request body:', req.body);

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = Date.now() + 15 * 60 * 1000;

    admin.resetCode = resetCode;
    admin.resetCodeExpires = resetCodeExpires;
    await admin.save();

    // Brevo transporter
    console.log("🔧 Setting up transporter...");
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: "9823d3001@smtp-brevo.com",
        pass: "qtHZhp4gMPTyRUvs",
      },
    });

    const mailOptions = {
      from: "chideracalistus1999@gmail.com",
      to: admin.email,
      subject: 'Admin Password Reset Code',
      text: `Your reset code is ${resetCode}`,
    };

    console.log("📨 Sending mail to:", admin.email);

    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully to", admin.email);

    res.json({ message: 'Reset code sent to admin email' });

  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    res.status(500).json({ message: err.message || "Unknown error" });
  }
};

// 2️⃣ Verify code and reset admin password
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
