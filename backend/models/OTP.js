import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true 
  },
  otp: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['password_reset', 'email_change', 'password_change', 'registration'], 
    required: true 
  },
  newEmail: {
    type: String,
    required: false // Only required for email_change type
  },
  userId: {
    type: String,
    required: false // Only required for email_change type
  },
  registrationData: {
    username: String,
    password: String,
    name: String,
    bio: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 600 // Expires after 10 minutes
  }
});

// Index for faster queries
OTPSchema.index({ email: 1, type: 1 });

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;