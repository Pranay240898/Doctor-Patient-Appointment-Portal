import express from 'express';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to authenticate users
const authenticateUser = (req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Book an appointment (Patients)
router.post('/', authenticateUser, async (req, res) => {
  const { doctorId, date } = req.body;
  if (!doctorId || !date) {
    return res.status(400).json({ message: 'Doctor ID and date are required' });
  }
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ message: 'Only patients can book appointments' });

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({ doctor: doctorId, date });
    if (conflictingAppointment) return res.status(400).json({ message: 'Doctor is unavailable at this time' });

    const appointment = new Appointment({
      patient: req.user.userId,
      doctor: doctorId,
      date,
      status: 'pending',
    });
    await appointment.save();

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve or Reject Appointment (Doctors)
router.put('/:id', authenticateUser, async (req, res) => {
  const { status } = req.body;

  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Only doctors can approve/reject appointments' });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.doctor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    appointment.status = status;
    await appointment.save();

    // Create a notification for the patient
    const message = status === 'approved' ? 'Your appointment has been approved' : 'Your appointment has been rejected';
    const notification = new Notification({ user: appointment.patient, message });
    await notification.save();

    res.status(200).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all appointments for the doctor
router.get('/doctor', authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Only doctors can view appointments' });

    const appointments = await Appointment.find({ doctor: req.user.userId }).populate('patient', 'name email');
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/doctors', authenticateUser, async (req, res) => {
  try {
    console.log('User Role:', req.user.role); // Add this line before querying doctors
    const doctors = await User.find({ role: 'doctor' }); // Adjust based on your User model
    res.status(200).json(doctors);
  } catch (err) {
    console.error('Error fetching doctors:', err); // Log the error
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});



export default router;
