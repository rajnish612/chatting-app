import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SEND_PASSWORD_RESET_OTP, RESET_PASSWORD_WITH_OTP } from '../../graphql/operations';
import { FaEye, FaEyeSlash, FaSpinner, FaEnvelope, FaKey, FaCheckCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

const ForgotPassword = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: email, 2: otp + password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [timer, setTimer] = useState(0);

  const [sendOTP, { loading: sendingOTP }] = useMutation(SEND_PASSWORD_RESET_OTP);
  const [resetPassword, { loading: resettingPassword }] = useMutation(RESET_PASSWORD_WITH_OTP);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateEmailStep = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetStep = () => {
    const newErrors = {};

    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateEmailStep()) {
      return;
    }

    try {
      await sendOTP({
        variables: {
          email: formData.email
        }
      });

      setSuccessMessage('OTP sent successfully! Check your email.');
      setStep(2);
      setTimer(600); // 10 minutes countdown
      
      // Start countdown timer
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrors({
        submit: error.message || 'Failed to send OTP. Please try again.'
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateResetStep()) {
      return;
    }

    try {
      await resetPassword({
        variables: {
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        }
      });

      setSuccessMessage('Password reset successfully! You can now login with your new password.');
      
      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error resetting password:', error);
      setErrors({
        submit: error.message || 'Failed to reset password. Please try again.'
      });
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendOTP({
        variables: {
          email: formData.email
        }
      });
      setSuccessMessage('New OTP sent to your email!');
      setTimer(600);
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to resend OTP.'
      });
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
            <FaCheckCircle size={16} />
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errors.submit}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <p className="text-gray-600 text-sm mb-4">
              Enter your email address and we'll send you an OTP to reset your password.
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FaEnvelope className="text-gray-400" size={16} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingOTP}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingOTP ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-gray-600 text-sm mb-4">
              Enter the OTP sent to <strong>{formData.email}</strong> and create a new password.
            </p>

            {timer > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-center">
                OTP expires in: <strong>{formatTime(timer)}</strong>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FaKey className="text-gray-400" size={16} />
                </div>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center font-mono text-lg ${
                    errors.otp ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.otp && (
                <p className="text-red-500 text-sm">{errors.otp}</p>
              )}
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Didn't receive OTP? Resend
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm">{errors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={resettingPassword}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resettingPassword ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;