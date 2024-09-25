import { Schema, model } from 'mongoose';

// User Schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor'], required: true }, // 'patient' or 'doctor'
}, { timestamps: true });

const User = model('User', userSchema);
export default User;
