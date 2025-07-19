import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { DEACTIVATE_ACCOUNT } from '../../graphql/operations';
import { FaExclamationTriangle, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

const DeactivateAccount = ({ onClose, onLogout }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: warning, 2: password confirmation

  const [deactivateAccount, { loading }] = useMutation(DEACTIVATE_ACCOUNT);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({
        ...prev,
        password: ''
      }));
    }
  };

  const handleContinue = () => {
    setStep(2);
  };

  const handleDeactivate = async (e) => {
    e.preventDefault();

    if (!password) {
      setErrors({ password: 'Password is required to deactivate account' });
      return;
    }

    try {
      await deactivateAccount({
        variables: { password }
      });

      // Account deactivated successfully, logout user
      alert('Your account has been deactivated successfully.');
      onLogout();
      onClose();

    } catch (error) {
      console.error('Error deactivating account:', error);
      setErrors({
        submit: error.message || 'Failed to deactivate account. Please try again.'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-red-600">Deactivate Account</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800">Warning: This action cannot be undone</h4>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-gray-900">What happens when you deactivate your account:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  Your account will be permanently deleted
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  All your messages and chat history will be removed
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  You will be removed from all contacts' friend lists
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  All blocked users will be unblocked automatically
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  This action cannot be reversed
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Alternative:</strong> You can temporarily stop using the app instead of 
                permanently deleting your account. Your data will remain safe.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleDeactivate}>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                To confirm account deactivation, please enter your password:
              </p>

              {errors.submit && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {errors.submit}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
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
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 text-center">
                <strong>Final Warning:</strong> This will permanently delete your account and all data.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    Deactivating...
                  </>
                ) : (
                  'Deactivate Account'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DeactivateAccount;