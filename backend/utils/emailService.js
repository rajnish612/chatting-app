import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Chat Me',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">Chat Me</h1>
            <p style="color: #6b7280; margin: 5px 0;">Secure Communication Platform</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 10px; padding: 30px; text-align: center;">
            <h2 style="color: #374151; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #6b7280; margin-bottom: 30px;">
              You requested to reset your password. Use the OTP below to continue:
            </p>
            
            <div style="background: #ffffff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h1 style="color: #3b82f6; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            
            <p style="color: #ef4444; font-size: 14px; margin-top: 20px;">
              <strong>This OTP will expire in 10 minutes.</strong>
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">
              This is an automated message from Chat Me. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send email update confirmation
export const sendEmailUpdateConfirmation = async (oldEmail, newEmail) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newEmail,
      subject: 'Email Updated Successfully - Chat Me',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">Chat Me</h1>
            <p style="color: #6b7280; margin: 5px 0;">Secure Communication Platform</p>
          </div>
          
          <div style="background: #f0f9ff; border-radius: 10px; padding: 30px;">
            <h2 style="color: #374151; margin-bottom: 20px;">Email Updated Successfully</h2>
            <p style="color: #6b7280; margin-bottom: 15px;">
              Your email address has been successfully updated from:
            </p>
            <p style="color: #6b7280; margin-bottom: 15px;">
              <strong>Old Email:</strong> ${oldEmail}
            </p>
            <p style="color: #6b7280; margin-bottom: 20px;">
              <strong>New Email:</strong> ${newEmail}
            </p>
            <p style="color: #059669; font-weight: 500;">
              ✓ You can now use this email address to log in to your account.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">
              If you didn't make this change, please contact support immediately.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email update confirmation sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email update confirmation:', error);
    // Don't throw error for confirmation email failure
    return false;
  }
};