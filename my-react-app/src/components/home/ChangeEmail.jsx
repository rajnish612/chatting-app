import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { SEND_EMAIL_CHANGE_OTP, VERIFY_EMAIL_CHANGE_OTP } from '../../graphql/operations';
import { FaEye, FaEyeSlash, FaSpinner, FaEnvelope, FaShieldAlt } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

const ChangeEmail = ({ onClose, currentEmail }) => {
  const [step, setStep] = useState(1); // 1: Enter email and password, 2: Enter OTP
  const [formData, setFormData] = useState({
    password: '',
    newEmail: '',
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [sendEmailChangeOTP, { loading: sendingOTP }] = useMutation(SEND_EMAIL_CHANGE_OTP);
  const [verifyEmailChangeOTP, { loading: verifying }] = useMutation(VERIFY_EMAIL_CHANGE_OTP);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (!formData.newEmail) {
      newErrors.newEmail = 'New email is required';
    } else {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.newEmail)) {
        newErrors.newEmail = 'Please enter a valid email address';
      }
    }

    if (formData.newEmail === currentEmail) {
      newErrors.newEmail = 'New email must be different from current email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateStep1()) {
      return;
    }

    try {
      const result = await sendEmailChangeOTP({
        variables: {
          password: formData.password,
          newEmail: formData.newEmail
        }
      });

      setSuccessMessage(result.data.sendEmailChangeOTP);
      setStep(2);
      setCountdown(60); // Start 60-second countdown
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrors({
        submit: error.message || 'Failed to send OTP. Please try again.'
      });
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateStep2()) {
      return;
    }

    try {
      const result = await verifyEmailChangeOTP({
        variables: {
          otp: formData.otp
        }
      });

      setSuccessMessage(result.data.verifyEmailChangeOTP);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrors({
        submit: error.message || 'Failed to verify OTP. Please try again.'
      });
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      setErrors({});
      const result = await sendEmailChangeOTP({
        variables: {
          password: formData.password,
          newEmail: formData.newEmail
        }
      });

      setSuccessMessage(result.data.sendEmailChangeOTP);
      setCountdown(60);
    } catch (error) {
      console.error('Error resending OTP:', error);
      setErrors({
        submit: error.message || 'Failed to resend OTP. Please try again.'
      });
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setFormData(prev => ({ ...prev, otp: '' }));
    setErrors({});
    setSuccessMessage('');
    setCountdown(0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {step === 1 ? 'Change Email' : 'Verify New Email'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errors.submit}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            {/* Current Email Display */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Current Email
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 border rounded-lg">
                <FaEnvelope className="text-gray-400" size={16} />
                <span className="text-gray-600">{currentEmail}</span>
              </div>
            </div>

            {/* New Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                New Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FaEnvelope className="text-gray-400" size={16} />
                </div>
                <input
                  type="email"
                  name="newEmail"
                  value={formData.newEmail}
                  onChange={handleInputChange}
                  placeholder="Enter your new email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white placeholder-gray-500 ${
                    errors.newEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.newEmail && (
                <p className="text-red-500 text-sm">{errors.newEmail}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your current password"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white placeholder-gray-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
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
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-blue-500" size={24} />
              </div>
              <p className="text-gray-600">
                We've sent a 6-digit verification code to:
              </p>
              <p className="font-semibold text-gray-900 mt-1">
                {formData.newEmail}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className={`w-full px-4 py-3 border rounded-lg text-center text-lg font-mono tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white placeholder-gray-500 ${
                  errors.otp ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.otp && (
                <p className="text-red-500 text-sm">{errors.otp}</p>
              )}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || sendingOTP}
                className="text-blue-500 hover:text-blue-600 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {countdown > 0 
                  ? `Resend OTP in ${countdown}s` 
                  : sendingOTP 
                    ? 'Sending...' 
                    : 'Resend OTP'
                }
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleBackToStep1}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={verifying}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    Verifying...
                  </>
                ) : (
                  'Verify & Update'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangeEmail;