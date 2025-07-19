import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BLOCKED_USERS, UNBLOCK_USER } from '../../graphql/operations';
import { FaUserSlash, FaSpinner } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

const BlockedUsers = ({ onClose }) => {
  const [unblockingUser, setUnblockingUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToUnblock, setUserToUnblock] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_BLOCKED_USERS);
  const [unblockUser] = useMutation(UNBLOCK_USER);

  const handleUnblockUser = async (user) => {
    setUserToUnblock(user);
    setShowConfirmModal(true);
  };

  const confirmUnblock = async () => {
    if (!userToUnblock) return;

    setUnblockingUser(userToUnblock._id);
    try {
      await unblockUser({
        variables: { userId: userToUnblock._id }
      });
      await refetch();
      setShowConfirmModal(false);
      setUserToUnblock(null);
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user. Please try again.');
    } finally {
      setUnblockingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center p-8">
            <FaSpinner className="animate-spin text-blue-500 text-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Error</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoClose size={20} />
            </button>
          </div>
          <p className="text-red-600 mb-4">Failed to load blocked users.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const blockedUsers = data?.getBlockedUsers || [];

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Blocked Users</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoClose size={20} />
            </button>
          </div>

          {blockedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FaUserSlash className="text-gray-400 text-4xl mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">No blocked users</h4>
              <p className="text-gray-500 text-center">
                Users you block will appear here. You can unblock them anytime.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3">
                {blockedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{user.username}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnblockUser(user)}
                      disabled={unblockingUser === user._id}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {unblockingUser === user._id ? (
                        <>
                          <FaSpinner className="animate-spin" size={14} />
                          Unblocking...
                        </>
                      ) : (
                        'Unblock'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Unblock User</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to unblock <strong>{userToUnblock?.username}</strong>? 
              They will be able to contact you and see your profile again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setUserToUnblock(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnblock}
                disabled={unblockingUser}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              >
                {unblockingUser ? 'Unblocking...' : 'Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlockedUsers;