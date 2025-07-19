import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_EMAIL } from '../../graphql/operations';
import { FaEye, FaEyeSlash, FaSpinner, FaEnvelope } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

const ChangeEmail = ({ onClose, currentEmail }) => {
  const [formData, setFormData] = useState({
    password: '',
    newEmail: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const [updateEmail, { loading }] = useMutation(UPDATE_EMAIL);

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

  const validateForm = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      await updateEmail({
        variables: {
          password: formData.password,
          newEmail: formData.newEmail
        }
      });

      setSuccessMessage('Email updated successfully! A confirmation has been sent to your new email.');
      setFormData({
        password: '',
        newEmail: ''
      });

      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error updating email:', error);
      setErrors({
        submit: error.message || 'Failed to update email. Please try again.'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Change Email</h3>
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" size={14} />
                  Updating...
                </>
              ) : (
                'Update Email'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeEmail;