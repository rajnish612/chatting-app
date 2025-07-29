import React, { useState } from "react";
import { CiSearch } from "react-icons/ci";

const Chatlist = ({
  self,
  setSelectedUserToChat,
  chats,
  setSelectedUserData,
  selectedUserToChat,
  unseenDocumentCounts = {},
  unseenAudioCounts = {},
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMs = now - messageTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return messageTime.toLocaleDateString();
  };

  const followingsWithUnseen =
    self?.followings?.map((following) => {
      // Handle both object and string formats
      const username =
        typeof following === "object" ? following.username : following;
      const chat = chats.find((chat) => chat.username === username);
      return {
        username,
        unseenCount: chat ? chat.unseenCount : 0,
        profilePic: {
          url: chat?.profilePic?.url,
        },
        name: chat?.name,
      };
    }) || [];

  // Filter chats based on search term
  const filteredChats = (chats || []).filter((chat) =>
    chat?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log("chats", chats);

  const filteredFollowings = followingsWithUnseen.filter((chat) =>
    chat?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style jsx>{`
        .chat-sidebar {
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
        }

        .chat-item {
          transition: all 0.2s ease;
          border-radius: 12px;
          margin: 2px 4px;
        }

        .chat-item:hover {
          background: #f8fafc;
          transform: translateX(2px);
        }

        .chat-item.active {
          background: #3b82f6;
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .chat-item.active .username {
          color: white;
        }

        .chat-item.active .message {
          color: rgba(255, 255, 255, 0.8);
        }

        .chat-item.active .time {
          color: rgba(255, 255, 255, 0.7);
        }

        .search-box {
          background: #f1f5f9;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .search-box:focus-within {
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .scroll-area::-webkit-scrollbar {
          width: 4px;
        }

        .scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .scroll-area::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }

        .scroll-area::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      <div className="chat-sidebar flex flex-col h-screen w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
            Chats
          </h1>

          {/* Search */}
          <div className="search-box rounded-xl px-3 md:px-4 py-2 md:py-3 flex items-center gap-3">
            <CiSearch className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search conversations"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="scroll-area flex-1 overflow-y-auto py-2 pr-2">
          {/* Following Section */}
          {filteredFollowings && filteredFollowings.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 mb-2">
                Following
              </p>
              {filteredFollowings.map((chat, index) => (
                <button
                  key={`following-${index}`}
                  onClick={() => {
                    setSelectedUserToChat(chat?.username);
                    setSelectedUserData({
                      name: chat?.name,
                      profilePic: chat?.profilePic?.url,
                    });
                  }}
                  className={`chat-item !w-full !p-3 md:!p-4 !flex !items-center !text-left ${
                    selectedUserToChat === chat.username ? "active" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative mr-3">
                    <img
                      src={
                        chat?.profilePic?.url
                          ? chat?.profilePic?.url
                          : "/images/avatar.png"
                      }
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-start flex-col justify-between">
                      <span>{chat?.name}</span>
                      <span className="username font-light text-gray-400 truncate pr-2">
                        @{chat.username}
                      </span>
                      <span className="time text-xs text-gray-500 flex-shrink-0">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <p className="message text-sm text-gray-600 truncate mt-1">
                      {chat.lastMessage || "Say hello..."}
                    </p>
                  </div>

                  {/* Unread badges */}
                  <div className="flex items-center gap-1 ml-2">
                    {chat.unseenCount > 0 && (
                      <div
                        className="bg-blue-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center flex-shrink-0"
                        title="Unread messages"
                      >
                        {chat.unseenCount}
                      </div>
                    )}
                    {unseenDocumentCounts[chat.username] > 0 && (
                      <div
                        className="bg-purple-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center flex-shrink-0"
                        title="Unread documents"
                      >
                        {unseenDocumentCounts[chat.username]}
                      </div>
                    )}
                    {unseenAudioCounts[chat.username] > 0 && (
                      <div
                        className="bg-green-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center flex-shrink-0"
                        title="Unread audio messages"
                      >
                        🎵
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Chats */}
          {filteredChats.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 mb-2">
                Messages
              </p>
              {filteredChats.map((chat, index) => (
                <button
                  key={`chat-${index}`}
                  onClick={() => {
                    setSelectedUserToChat(chat.username);
                    setSelectedUserData({
                      name: chat?.name,
                      profilePic: chat?.profilePic?.url,
                    });
                  }}
                  className={`chat-item !w-full !p-3 md:!p-4 !flex !items-center !text-left ${
                    selectedUserToChat === chat.username ? "active" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative mr-3">
                    <img
                      src={
                        chat?.profilePic?.url
                          ? chat?.profilePic?.url
                          : "/images/avatar.png"
                      }
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-start flex-col justify-between">
                      <span>{chat?.name}</span>
                      <span className="username font-light text-gray-400 truncate pr-2">
                        @{chat.username}
                      </span>
                      <span className="time text-xs text-gray-500 flex-shrink-0">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    {/* <div className="flex items-center justify-between">
                      <h3 className="username font-semibold text-gray-900 truncate pr-2">
                        {chat.username}
                      </h3>
                      <span className="time text-xs text-gray-500 flex-shrink-0">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div> */}
                    <p className="message text-sm text-gray-600 truncate mt-1">
                      {chat.lastMessage || "Start a conversation..."}
                    </p>
                  </div>

                  {/* Unread badges */}
                  <div className="flex items-center gap-1 ml-2">
                    {chat.unseenCount > 0 && (
                      <div
                        className="bg-blue-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center flex-shrink-0"
                        title="Unread messages"
                      >
                        {chat.unseenCount}
                      </div>
                    )}
                    {unseenDocumentCounts[chat.username] > 0 && (
                      <div
                        className="bg-purple-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center flex-shrink-0"
                        title="Unread documents"
                      >
                        {unseenDocumentCounts[chat.username]}
                      </div>
                    )}
                    {unseenAudioCounts[chat.username] > 0 && (
                      <div
                        className="bg-green-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center flex-shrink-0"
                        title="Unread audio messages"
                      >
                        🎵
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredChats.length === 0 &&
            (!filteredFollowings || filteredFollowings.length === 0) && (
              <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <CiSearch className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "No results found" : "No conversations"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {searchTerm
                    ? "Try a different search term"
                    : "Start chatting with someone"}
                </p>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default Chatlist;
