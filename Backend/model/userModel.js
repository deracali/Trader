import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  accountNumber: { type: String, trim: true },
  accountName: { type: String, trim: true },
  bankName: { type: String, trim: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
