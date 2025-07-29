import { gql, useQuery } from "@apollo/client";
import React from "react";
import { HiInformationCircle, HiUsers, HiUserGroup } from "react-icons/hi";
const GET_USER_QUERY = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      _id
      username
      name
      bio
      profilePic {
        url
      }
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
const Details = ({ selectedUserToChat }) => {
  const { data, loading, error } = useQuery(GET_USER_QUERY, {
    variables: { username: selectedUserToChat },
    skip: !selectedUserToChat,
  });
  if (!selectedUserToChat) {
    return (
      <div className="w-full h-full bg-gray-50 border-l border-gray-200 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiInformationCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Contact Info
          </h3>
          <p className="text-gray-500 text-sm">
            Select a chat to view contact details
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading user info...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiInformationCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Error loading user
          </h3>
          <p className="text-gray-500 text-sm">
            Could not load user information
          </p>
        </div>
      </div>
    );
  }

  const user = data?.getUser;

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 border-l border-slate-200 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Profile Info
        </h2>
      </div>

      {/* Profile Section */}
      <div className="p-8 text-center bg-white/70 backdrop-blur-sm border-b border-slate-200/50">
        <div className="relative inline-block mb-6">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/50 transition-transform hover:scale-105">
            {user?.profilePic?.url ? (
              <img className="w-full h-full object-cover rounded-full" src={user?.profilePic?.url} />
            ) : (
              <span className="text-4xl font-bold text-white drop-shadow-sm">
                {(user?.name || user?.username || selectedUserToChat)
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 border-4 border-white rounded-full shadow-lg">
            <div className="w-full h-full rounded-full bg-green-400 animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <h3 className="text-2xl font-bold text-slate-800">
            {user?.name || user?.username || selectedUserToChat}
          </h3>
          <p className="text-sm font-medium text-slate-500 bg-slate-100 rounded-full px-3 py-1 inline-block">
            @{user?.username || selectedUserToChat}
          </p>
          {user?.bio && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
              <p className="text-sm text-slate-700 font-medium italic leading-relaxed">
                "{user.bio}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Followers Section */}
      <div className="p-8 bg-white/60 backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-6">
          {/* Followers */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-100/50 text-center transition-all hover:shadow-xl hover:scale-105">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg">
                <HiUsers className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Followers
              </span>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {user?.followers?.length || 0}
              </div>
            </div>
          </div>

          {/* Following */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-green-100/50 text-center transition-all hover:shadow-xl hover:scale-105">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
                <HiUserGroup className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-green-600 uppercase tracking-wider block">
                Following
              </span>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                {user?.followings?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
