import { gql, useQuery } from "@apollo/client";
import { errorCodes } from "@apollo/client/invariantErrorCodes";
import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const USER_QUERY = gql`
  query GetUser($username: String!) {
    getUser(username: $username) {
      _id
      username
      name
      profilePic {
        url
      }
      bio
      followers {
        _id
      }
      followings {
        _id
      }
    }
  }
`;
const User = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { self } = location?.state;
  const { username } = useParams();
  const { data, error, loading } = useQuery(USER_QUERY, {
    variables: { username: username },
  });
  useEffect(() => {
    if (!self?._id) {
      navigate("/login", { replace: true });
    }
  }, [self?._id, navigate]);
  console.log(data);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center w-screen items-center p-4">
      <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-300"></div>
            </div>
            <p className="mt-6 text-slate-600 font-medium">
              Loading profile...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="white"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              User Not Found
            </h2>
            <p className="text-slate-500">
              The profile you're looking for doesn't exist.
            </p>
          </div>
        ) : (
          <div className="p-8">
            {/* Avatar Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full p-1 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-full p-2">
                    <img
                      className="w-full h-full object-cover rounded-full"
                      src={
                        data?.getUser?.profilePic?.url
                          ? data?.getUser?.profilePic?.url
                          : "/images/avatar.png"
                      }
                      alt="Profile"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg">
                  <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-8 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="white"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-700 bg-clip-text text-transparent">
                  {data?.getUser?.name}
                </h1>
              </div>

              <p className="text-slate-500 font-medium bg-slate-100 rounded-full px-4 py-2 inline-block">
                @{data?.getUser?.username}
              </p>

              {data?.getUser?.bio && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100/50 mt-4">
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {data?.getUser?.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-100/50 text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-1">
                  {data?.getUser?.followers?.length || 0}
                </div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Followers
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-green-100/50 text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-1">
                  {data?.getUser?.followings?.length || 0}
                </div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                  Following
                </p>
              </div>
            </div>

            {/* Follow Button */}
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl">
              {(self?._id !== data?.getUser?._id &&
                self?.followings?.some(
                  (following) => following?._id === data?.getUser?._id
                ) &&
                data?.getUser?.followings?.some(
                  (following) => following?._id === self?._id
                )) ||
              (self?.followings?.some(
                (following) => following?._id === data?.getUser?._id
              ) &&
                !data?.getUser?.followings?.some(
                  (following) => following?._id === self?._id
                )) ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Following
                </span>
              ) : !self?.followings?.some(
                  (following) => following?._id === data?.getUser?._id
                ) &&
                data?.getUser?.followings?.some(
                  (following) => following?._id === self?._id
                ) ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Follow Back
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Follow
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default User;
