import React, { useState, useRef } from "react";
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
    
    // Only allow swipe back (right swipe) when in chatbox
    if (selectedUserToChat && diff > 0) {
      // Limit the swipe to a reasonable distance
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
    setSwipeOffset(0);
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -minSwipeDistance;

    // Right swipe: go back to chatlist from chatbox
    if (isRightSwipe && selectedUserToChat) {
      setSelectedUserToChat("");
    }
  };

  return (
    <div className="h-screen bg-white w-full flex overflow-hidden">
      {/* Chatlist - responsive width */}
      <div className="hidden md:block md:w-64 lg:w-72 xl:w-80 flex-shrink-0">
        <Chatlist
          setSelectedUserToChat={setSelectedUserToChat}
          selectedUserToChat={selectedUserToChat}
          self={self}
          chats={chats}
        />
      </div>
      
      {/* Mobile: Show only chatlist when no chat selected */}
      <div 
        className="block md:hidden w-full relative"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          touchAction: 'pan-x',
          transform: selectedUserToChat ? `translateX(${swipeOffset}px)` : 'translateX(0)',
          transition: isSwping ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Swipe indicator - show when swiping back */}
        {selectedUserToChat && swipeOffset > 20 && (
          <div 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-blue-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2"
            style={{ opacity: Math.min(swipeOffset / 60, 1) }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </div>
        )}

        {!selectedUserToChat ? (
          <Chatlist
            setSelectedUserToChat={setSelectedUserToChat}
            selectedUserToChat={selectedUserToChat}
            self={self}
            chats={chats}
          />
        ) : (
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
        )}
      </div>
      
      {/* Chatbox - desktop only, flexible middle section */}
      <div className="hidden md:flex flex-1 min-w-0 max-w-none xl:max-w-3xl flex-col">
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
  );
};

export default Chats;
