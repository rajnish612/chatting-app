import { gql, useMutation } from "@apollo/client";
import React, { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import EmojiPicker from "emoji-picker-react";

import { FaPhoneAlt } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { useLayoutEffect } from "react";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import { IoArrowDown } from "react-icons/io5";
import { BsCheckAll, BsCheck } from "react-icons/bs";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { IoDocumentText } from "react-icons/io5";

const isSeenQuery = gql`
  mutation SeeMessages($sender: String!, $receiver: String!) {
    SeeMessages(sender: $sender, receiver: $receiver) {
      sender
      receiver
      content
    }
  }
`;

const getSelectedUserChatsQuery = gql`
  mutation getMessages($sender: String!, $receiver: String!) {
    getMessages(sender: $sender, receiver: $receiver) {
      sender
      receiver
      content
      isSeen
    }
  }
`;

const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const Chatbox = ({
  selectedUserToChat,
  setSelectedUserToChat,
  socket,
  setUserOnCall,
  setCallType,
  setChats,
  self,
  setUserMessages,
  setOutGoingVideoCall,
  setShowOutgoingCallModal,
  userMessages,
  localVideoRef,
  onCall,
  peerConnection,
  onDocumentClick,
  unseenDocumentCount = 0,
}) => {
  console.log("setOutGoingVideoCall:", setOutGoingVideoCall);
  const messagesEndRef = React.useRef(null);
  const chatContainerRef = React.useRef(null);
  const [emojiOpen, setEmojiOpen] = React.useState(false);
  const [showScrollDownArrow, setShowScrollDownArrow] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [getSelectedUserChat] = useMutation(getSelectedUserChatsQuery, {
    onCompleted: async (data) => {
      setUserMessages(data.getMessages);
    },
    onError: (err) => {
      console.log("error is", err);
    },
  });

  const [seeMessage] = useMutation(isSeenQuery, {
    onCompleted: async () => {
      setChats((prev) => {
        return prev.map((user) => {
          if (user.username === selectedUserToChat) {
            return { ...user, unseenCount: 0 };
          } else {
            return { ...user };
          }
        });
      });
    },
    onError: async (err) => {
      console.log(err);
    },
  });

  let [content, setContent] = useState("");
  const navigate = useNavigate();
  function handleChange(e) {
    setContent(e.target.value);
    // Simulate typing indicator
    setIsTyping(e.target.value.length > 0);
  }

  function handleSend() {
    if (!content.trim()) return;

    // Validate that we have the required data
    if (!self?.username || !selectedUserToChat) {
      console.error("Cannot send message: missing sender or receiver", {
        sender: self?.username,
        receiver: selectedUserToChat,
      });
      alert("Error: Unable to send message. Please try refreshing the page.");
      return;
    }

    socket.emit("message", {
      sender: self.username,
      receiver: selectedUserToChat,
      content: content,
    });
    setChats((prev) => {
      const exists = prev.some((chat) => chat.username === selectedUserToChat);
      if (!exists) {
        return [...prev, { username: selectedUserToChat, unseenCount: 0 }];
      } else {
        return prev;
      }
    });
    setUserMessages((prev) => [
      ...prev,
      { sender: self.username, receiver: selectedUserToChat, content: content },
    ]);

    setContent("");
    setIsTyping(false);
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function getSelectedUserChatFnc() {
      if (self?.username && selectedUserToChat) {
        await getSelectedUserChat({
          variables: { sender: self?.username, receiver: selectedUserToChat },
        });
      }
    }
    getSelectedUserChatFnc();
  }, [self?.username, selectedUserToChat, getSelectedUserChat]);

  const isSeenFnc = useCallback(async () => {
    await seeMessage({
      variables: { sender: selectedUserToChat, receiver: self?.username },
    });
  }, [self?.username, selectedUserToChat, seeMessage]);

  useEffect(() => {
    isSeenFnc();
  }, [isSeenFnc, userMessages]);

  useEffect(() => {
    socket.emit("messageSeenByReceiver", {
      receiver: self?.username,
      sender: selectedUserToChat,
    });
  }, [userMessages, socket, self?.username, selectedUserToChat]);

  async function handleAudioCall() {
    setCallType("audio");
    setUserOnCall(selectedUserToChat);
    try {
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      peerConnection.current = new RTCPeerConnection(config);
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: selectedUserToChat,
            from: self?.username,
            candidate: event.candidate,
          });
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("call-user", {
        to: selectedUserToChat,
        from: self?.username,
        offer: offer,
        type: "audio", // Add call type
      });
    } catch (err) {
      alert(err.message);
    }
  }
  async function handleVideoCall() {
    setOutGoingVideoCall(true);
    setCallType("video");

    setUserOnCall(selectedUserToChat);
    try {
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      peerConnection.current = new RTCPeerConnection(config);
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: selectedUserToChat,
            from: self?.username,
            candidate: event.candidate,
          });
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("call-user", {
        to: selectedUserToChat,
        from: self?.username,
        offer: offer,
        type: "video", // Add call type
      });
    } catch (err) {
      alert(err.message);
    }
  }
  useEffect(() => {
    const handleNewICECandidate = ({ candidate }) => {
      if (candidate && peerConnection.current) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    socket.on("ice-candidate", handleNewICECandidate);
    return () => {
      socket.off("ice-candidate", handleNewICECandidate);
    };
  }, [socket]);

  useEffect(() => {
    const handleRemoteICE = async ({ candidate }) => {
      if (candidate && peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (err) {
          console.error("Failed to add ICE candidate", err);
        }
      }
    };

    socket.on("ice-candidate", handleRemoteICE);

    return () => {
      socket.off("ice-candidate", handleRemoteICE);
    };
  }, [socket]);

  useEffect(() => {
    const handleMessageSeen = ({ receiver }) => {
      setUserMessages((prev) =>
        prev.map((msg) =>
          msg.sender === self?.username && msg.receiver === receiver
            ? { ...msg, isSeen: true }
            : msg
        )
      );
    };

    socket.on("messageSeen", handleMessageSeen);

    return () => {
      socket.off("messageSeen", handleMessageSeen);
    };
  }, [socket, self?.username, setUserMessages]);

  useLayoutEffect(() => {
    if (!showScrollDownArrow) {
      scrollToBottom();
    }
  }, [userMessages]);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedUserToChat) {
    return (
      <div className="h-full flex items-center min-w-150 justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-600">Choose someone to start chatting with</p>
          {!self && (
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ User data not loaded. Please refresh if issues persist.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Inline Styles for Advanced Animations */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

        .chat-container {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          font-family: "Inter", sans-serif;
        }

        .glass-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .message-bubble {
          animation: messageSlideIn 0.3s ease-out;
          transition: all 0.2s ease;
        }

        .message-bubble:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scroll-down-btn {
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .typing-indicator {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .input-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.05);
        }

        .chat-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }

        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        .action-btn {
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .action-btn:active {
          transform: scale(0.95);
        }
      `}</style>

      <div className="chat-container h-full w-full flex flex-col relative">
        {/* Enhanced Header */}
        <div className="hidden md:flex glass-header px-4 md:px-6 py-3 md:py-4 items-center justify-between shadow-sm">
          <div
            onClick={() =>
              navigate(`/user/${selectedUserToChat}`, { state: { self: self } })
            }
            className="flex  hover:scale-[1.1] cursor-pointer transition-transform items-center gap-4"
          >
            {/* Mobile back button - only show on mobile */}
            <button
              onClick={() => setSelectedUserToChat("")}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <IoArrowBack className="text-gray-600" size={20} />
            </button>

            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {selectedUserToChat?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {selectedUserToChat}
              </h3>
              <p className="text-sm text-gray-500">
                {onCall ? "On call" : "Online"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onDocumentClick}
              className="action-btn p-3 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg relative"
              title="Share Documents"
            >
              <IoDocumentText size={18} />
              {unseenDocumentCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-white">
                  {unseenDocumentCount > 99 ? '99+' : unseenDocumentCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (peerConnection.current) {
                  alert("You are already on a call");
                  return;
                }
                setShowOutgoingCallModal(true);
                handleAudioCall();
              }}
              className="action-btn p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
            >
              <FaPhoneAlt size={16} />
            </button>
            <button
              onClick={() => {
                if (peerConnection.current) {
                  alert("You are already on a call");
                  return;
                }

                handleVideoCall(); // Use video call function
              }}
              className="action-btn p-3 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg"
            >
              <FaVideo size={18} />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 relative overflow-hidden">
          {/* Scroll Down Button */}
          {showScrollDownArrow && (
            <button
              className="scroll-down-btn absolute bottom-6 right-6 z-10 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
              onClick={scrollToBottom}
            >
              <IoArrowDown size={20} />
            </button>
          )}

          <div
            ref={chatContainerRef}
            onScroll={() => {
              const container = chatContainerRef.current;
              const isAtBottom =
                container.scrollHeight - container.scrollTop <=
                container.clientHeight + 10;
              setShowScrollDownArrow(!isAtBottom);
            }}
            className="chat-scroll h-full overflow-y-auto px-4 py-6 space-y-4"
          >
            {userMessages?.map((message, idx) => {
              const isOwn = message.sender === self?.username;

              return (
                <div
                  key={idx}
                  ref={
                    idx === userMessages.length - 1 ||
                    idx === userMessages.length - 2
                      ? messagesEndRef
                      : null
                  }
                  className={`flex ${
                    isOwn ? "justify-end" : "justify-start"
                  } mb-3`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-xs lg:max-w-md ${
                      isOwn ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-xs">
                        {(isOwn ? self?.username : selectedUserToChat)
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`message-bubble px-4 py-3 rounded-2xl shadow-sm ${
                        isOwn
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                          : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                      }`}
                    >
                      <p
                        className="text-sm font-medium leading-relaxed"
                        style={{
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {message.content}
                      </p>

                      {/* Message Status */}
                      {isOwn && (
                        <div className="flex items-center justify-end mt-1 gap-1">
                          <span className="text-xs opacity-75">
                            {new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {message.isSeen ? (
                            <BsCheckAll className="text-blue-200" size={14} />
                          ) : (
                            <BsCheck className="text-blue-200" size={14} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {selectedUserToChat?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="typing-indicator bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Input Container */}
        <div className="input-container p-4 m-4 rounded-2xl">
          <div className="flex items-end gap-3">
            {/* Emoji Button */}
            <div className="relative">
              <button
                onClick={() => setEmojiOpen((prev) => !prev)}
                className="action-btn p-2 text-blue-500  hover:bg-blue-50 rounded-full transition-colors"
              >
                <MdOutlineEmojiEmotions size={24} />
              </button>
              <div className="absolute bottom-full left-0">
                {" "}
                <EmojiPicker
                  onEmojiClick={(emoji) =>
                    setContent((prev) => (prev += emoji.emoji))
                  }
                  open={emojiOpen}
                />
              </div>
            </div>

            {/* Text Input */}
            <div className="flex-1 min-h-0">
              <textarea
                onFocus={() => setEmojiOpen(false)}
                value={content}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-500"
                rows="1"
                style={{
                  minHeight: "44px",
                  maxHeight: "120px",
                  resize: "none",
                  overflow: "hidden",
                }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
            </div>

            {/* Voice Message Button */}
            <button className="action-btn p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
              <MdOutlineKeyboardVoice size={24} />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!content.trim() || !self?.username}
              className={`action-btn p-3 rounded-full shadow-lg transition-all duration-200 ${
                content.trim() && self?.username
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <IoIosSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbox;
