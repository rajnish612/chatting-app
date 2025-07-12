import React, { useState } from "react";
import {
  FaUser,
  FaBell,
  FaLock,
  FaEye,
  FaPalette,
  FaLanguage,
  FaDownload,
  FaTrash,
  FaSignOutAlt,
  FaQuestionCircle,
  FaShieldAlt,
  FaEdit,
  FaCamera,
  FaToggleOn,
  FaToggleOff,
  FaChevronRight,
  FaMoon,
  FaSun,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const Settings = ({ self, onLogout }) => {
  const [activeSection, setActiveSection] = useState("profile");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    messages: true,
    calls: true,
    mentions: true,
    sounds: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    lastSeen: true,
    readReceipts: true,
    typing: true,
  });

  const settingSections = [
    {
      id: "profile",
      title: "Profile",
      icon: <FaUser />,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: <FaBell />,
      color: "from-green-500 to-green-600",
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      icon: <FaLock />,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "appearance",
      title: "Appearance",
      icon: <FaPalette />,
      color: "from-pink-500 to-pink-600",
    },
    {
      id: "data",
      title: "Data & Storage",
      icon: <FaDownload />,
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "help",
      title: "Help & Support",
      icon: <FaQuestionCircle />,
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    action,
    toggle,
    toggleValue,
    onToggle,
    hasArrow = false,
    onClick,
  }) => (
    <div
      className={`setting-item bg-white rounded-xl p-4 flex items-center justify-between border border-gray-100 hover:border-gray-200 transition-all duration-200 ${
        onClick ? "cursor-pointer hover:bg-gray-50" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {toggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(!toggleValue);
            }}
            className="text-2xl transition-colors"
          >
            {toggleValue ? (
              <FaToggleOn className="text-blue-500" />
            ) : (
              <FaToggleOff className="text-gray-300" />
            )}
          </button>
        )}
        {action}
        {hasArrow && <FaChevronRight className="text-gray-400" size={14} />}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {self?.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                    <FaCamera size={12} />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {self?.username || "Username"}
                  </h3>
                  <p className="text-gray-500">
                    {self?.email || "email@example.com"}
                  </p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm text-gray-400">
                      {self?.followers?.length || 0} followers
                    </span>
                    <span className="text-sm text-gray-400">
                      {self?.followings?.length || 0} following
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <SettingItem
              icon={<FaEdit />}
              title="Edit Profile"
              subtitle="Update your name, bio, and other details"
              hasArrow
              onClick={() => openModal("editProfile")}
            />

            <SettingItem
              icon={<FaLock />}
              title="Change Password"
              subtitle="Update your account password"
              hasArrow
              onClick={() => openModal("changePassword")}
            />

            <SettingItem
              icon={<FaUser />}
              title="Change Email"
              subtitle="Update your email address"
              hasArrow
              onClick={() => openModal("changeEmail")}
            />
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-4">
            <SettingItem
              icon={<FaBell />}
              title="Message Notifications"
              subtitle="Get notified about new messages"
              toggle
              toggleValue={notifications.messages}
              onToggle={(value) =>
                setNotifications((prev) => ({ ...prev, messages: value }))
              }
            />

            <SettingItem
              icon={<FaBell />}
              title="Call Notifications"
              subtitle="Get notified about incoming calls"
              toggle
              toggleValue={notifications.calls}
              onToggle={(value) =>
                setNotifications((prev) => ({ ...prev, calls: value }))
              }
            />

            <SettingItem
              icon={<FaBell />}
              title="Mentions"
              subtitle="Get notified when someone mentions you"
              toggle
              toggleValue={notifications.mentions}
              onToggle={(value) =>
                setNotifications((prev) => ({ ...prev, mentions: value }))
              }
            />

            <SettingItem
              icon={notifications.sounds ? <FaVolumeUp /> : <FaVolumeMute />}
              title="Sound Effects"
              subtitle="Play sounds for notifications"
              toggle
              toggleValue={notifications.sounds}
              onToggle={(value) =>
                setNotifications((prev) => ({ ...prev, sounds: value }))
              }
            />
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-4">
            <SettingItem
              icon={<FaEye />}
              title="Profile Visibility"
              subtitle="Who can see your profile information"
              toggle
              toggleValue={privacy.profileVisible}
              onToggle={(value) =>
                setPrivacy((prev) => ({ ...prev, profileVisible: value }))
              }
            />

            <SettingItem
              icon={<FaEye />}
              title="Last Seen"
              subtitle="Show when you were last online"
              toggle
              toggleValue={privacy.lastSeen}
              onToggle={(value) =>
                setPrivacy((prev) => ({ ...prev, lastSeen: value }))
              }
            />

            <SettingItem
              icon={<FaEye />}
              title="Read Receipts"
              subtitle="Show when you've read messages"
              toggle
              toggleValue={privacy.readReceipts}
              onToggle={(value) =>
                setPrivacy((prev) => ({ ...prev, readReceipts: value }))
              }
            />

            <SettingItem
              icon={<FaEye />}
              title="Typing Indicators"
              subtitle="Show when you're typing"
              toggle
              toggleValue={privacy.typing}
              onToggle={(value) =>
                setPrivacy((prev) => ({ ...prev, typing: value }))
              }
            />

            <SettingItem
              icon={<FaShieldAlt />}
              title="Two-Factor Authentication"
              subtitle="Add an extra layer of security"
              hasArrow
              onClick={() => openModal("2fa")}
            />

            <SettingItem
              icon={<FaTrash />}
              title="Delete Account"
              subtitle="Permanently delete your account"
              hasArrow
              onClick={() => openModal("deleteAccount")}
            />
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-4">
            <SettingItem
              icon={darkMode ? <FaMoon /> : <FaSun />}
              title="Dark Mode"
              subtitle="Switch between light and dark themes"
              toggle
              toggleValue={darkMode}
              onToggle={setDarkMode}
            />

            <SettingItem
              icon={<FaPalette />}
              title="Theme Color"
              subtitle="Choose your preferred accent color"
              hasArrow
              onClick={() => openModal("themeColor")}
            />

            <SettingItem
              icon={<FaLanguage />}
              title="Language"
              subtitle="English (US)"
              hasArrow
              onClick={() => openModal("language")}
            />
          </div>
        );

      case "data":
        return (
          <div className="space-y-4">
            <SettingItem
              icon={<FaDownload />}
              title="Download My Data"
              subtitle="Get a copy of your chat history"
              hasArrow
              onClick={() => openModal("downloadData")}
            />

            <SettingItem
              icon={<FaTrash />}
              title="Clear Chat History"
              subtitle="Delete all your conversations"
              hasArrow
              onClick={() => openModal("clearHistory")}
            />

            <SettingItem
              icon={<FaDownload />}
              title="Auto-Download Media"
              subtitle="Automatically download photos and videos"
              toggle
              toggleValue={true}
              onToggle={() => {}}
            />
          </div>
        );

      case "help":
        return (
          <div className="space-y-4">
            <SettingItem
              icon={<FaQuestionCircle />}
              title="Help Center"
              subtitle="Get answers to common questions"
              hasArrow
              onClick={() => openModal("help")}
            />

            <SettingItem
              icon={<FaQuestionCircle />}
              title="Contact Support"
              subtitle="Get help from our support team"
              hasArrow
              onClick={() => openModal("contact")}
            />

            <SettingItem
              icon={<FaQuestionCircle />}
              title="Terms of Service"
              subtitle="Read our terms and conditions"
              hasArrow
              onClick={() => openModal("terms")}
            />

            <SettingItem
              icon={<FaQuestionCircle />}
              title="Privacy Policy"
              subtitle="Learn how we protect your data"
              hasArrow
              onClick={() => openModal("privacy")}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style jsx>{`
        .settings-container {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
        }

        .sidebar-item {
          transition: all 0.2s ease;
        }

        .sidebar-item.active {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .sidebar-item:hover:not(.active) {
          background: #f8fafc;
          transform: translateX(2px);
        }

        .setting-item {
          animation: fadeInUp 0.3s ease-out;
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

        .modal-overlay {
          backdrop-filter: blur(5px);
        }

        .modal-content {
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      <div className="settings-container flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>

          <div className="space-y-2">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`sidebar-item w-full p-4 rounded-xl flex items-center gap-4 text-left ${
                  activeSection === section.id ? "active" : "text-gray-700"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeSection === section.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {section.icon}
                </div>
                <span className="font-medium">{section.title}</span>
              </button>
            ))}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="sidebar-item w-full p-4 rounded-xl flex items-center gap-4 text-left text-red-600 hover:bg-red-50 mt-8"
            >
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                <FaSignOutAlt />
              </div>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {settingSections.find((s) => s.id === activeSection)?.title}
            </h2>
            {renderContent()}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="modal-content bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalType === "editProfile" && "Edit Profile"}
                  {modalType === "changePassword" && "Change Password"}
                  {modalType === "changeEmail" && "Change Email"}
                  {modalType === "2fa" && "Two-Factor Authentication"}
                  {modalType === "deleteAccount" && "Delete Account"}
                  {modalType === "downloadData" && "Download Data"}
                  {modalType === "clearHistory" && "Clear History"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <IoClose size={20} />
                </button>
              </div>

              <div className="text-gray-600 mb-6">
                {modalType === "deleteAccount" && (
                  <p>
                    This action cannot be undone. Your account and all data will
                    be permanently deleted.
                  </p>
                )}
                {modalType === "clearHistory" && (
                  <p>
                    This will permanently delete all your chat conversations.
                    This action cannot be undone.
                  </p>
                )}
                {modalType === "downloadData" && (
                  <p>
                    We'll prepare a download of your data and send it to your
                    email address.
                  </p>
                )}
                {(modalType === "editProfile" ||
                  modalType === "changePassword" ||
                  modalType === "changeEmail") && (
                  <p>
                    Feature coming soon! This functionality will be available in
                    the next update.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                    modalType === "deleteAccount" ||
                    modalType === "clearHistory"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {modalType === "deleteAccount" && "Delete"}
                  {modalType === "clearHistory" && "Clear"}
                  {modalType === "downloadData" && "Download"}
                  {(modalType === "editProfile" ||
                    modalType === "changePassword" ||
                    modalType === "changeEmail" ||
                    modalType === "2fa") &&
                    "Continue"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Settings;
