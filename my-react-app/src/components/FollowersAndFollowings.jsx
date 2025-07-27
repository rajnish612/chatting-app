import { gql, useMutation } from "@apollo/client";
import React from "react";
import { FaUsers, FaUserPlus, FaUserCheck, FaSpinner } from "react-icons/fa";
import { IoPersonAdd, IoCheckmark } from "react-icons/io5";

const tab = ["Followers", "Followings"];
const followUserMutation = gql`
  mutation FollowUser($userId: ID!) {
    follow(userId: $userId) {
      _id
      username
      name
      bio
      followers {
        _id
        username
        name
        bio
      }
      followings {
        _id
        username
        name
        bio
      }
    }
  }
`;
const FollowersAndFollowings = ({ self, setRefreshUsers }) => {
  let [selectedIdx, setSelectedIdx] = React.useState(0);
  let [loading, setLoading] = React.useState("");
  const [followUser, { loading: queryLoading }] = useMutation(
    followUserMutation,
    {
      onCompleted: (data) => {
        setRefreshUsers(true);
        setLoading("");
      },
      onError: (error) => {
        console.error("Follow mutation error:", error);
        alert("Error following user: " + (error.message || "Unknown error"));
        setLoading("");
      },
    }
  );
  async function handleFollow(userId, set) {
    console.log("handleFollow called with userId:", userId);
    console.log("Current self:", self);

    if (!self?._id) {
      alert("You must be logged in to follow users");
      return;
    }

    try {
      console.log("Calling followUser mutation with variables:", { userId });
      const result = await followUser({
        variables: { userId },
      });
      console.log("Follow mutation result:", result);
    } catch (error) {
      console.error("Follow error details:", {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
      });
    }
  }
  return (
    <>
      {/* Inline Styles for Advanced Animations */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

        .gradient-bg {
          background: #ffffff;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .user-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 1);
        }

        .tab-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .tab-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .tab-button:hover::before {
          left: 100%;
        }

        .floating-avatar {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .follow-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .follow-btn:hover {
          transform: scale(1.05);
        }

        .follow-btn:active {
          transform: scale(0.95);
        }

        .pulse-ring {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
          }
        }
      `}</style>

      <div className="gradient-bg min-h-screen flex flex-col items-center justify-start pt-8 px-4 font-[Inter]">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 drop-shadow-lg">
            Your Network
          </h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Connect with friends and discover new people in your community
          </p>
        </div>

        {/* Tab Selector */}
        <div className="glass-card rounded-2xl p-2 mb-8 shadow-2xl">
          <div className="flex bg-transparent rounded-xl overflow-hidden">
            {tab.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`tab-button flex items-center gap-3 px-8 py-4 font-semibold text-lg transition-all duration-300 ${
                  selectedIdx === idx
                    ? "bg-blue-500 text-white shadow-lg rounded-xl transform scale-105"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl"
                }`}
              >
                <FaUsers size={20} />
                {item}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                  selectedIdx === idx ? "bg-white text-blue-500" : "bg-gray-200 text-gray-600"
                }`}>
                  {selectedIdx === 0 ? self?.followers?.length || 0 : self?.followings?.length || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Container */}
        <div className="glass-card rounded-2xl w-full max-w-4xl min-h-96 shadow-2xl">
          <div className="p-6">
            {/* Empty State */}
            {(selectedIdx === 0 && self?.followers?.length === 0) ? (
              <div className="text-center py-16">
                <div className="floating-avatar mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <FaUsers className="text-white text-3xl" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Followers Yet</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Share your profile with friends to start building your network!
                </p>
              </div>
            ) : (selectedIdx === 1 && self?.followings?.length === 0) ? (
              <div className="text-center py-16">
                <div className="floating-avatar mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <FaUserPlus className="text-white text-3xl" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Not Following Anyone</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Discover and follow interesting people to see their updates!
                </p>
              </div>
            ) : (
              /* User List */
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {(selectedIdx === 0 ? self?.followers : self?.followings)?.map((user, index) => {
                  const isFollowing = self?.followings?.some(following => following?._id === user?._id);
                  const isLoading = loading === user?._id;
                  
                  return (
                    <div
                      key={user?._id || index}
                      className="user-card rounded-xl p-6 flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1 shadow-lg">
                            <img
                              src="/images/avatar.png"
                              alt={user?.name || "Avatar"}
                              className="w-full h-full rounded-full object-cover bg-white"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-800 truncate">
                            {user?.name || "Unknown User"}
                          </h3>
                          <p className="text-gray-500 text-sm truncate">
                            @{user?.username || "unknown"}
                          </p>
                          {user?.bio && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      {selectedIdx === 0 && (
                        <button
                          disabled={queryLoading || isLoading}
                          onClick={() => {
                            setLoading(user?._id);
                            handleFollow(user?._id);
                          }}
                          className={`follow-btn flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 min-w-32 justify-center ${
                            isFollowing
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl"
                              : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl pulse-ring"
                          } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                          {isLoading ? (
                            <FaSpinner className="animate-spin" />
                          ) : isFollowing ? (
                            <>
                              <IoCheckmark size={16} />
                              Following
                            </>
                          ) : (
                            <>
                              <IoPersonAdd size={16} />
                              Follow Back
                            </>
                          )}
                        </button>
                      )}

                      {selectedIdx === 1 && (
                        <button
                          disabled={queryLoading || isLoading}
                          onClick={() => {
                            setLoading(user?._id);
                            handleFollow(user?._id);
                          }}
                          className="follow-btn flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-32 justify-center"
                        >
                          {isLoading ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <>
                              <FaUserCheck size={16} />
                              Following
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.3);
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </>
  );
};

export default FollowersAndFollowings;
