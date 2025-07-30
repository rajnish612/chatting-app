import React, { useState, useRef, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { IoDocumentText, IoChatbubbleEllipses } from "react-icons/io5";
import Chatlist from "./Chatlist";
import Chatbox from "./Chatbox";
import DocumentBox from "./DocumentBox";
import Details from "./Details";

const Chats = ({
  self,
  chats,
  setCallType,
  setSelectedUserData,
  selectedUserData,
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
  setOutGoingVideoCall,
  peerConnection,
  setUserOnCall,
  localVideoRef,
  userOnCall,
  showOutgoingCallModal,
}) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwping, setIsSwping] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDocumentMode, setIsDocumentMode] = useState(false);
  const [unseenDocumentCounts, setUnseenDocumentCounts] = useState({});
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

  // Fetch unseen document counts
  const fetchUnseenDocumentCounts = async () => {
    if (!self?.username) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/documents/unseen-counts/${self.username}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const counts = await response.json();
        setUnseenDocumentCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching unseen document counts:", error);
    }
  };


  // Mark documents as seen when entering document mode
  const markDocumentsAsSeen = async (sender, receiver) => {
    try {
      await fetch(
        `http://localhost:3000/api/documents/seen/conversation/${sender}/${receiver}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      // Update local counts - clear unseen count for this sender
      setUnseenDocumentCounts((prev) => ({
        ...prev,
        [sender]: 0,
      }));

      // Refresh the counts from server to ensure consistency
      fetchUnseenDocumentCounts();

      // Emit socket event to notify sender that receiver has seen the documents
      socket.emit("documentSeenByReceiver", { sender, receiver });
    } catch (error) {
      console.error("Error marking documents as seen:", error);
    }
  };


  // Fetch initial unseen document counts
  useEffect(() => {
    fetchUnseenDocumentCounts();
  }, [self?.username]);

  // Socket listeners for document events
  useEffect(() => {
    const handleReceiveDocument = ({ sender, receiver, document }) => {
      if (receiver === self?.username) {
        setUnseenDocumentCounts((prev) => ({
          ...prev,
          [sender]: (prev[sender] || 0) + 1,
        }));
      }
    };

    const handleDocumentSeen = ({ receiver }) => {
      setUnseenDocumentCounts((prev) => ({
        ...prev,
        [receiver]: 0,
      }));
    };


    socket.on("receiveDocument", handleReceiveDocument);
    socket.on("documentSeen", handleDocumentSeen);

    return () => {
      socket.off("receiveDocument", handleReceiveDocument);
      socket.off("documentSeen", handleDocumentSeen);
    };
  }, [socket, self?.username]);

  // Handle document mode switch
  const handleDocumentModeToggle = () => {
    if (!isDocumentMode && selectedUserToChat) {
      // Mark documents as seen when entering document mode
      markDocumentsAsSeen(selectedUserToChat, self?.username);
    }
    setIsDocumentMode(true);
  };

  return (
    <div className="h-screen bg-white w-full flex overflow-hidden relative">
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full h-full">
        {/* Chatlist - responsive width */}
        <div className="md:w-64 lg:w-72 xl:w-80 flex-shrink-0">
          <Chatlist
            setSelectedUserData={setSelectedUserData}
            selectedUserData={selectedUserData}
            setSelectedUserToChat={setSelectedUserToChat}
            selectedUserToChat={selectedUserToChat}
            self={self}
            chats={chats}
            unseenDocumentCounts={unseenDocumentCounts}
          />
        </div>

        {/* Chatbox - flexible middle section */}
        <div className="flex-1 min-w-0 max-w-none xl:max-w-3xl flex-col flex">
          {/* Content Area */}
          {isDocumentMode ? (
            <DocumentBox
              selectedUserToChat={selectedUserToChat}
              setSelectedUserToChat={setSelectedUserToChat}
              socket={socket}
              self={self}
              onBack={() => setIsDocumentMode(false)}
            />
          ) : (
            <Chatbox
              selectedUserData={selectedUserData}
              userOnCall={userOnCall}
              localVideoRef={localVideoRef}
              setCallType={setCallType}
              setUserOnCall={setUserOnCall}
              peerConnection={peerConnection}
              destroyPeerConnection={destroyPeerConnection}
              showOutgoingCallModal={showOutgoingCallModal}
              onCall={onCall}
              setShowOutgoingCallModal={setShowOutgoingCallModal}
              chatsrefetch={chatsrefetch}
              setChats={setChats}
              setUserMessages={setUserMessages}
              setOutGoingVideoCall={setOutGoingVideoCall}
              userMessages={userMessages}
              socket={socket}
              self={self}
              selectedUserToChat={selectedUserToChat}
              setSelectedUserToChat={setSelectedUserToChat}
              onDocumentClick={handleDocumentModeToggle}
              unseenDocumentCount={
                unseenDocumentCounts[selectedUserToChat] || 0
              }
            />
          )}
        </div>

        {/* Details - desktop only, responsive width */}
        <div className="hidden lg:block lg:w-64 xl:w-72 2xl:w-80 flex-shrink-0">
          <Details self={self} selectedUserToChat={selectedUserToChat} />
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
            isDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            transform: !isSwping
              ? undefined
              : `translateX(${swipeOffset - 320}px)`,
          }}
        >
          <Chatlist
            setSelectedUserData={setSelectedUserData}
            selectedUserData={selectedUserData}
            setSelectedUserToChat={handleChatSelect}
            selectedUserToChat={selectedUserToChat}
            self={self}
            chats={chats}
            unseenDocumentCounts={unseenDocumentCounts}
          />
        </div>

        {/* Mobile Main Content */}
        <div
          className="w-full h-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-x" }}
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

              {selectedUserToChat && selectedUserData?.name ? (
                <div className="flex items-center justify-between flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {selectedUserToChat.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedUserToChat}
                      </h3>
                      <p className="text-sm text-gray-500">Online</p>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDocumentModeToggle}
                      className="p-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg transition-all relative"
                      title="Share Documents"
                    >
                      <IoDocumentText size={16} />
                      {unseenDocumentCounts[selectedUserToChat] > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold border border-white">
                          {unseenDocumentCounts[selectedUserToChat] > 9
                            ? "9+"
                            : unseenDocumentCounts[selectedUserToChat]}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <h1 className="text-xl font-bold text-gray-900">WhatsApp</h1>
              )}
            </div>

            {/* Chatbox Content */}
            <div className="flex-1">
              {selectedUserToChat && selectedUserData?.name ? (
                isDocumentMode ? (
                  <DocumentBox
                    selectedUserToChat={selectedUserToChat}
                    setSelectedUserToChat={setSelectedUserToChat}
                    socket={socket}
                    self={self}
                    onBack={() => setIsDocumentMode(false)}
                  />
                ) : (
                  <Chatbox
                  userOnCall={userOnCall}
                  selectedUserData={selectedUserData}
                  localVideoRef={localVideoRef}
                  setCallType={setCallType}
                  setUserOnCall={setUserOnCall}
                  peerConnection={peerConnection}
                  destroyPeerConnection={destroyPeerConnection}
                  showOutgoingCallModal={showOutgoingCallModal}
                  onCall={onCall}
                  setShowOutgoingCallModal={setShowOutgoingCallModal}
                  chatsrefetch={chatsrefetch}
                  setChats={setChats}
                  setUserMessages={setUserMessages}
                  setOutGoingVideoCall={setOutGoingVideoCall}
                  userMessages={userMessages}
                  socket={socket}
                  self={self}
                  selectedUserToChat={selectedUserToChat}
                  setSelectedUserToChat={setSelectedUserToChat}
                  onDocumentClick={handleDocumentModeToggle}
                  unseenDocumentCount={
                    unseenDocumentCounts[selectedUserToChat] || 0
                  }
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-64 h-64 mb-8">
                    <svg
                      viewBox="0 0 303 172"
                      className="w-full h-full text-gray-300"
                    >
                      <path
                        fill="currentColor"
                        d="M158.8 126.8c2.8 2.8 6.4 4.2 10.2 4.2s7.4-1.4 10.2-4.2l25.4-25.4c5.6-5.6 5.6-14.8 0-20.4s-14.8-5.6-20.4 0l-9.2 9.2V30.4c0-8-6.4-14.4-14.4-14.4s-14.4 6.4-14.4 14.4v59.6l-9.2-9.2c-5.6-5.6-14.8-5.6-20.4 0s-5.6 14.8 0 20.4l25.4 25.4z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-light text-gray-500 mb-4">
                    WhatsApp Web
                  </h2>
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
