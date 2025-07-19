import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_PASSWORD } from '../../graphql/operations';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import ForgotPassword from './ForgotPassword';

const ChangePassword = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [updatePassword, { loading }] = useMutation(UPDATE_PASSWORD);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
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

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
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
      await updatePassword({
        variables: {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }
      });

      setSuccessMessage('Password updated successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error updating password:', error);
      setErrors({
        submit: error.message || 'Failed to update password. Please try again.'
      });
    }
  };

  const PasswordField = ({ name, label, value, placeholder, show, onToggle, showForgotLink }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {show ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
        </button>
      </div>
      {errors[name] && (
        <p className="text-red-500 text-sm">{errors[name]}</p>
      )}
      {showForgotLink && (
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          Forgot your current password?
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
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
          <PasswordField
            name="currentPassword"
            label="Current Password"
            value={formData.currentPassword}
            placeholder="Enter your current password"
            show={showPasswords.current}
            onToggle={() => togglePasswordVisibility('current')}
            showForgotLink={true}
          />

          <PasswordField
            name="newPassword"
            label="New Password"
            value={formData.newPassword}
            placeholder="Enter your new password"
            show={showPasswords.new}
            onToggle={() => togglePasswordVisibility('new')}
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm New Password"
            value={formData.confirmPassword}
            placeholder="Confirm your new password"
            show={showPasswords.confirm}
            onToggle={() => togglePasswordVisibility('confirm')}
          />

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
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default ChangePassword;