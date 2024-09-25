import { Schema, model } from 'mongoose';

// Notification Schema
const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Notification recipient (user reference)
  message: { type: String, required: true },  // Message content
  read: { type: Boolean, default: false },    // Whether the notification has been read
}, { timestamps: true });

const Notification = model('Notification', notificationSchema);
export default Notification;
