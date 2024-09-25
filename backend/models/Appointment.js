import { Schema, model } from 'mongoose';

// Appointment Schema
const appointmentSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Patient's reference
  doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Doctor's reference
  date: { type: Date, required: true },  // Appointment date
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },  // Status of the appointment
}, { timestamps: true });

const Appointment = model('Appointment', appointmentSchema);
export default Appointment;
