import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { MdSearch } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { FaUserPlus, FaUserCheck, FaUsers } from "react-icons/fa";

const randomUsersQuery = gql`
  query {
    getRandomUsers {
      _id
      email
      username
      followings
      followers
    }
  }
`;

const searchUsersQuery = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      _id
      username
      email
      followers
      followings
    }
  }
`;

const Search = ({ setRefreshUsers, self }) => {
  const { data, loading: userLoading } = useQuery(randomUsersQuery, {
    fetchPolicy: "network-only",
  });

  const [searchedUsers, setSearchedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchUsers, { data: searchData, error, loading: searchLoading }] =
    useLazyQuery(searchUsersQuery, {
      onCompleted: async (data) => {
        setSearchedUsers(data.searchUsers);
      },
      fetchPolicy: "network-only",
    });

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (value) => {
    if (value.trim()) {
      searchUsers({ variables: { query: value } });
    }
  };

  async function handleFollow(username, set) {
    setRefreshUsers(true);
    setLoading(true);
    set((prev) => {
      return prev.map((user) => {
        if (user.username === username) {
          return {
            ...user,
            followers: user.followers.includes(self?.username)
              ? user.followers.filter(
                  (followers) => followers !== self?.username
                )
              : [...user.followers, self?.username],
          };
        } else {
          return user;
        }
      });
    });

    try {
      const res = await fetch(
        import.meta.env.VITE_API_URL + "/api/users/follow",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        }
      );
      const data = await res.json();
      setRefreshUsers((prev) => !prev);
      console.log(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      setRefreshUsers(false);
    }
  }

  useEffect(() => {
    setUsers(data?.getRandomUsers);
  }, [data]);

  const getFollowButtonText = (user) => {
    if (loading) return "Loading...";
    if (user.followers.includes(self.username)) return "Following";
    if (
      self.followers.includes(user.username) &&
      !self.followings.includes(user.username)
    ) {
      return "Follow Back";
    }
    return "Follow";
  };

  const getFollowButtonIcon = (user) => {
    if (user.followers.includes(self.username))
      return <FaUserCheck size={14} />;
    if (
      self.followers.includes(user.username) &&
      !self.followings.includes(user.username)
    ) {
      return <FaUsers size={14} />;
    }
    return <FaUserPlus size={14} />;
  };

  const UserCard = ({ user, onFollow, isSearchResult = false }) => (
    <div className="user-card bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
      {/* Avatar */}
      <div className="relative">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">
            {user.username?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-lg truncate">
          {user.username}
        </h3>
        <p className="text-gray-500 text-sm truncate">{user.email}</p>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-gray-400">
            {user.followers?.length || 0} followers
          </span>
          <span className="text-xs text-gray-400">
            {user.followings?.length || 0} following
          </span>
        </div>
      </div>

      {/* Follow Button */}
      <button
        onClick={() =>
          onFollow(user.username, isSearchResult ? setSearchedUsers : setUsers)
        }
        disabled={loading}
        className={`follow-btn px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
          user.followers.includes(self.username)
            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
            : "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {getFollowButtonIcon(user)}
        <span className="text-sm">{getFollowButtonText(user)}</span>
      </button>
    </div>
  );

  if (userLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-700 font-medium">Finding awesome people...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .search-container {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
        }

        .main-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
        }

        .search-box {
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .search-box:focus-within {
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
        }

        .search-results {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .user-card {
          animation: fadeInUp 0.3s ease-out;
        }

        .user-card:nth-child(even) {
          animation-delay: 0.1s;
        }

        .user-card:nth-child(odd) {
          animation-delay: 0.2s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .follow-btn {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .follow-btn:hover:not(:disabled) {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .scroll-area::-webkit-scrollbar {
          width: 6px;
        }

        .scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .scroll-area::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }

        .scroll-area::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>

      <div className="search-container h-screen w-screen flex justify-center items-center p-4">
        <div className="main-card w-full max-w-2xl h-[600px] rounded-3xl p-6 flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Discover People
            </h1>
            <p className="text-gray-600">
              Find and connect with amazing people
            </p>
          </div>

          <div className="relative mb-6">
            <div className="search-box rounded-2xl px-6 py-4 flex items-center gap-4">
              <MdSearch className="text-gray-400 flex-shrink-0" size={24} />
              <input
                type="text"
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  if (value.trim()) {
                    handleSearch(value);
                  } else {
                    setSearchedUsers([]);
                  }
                }}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSearchedUsers([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <IoClose className="text-gray-400" size={20} />
                </button>
              )}
            </div>

            {searchTerm && (
              <div className="search-results absolute top-full left-0 right-0 mt-2 rounded-2xl p-4 max-h-80 overflow-y-auto z-10 shadow-xl">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : searchedUsers && searchedUsers.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500 mb-4">
                      Search Results
                    </p>
                    {searchedUsers.map((user, idx) => (
                      <UserCard
                        key={`search-${idx}`}
                        user={user}
                        onFollow={handleFollow}
                        isSearchResult={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MdSearch className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-600 font-medium">No users found</p>
                    <p className="text-gray-400 text-sm">
                      Try a different search term
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Suggested Users */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Suggested for You
              </h2>
              <span className="text-sm text-gray-500">
                {users?.length || 0} people
              </span>
            </div>

            <div className="scroll-area h-full overflow-y-auto pr-2">
              {users && users.length > 0 ? (
                <div className="space-y-4">
                  {users.map((user, idx) => (
                    <UserCard
                      key={`user-${idx}`}
                      user={user}
                      onFollow={handleFollow}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FaUsers className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No suggestions yet
                  </h3>
                  <p className="text-gray-500">
                    Check back later for new people to follow
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
