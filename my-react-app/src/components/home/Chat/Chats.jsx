import React, { useState, useRef } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import Chatlist from "./Chatlist";
import Chatbox from "./Chatbox";
import Details from "./Details";

const Chats = ({
  self,
  chats,
  setSelectedUserToChat,
  selectedUserToChat,
  socket,
  setShowOutgoingCallModal,
  chatsrefetch,
  setChats,
  setUserMessages,
  onCall,
  destroyPeerConnection,
  userMessages,
  peerConnection,
  setUserOnCall,
  userOnCall,
  showOutgoingCallModal,
}) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwping, setIsSwping] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const containerRef = useRef(null);

  // Minimum swipe distance to trigger navigation
  const minSwipeDistance = 50;

  // Handle touch start
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwping(true);
    setSwipeOffset(0);
  };

  // Handle touch move - provide visual feedback
  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    
    setTouchEnd(currentTouch);
    
    // Handle drawer swipe from left edge
    if (!selectedUserToChat && touchStart < 20 && diff > 0) {
      // Swipe from left edge to open drawer
      const maxSwipe = 280; // Drawer width
      const offset = Math.min(diff, maxSwipe);
      setSwipeOffset(offset);
    } else if (selectedUserToChat && diff > 0) {
      // Swipe back in chatbox (existing functionality)
      const maxSwipe = 100;
      const offset = Math.min(diff, maxSwipe);
      setSwipeOffset(offset);
    } else {
      setSwipeOffset(0);
    }
  };

  // Handle touch end - detect swipe direction
  const handleTouchEnd = () => {
    setIsSwping(false);
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const diff = touchEnd - touchStart;
    const isRightSwipe = distance < -minSwipeDistance;
    const isLeftSwipe = distance > minSwipeDistance;

    // Open drawer: swipe right from left edge
    if (!selectedUserToChat && touchStart < 20 && isRightSwipe) {
      setIsDrawerOpen(true);
    }
    // Close drawer: swipe left when drawer is open
    else if (isDrawerOpen && isLeftSwipe) {
      setIsDrawerOpen(false);
    }
    // Navigate back in chatbox
    else if (isRightSwipe && selectedUserToChat && !isDrawerOpen) {
      setIsDrawerOpen(true); // Show drawer when going back
    }
    
    setSwipeOffset(0);
  };

  // Close drawer when selecting a chat
  const handleChatSelect = (username) => {
    setSelectedUserToChat(username);
    setIsDrawerOpen(false);
  };

  return (
    <div className="h-screen bg-white w-full flex overflow-hidden relative">
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full h-full">
        {/* Chatlist - responsive width */}
        <div className="md:w-64 lg:w-72 xl:w-80 flex-shrink-0">
          <Chatlist
            setSelectedUserToChat={setSelectedUserToChat}
            selectedUserToChat={selectedUserToChat}
            self={self}
            chats={chats}
          />
        </div>
        
        {/* Chatbox - flexible middle section */}
        <div className="flex-1 min-w-0 max-w-none xl:max-w-3xl flex-col flex">
          <Chatbox
            userOnCall={userOnCall}
            setUserOnCall={setUserOnCall}
            peerConnection={peerConnection}
            destroyPeerConnection={destroyPeerConnection}
            showOutgoingCallModal={showOutgoingCallModal}
            onCall={onCall}
            setShowOutgoingCallModal={setShowOutgoingCallModal}
            chatsrefetch={chatsrefetch}
            setChats={setChats}
            setUserMessages={setUserMessages}
            userMessages={userMessages}
            socket={socket}
            self={self}
            selectedUserToChat={selectedUserToChat}
            setSelectedUserToChat={setSelectedUserToChat}
          />
        </div>
        
        {/* Details - desktop only, responsive width */}
        <div className="hidden lg:block lg:w-64 xl:w-72 2xl:w-80 flex-shrink-0">
          <Details selectedUserToChat={selectedUserToChat} />
        </div>
      </div>

      {/* Mobile Layout with Drawer */}
      <div className="block md:hidden w-full h-full relative">
        {/* Mobile Drawer Overlay */}
        {isDrawerOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <div 
          className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-out ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            transform: !isSwping ? undefined : `translateX(${swipeOffset - 320}px)`
          }}
        >
          <Chatlist
            setSelectedUserToChat={handleChatSelect}
            selectedUserToChat={selectedUserToChat}
            self={self}
            chats={chats}
          />
        </div>

        {/* Mobile Main Content */}
        <div 
          className="w-full h-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'pan-x' }}
        >
          {/* Mobile Chatbox with Header */}
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center p-4 bg-white border-b border-gray-200 shadow-sm">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
              >
                <HiMenu className="w-6 h-6 text-gray-600" />
              </button>
              
              {selectedUserToChat ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {selectedUserToChat.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedUserToChat}</h3>
                    <p className="text-sm text-gray-500">Online</p>
                  </div>
                </div>
              ) : (
                <h1 className="text-xl font-bold text-gray-900">WhatsApp</h1>
              )}
            </div>

            {/* Chatbox Content */}
            <div className="flex-1">
              {selectedUserToChat ? (
                <Chatbox
                  userOnCall={userOnCall}
                  setUserOnCall={setUserOnCall}
                  peerConnection={peerConnection}
                  destroyPeerConnection={destroyPeerConnection}
                  showOutgoingCallModal={showOutgoingCallModal}
                  onCall={onCall}
                  setShowOutgoingCallModal={setShowOutgoingCallModal}
                  chatsrefetch={chatsrefetch}
                  setChats={setChats}
                  setUserMessages={setUserMessages}
                  userMessages={userMessages}
                  socket={socket}
                  self={self}
                  selectedUserToChat={selectedUserToChat}
                  setSelectedUserToChat={setSelectedUserToChat}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-64 h-64 mb-8">
                    <svg viewBox="0 0 303 172" className="w-full h-full text-gray-300">
                      <path fill="currentColor" d="M158.8 126.8c2.8 2.8 6.4 4.2 10.2 4.2s7.4-1.4 10.2-4.2l25.4-25.4c5.6-5.6 5.6-14.8 0-20.4s-14.8-5.6-20.4 0l-9.2 9.2V30.4c0-8-6.4-14.4-14.4-14.4s-14.4 6.4-14.4 14.4v59.6l-9.2-9.2c-5.6-5.6-14.8-5.6-20.4 0s-5.6 14.8 0 20.4l25.4 25.4z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-light text-gray-500 mb-4">WhatsApp Web</h2>
                  <p className="text-gray-400 max-w-sm">
                    Send and receive messages without keeping your phone online.
                  </p>
                  <p className="text-gray-400 max-w-sm mt-2">
                    Tap the menu button to see your chats.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chats;
