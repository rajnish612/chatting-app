import React, { useState } from "react";
import { 
  HiPhone, 
  HiVideoCamera, 
  HiMail, 
  HiInformationCircle,
  HiPhotograph,
  HiLink,
  HiDocument,
  HiVolumeUp,
  HiVolumeOff,
  HiBell,
  HiTrash,
  HiUserAdd,
  HiUserRemove
} from "react-icons/hi";

const Details = ({ selectedUserToChat }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isNotificationsOn, setIsNotificationsOn] = useState(true);
  if (!selectedUserToChat) {
    return (
      <div className="w-full h-full bg-gray-50 border-l border-gray-200 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiInformationCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Contact Info</h3>
          <p className="text-gray-500 text-sm">Select a chat to view contact details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Contact Info</h2>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-b border-gray-100 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">
              {selectedUserToChat.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedUserToChat}</h3>
        <p className="text-sm text-gray-500 mb-4">Last seen recently</p>
        
        {/* Quick Actions */}
        <div className="flex justify-center gap-4">
          <button className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-lg">
            <HiPhone className="w-5 h-5" />
          </button>
          <button className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-lg">
            <HiVideoCamera className="w-5 h-5" />
          </button>
          <button className="p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors shadow-lg">
            <HiMail className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">About</h4>
        <p className="text-gray-700">Hey there! I am using WhatsApp.</p>
      </div>

      {/* Media, Links, Docs */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Media, Links and Docs</h4>
        <div className="grid grid-cols-3 gap-4">
          <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <HiPhotograph className="w-6 h-6 text-blue-500 mb-1" />
            <span className="text-xs text-gray-600">Media</span>
            <span className="text-xs text-gray-500">12</span>
          </button>
          <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <HiLink className="w-6 h-6 text-green-500 mb-1" />
            <span className="text-xs text-gray-600">Links</span>
            <span className="text-xs text-gray-500">3</span>
          </button>
          <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <HiDocument className="w-6 h-6 text-purple-500 mb-1" />
            <span className="text-xs text-gray-600">Docs</span>
            <span className="text-xs text-gray-500">5</span>
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="p-6 space-y-4">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Settings</h4>
        
        {/* Mute Notifications */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            {isMuted ? <HiVolumeOff className="w-5 h-5 text-red-500" /> : <HiVolumeUp className="w-5 h-5 text-gray-600" />}
            <span className="text-gray-700">{isMuted ? 'Unmute' : 'Mute'} notifications</span>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors ${isMuted ? 'bg-red-500' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${isMuted ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
          </div>
        </button>

        {/* Notifications */}
        <button 
          onClick={() => setIsNotificationsOn(!isNotificationsOn)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <HiBell className={`w-5 h-5 ${isNotificationsOn ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-gray-700">Notifications</span>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors ${isNotificationsOn ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${isNotificationsOn ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
          </div>
        </button>

        {/* Block User */}
        <button className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-red-600">
          <HiUserRemove className="w-5 h-5" />
          <span>Block {selectedUserToChat}</span>
        </button>

        {/* Delete Chat */}
        <button className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-red-600">
          <HiTrash className="w-5 h-5" />
          <span>Delete chat</span>
        </button>
      </div>
    </div>
  );
};

export default Details;
