import { gql, useMutation } from "@apollo/client";
import React, { useCallback, useMemo } from "react";
import { useEffect } from "react";
import { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { CiUser } from "react-icons/ci";
import { FaPhoneAlt } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
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
      _id
      sender
      receiver
      content
      isSeen
      deletedFor
      deletedForEveryone
    }
  }
`;

const getAudioMessagesQuery = gql`
  mutation getAudioMessages($sender: String!, $receiver: String!) {
    getAudioMessages(sender: $sender, receiver: $receiver) {
      _id
      sender
      receiver
      audioData
      duration
      fileType
      timestamp
      isSeen
      isPlayed
      deletedFor
      deletedForEveryone
    }
  }
`;

const deleteMessageQuery = gql`
  mutation deleteMessage($messageId: ID!, $deleteType: String!) {
    deleteMessage(messageId: $messageId, deleteType: $deleteType)
  }
`;

const deleteAudioMessageQuery = gql`
  mutation deleteAudioMessage($messageId: ID!, $deleteType: String!) {
    deleteAudioMessage(messageId: $messageId, deleteType: $deleteType)
  }
`;

const getAudioDataQuery = gql`
  mutation getAudioData($messageId: ID!) {
    getAudioData(messageId: $messageId) {
      _id
      audioData
      duration
      fileType
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
  selectedUserData,
  setUserMessages,
  setOutGoingVideoCall,
  setShowOutgoingCallModal,
  userMessages,
  localVideoRef,
  onCall,
  peerConnection,
  onDocumentClick,
  setAudioMode,
  unseenDocumentCount = 0,
  unseenAudioCount = 0,
  onMarkAudioMessagesAsSeen,
}) => {
  console.log("setOutGoingVideoCall:", setOutGoingVideoCall);
  const messagesEndRef = React.useRef(null);
  const chatContainerRef = React.useRef(null);
  const [emojiOpen, setEmojiOpen] = React.useState(false);
  const [showScrollDownArrow, setShowScrollDownArrow] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Audio recording states
  const [recording, setRecording] = React.useState(false);
  const [audioMessages, setAudioMessages] = React.useState([]);
  const [isLoadingAudio, setIsLoadingAudio] = React.useState(false);
  const [audioURL, setAudioURL] = React.useState("");
  const [audioLevel, setAudioLevel] = React.useState(0);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [audioBlobRef, setAudioBlobRef] = React.useState(null);
  const [playingAudio, setPlayingAudio] = React.useState(null);
  const [audioCurrentTime, setAudioCurrentTime] = React.useState({});
  const [audioDurations, setAudioDurations] = React.useState({});
  const [isSendingAudio, setIsSendingAudio] = React.useState(false);
  const [loadingAudioData, setLoadingAudioData] = React.useState({});
  const [deleteMessageOptions, setDeleteMessageOptions] = React.useState({
    _id: "",
  });
  // Audio recording refs
  const mediaRecorderRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const audioContextRef = React.useRef(null);
  const analyserRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const timerRef = React.useRef(null);
  const hasMarkedSeenRef = React.useRef(false);
  const audioRef = React.useRef(null);
  const holdTimeout = React.useRef(null);

  const handleMouseDown = (_id) => {
    holdTimeout.current = setTimeout(() => {
      console.log("Mouse held for 500ms");
      alert("Mouse held for 500ms");
      setDeleteMessageOptions((prev) => {
        return {
          ...prev,
          _id: _id,
        };
      });
      // Place your long-press logic here
    }, 500); // Hold duration
  };

  const handleMouseUp = () => {
    clearTimeout(holdTimeout.current); // Cancel if released early
  };

  const handleMouseLeave = () => {
    clearTimeout(holdTimeout.current); // Cancel if moved away
  };
  const [getSelectedUserChat] = useMutation(getSelectedUserChatsQuery, {
    onCompleted: async (data) => {
      console.log("data", data.getMessages);

      setUserMessages(data.getMessages);
    },
    onError: (err) => {
      console.log("error is", err);
    },
  });

  const [getAudioMessages] = useMutation(getAudioMessagesQuery, {
    onCompleted: (data) => {
      console.log(
        "🎵 Audio messages received:",
        data.getAudioMessages?.length || 0,
        data.getAudioMessages
      );
      setAudioMessages(data.getAudioMessages || []);
      setIsLoadingAudio(false);
    },
    onError: (err) => {
      console.error("❌ Error fetching audio messages:", err);
      setIsLoadingAudio(false);
    },
  });

  const [getAudioData] = useMutation(getAudioDataQuery, {
    onCompleted: (data) => {
      if (data.getAudioData) {
        // Update the audio message with the loaded data
        setAudioMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.getAudioData._id
              ? { ...msg, audioData: data.getAudioData.audioData }
              : msg
          )
        );
        // Remove from loading state
        setLoadingAudioData((prev) => {
          const newState = { ...prev };
          delete newState[data.getAudioData._id];
          return newState;
        });
      }
    },
    onError: (err) => {
      console.error("❌ Error fetching audio data:", err);
      // Remove from loading state on error
      setLoadingAudioData((prev) => {
        const newState = { ...prev };
        // Find the messageId from the error context if possible
        Object.keys(newState).forEach((id) => {
          delete newState[id];
        });
        return newState;
      });
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

  // Audio recording functions
  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average =
      dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(Math.min(100, average * 2));

    animationRef.current = requestAnimationFrame(analyzeAudio);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);

      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setAudioBlobRef(audioBlob);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordingTime(0);

      analyzeAudio();

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setRecording(false);
    setAudioLevel(0);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendAudioMessage = async () => {
    if (!audioBlobRef || !selectedUserToChat || isSendingAudio || !socket)
      return;

    try {
      setIsSendingAudio(true);

      const base64Audio = await convertBlobToBase64(audioBlobRef);

      const audioMessage = {
        sender: self.username,
        receiver: selectedUserToChat,
        audioData: base64Audio,
        duration: recordingTime,
        fileType: "audio/webm",
      };

      socket.emit("sendAudioMessage", audioMessage);

      // Add to local state
      setAudioMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          sender: self.username,
          receiver: selectedUserToChat,
          audioData: base64Audio,
          duration: recordingTime,
          fileType: "audio/webm",
          timestamp: new Date().toISOString(),
          isSeen: false,
          isPlayed: false,
        },
      ]);

      setAudioURL("");
      setAudioBlobRef(null);
      setRecordingTime(0);
    } catch (error) {
      console.error("Error sending audio message:", error);
    } finally {
      setIsSendingAudio(false);
    }
  };

  const deleteAudioMessage = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL("");
    setAudioBlobRef(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) {
      return "";
    }

    try {
      // Handle different timestamp formats
      let messageDate;

      if (typeof timestamp === "string" && timestamp.includes("T")) {
        // ISO string format
        messageDate = new Date(timestamp);
      } else if (typeof timestamp === "number") {
        // Unix timestamp as number
        messageDate = new Date(timestamp);
      } else if (typeof timestamp === "string" && /^\d+$/.test(timestamp)) {
        // Unix timestamp as string - convert to number first
        messageDate = new Date(parseInt(timestamp, 10));
      } else if (typeof timestamp === "string") {
        // Try parsing as ISO string or fallback to Date constructor
        messageDate = new Date(timestamp);
      } else {
        // Direct Date object
        messageDate = new Date(timestamp);
      }

      // Check if the date is valid
      if (isNaN(messageDate.getTime())) {
        console.error("❌ Invalid timestamp:", timestamp);
        return "";
      }

      // Always show both date and time
      const dateStr = messageDate.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const timeStr = messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const result = `${dateStr}, ${timeStr}`;

      return result;
    } catch (error) {
      console.error(
        "❌ Error formatting message time:",
        error,
        "timestamp:",
        timestamp
      );
      return "";
    }
  };
  const handleSelfMessageDelete = (_id) => {
    setUserMessages((prev) => {
      const filteredMessage = prev?.map((message) => {
        if (message?._id === _id) {
          return {
            ...message,
            deletedFor: [...message.deletedFor, self?.username],
          };
        } else {
          return {
            ...message,
          };
        }
      });
      return filteredMessage;
    });
  };
  const toggleAudioPlayback = useCallback(
    async (messageId, audioSrc) => {
      const audio = document.getElementById(`audio-${messageId}`);
      if (!audio) return;

      if (playingAudio === messageId) {
        audio.pause();
        setPlayingAudio(null);
      } else {
        // If audio data is not loaded, fetch it first
        if (!audioSrc) {
          try {
            setLoadingAudioData((prev) => ({ ...prev, [messageId]: true }));
            await getAudioData({
              variables: { messageId },
            });
            // Audio data will be updated via onCompleted callback
            // Don't play yet, let user click again after loading
            return;
          } catch (error) {
            console.error("Failed to load audio data:", error);
            setLoadingAudioData((prev) => {
              const newState = { ...prev };
              delete newState[messageId];
              return newState;
            });
            return;
          }
        }

        if (playingAudio) {
          const currentAudio = document.getElementById(`audio-${playingAudio}`);
          if (currentAudio) currentAudio.pause();
        }

        audio.play();
        setPlayingAudio(messageId);
      }
    },
    [playingAudio, getAudioData]
  );

  const handleAudioTimeUpdate = useCallback(
    (messageId, currentTime, duration) => {
      // Throttle updates to prevent excessive re-renders
      setAudioCurrentTime((prev) => {
        const prevTime = prev[messageId] || 0;
        // Only update if the time has changed significantly (more than 0.1 seconds)
        if (Math.abs(currentTime - prevTime) > 0.1) {
          return {
            ...prev,
            [messageId]: currentTime,
          };
        }
        return prev;
      });

      if (duration && isFinite(duration) && duration > 0) {
        setAudioDurations((prev) => {
          if (prev[messageId] !== duration) {
            return {
              ...prev,
              [messageId]: duration,
            };
          }
          return prev;
        });
      }
    },
    []
  );

  const handleAudioEnded = useCallback((messageId) => {
    setPlayingAudio(null);
    setAudioCurrentTime((prev) => ({
      ...prev,
      [messageId]: 0,
    }));
  }, []);

  // Combine and sort all messages by timestamp - memoized to prevent re-renders
  const getAllMessages = useMemo(() => {
    const textMessages =
      userMessages?.map((msg, index) => ({
        ...msg,
        type: "text",
        timestamp:
          msg.timestamp ||
          (msg._id
            ? new Date(
                parseInt(msg._id.substring(0, 8), 16) * 1000
              ).toISOString()
            : new Date(Date.now() + index).toISOString()),
      })) || [];
    console.log("getAllMessages", userMessages);

    const audioMsgs =
      audioMessages?.map((msg) => {
        console.log("🎵 Audio message data:", msg);
        return {
          ...msg,
          type: "audio",
        };
      }) || [];

    return [...textMessages, ...audioMsgs].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [userMessages, audioMessages]);
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
        // Reset states when switching users
        hasMarkedSeenRef.current = false;
        setAudioMessages([]); // Clear previous audio messages
        setIsLoadingAudio(true);

        await getSelectedUserChat({
          variables: { sender: self?.username, receiver: selectedUserToChat },
        });

        // Also fetch audio messages
        console.log(
          "🎵 Fetching audio messages for:",
          self?.username,
          "->",
          selectedUserToChat
        );
        await getAudioMessages({
          variables: { sender: self?.username, receiver: selectedUserToChat },
        });
      }
    }
    getSelectedUserChatFnc();
  }, [
    self?.username,
    selectedUserToChat,
    getSelectedUserChat,
    getAudioMessages,
  ]);

  // Separate useEffect for marking messages as seen to avoid infinite loops
  useEffect(() => {
    if (
      onMarkAudioMessagesAsSeen &&
      unseenAudioCount > 0 &&
      selectedUserToChat &&
      self?.username &&
      !hasMarkedSeenRef.current
    ) {
      onMarkAudioMessagesAsSeen(selectedUserToChat, self?.username);
      hasMarkedSeenRef.current = true;
    }
  }, [
    onMarkAudioMessagesAsSeen,
    unseenAudioCount,
    selectedUserToChat,
    self?.username,
  ]);

  // Debug audioMessages state
  useEffect(() => {
    console.log(
      "🔍 audioMessages state changed:",
      audioMessages.length,
      audioMessages
    );
  }, [audioMessages]);

  // Socket listener for incoming audio messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveAudioMessage = (message) => {
      if (
        message.receiver === self?.username &&
        message.sender === selectedUserToChat
      ) {
        setAudioMessages((prev) => [
          ...prev,
          {
            _id: message._id,
            sender: message.sender,
            receiver: message.receiver,
            audioData: message.audioData,
            duration: message.duration || 0,
            fileType: message.fileType || "audio/webm",
            timestamp: message.timestamp,
            isSeen: message.isSeen || false,
            isPlayed: message.isPlayed || false,
          },
        ]);
      }
    };

    socket.on("receiveAudioMessage", handleReceiveAudioMessage);

    return () => {
      socket.off("receiveAudioMessage", handleReceiveAudioMessage);
    };
  }, [socket, self?.username, selectedUserToChat]);

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

    const handleAudioMessageSeen = ({ receiver }) => {
      setAudioMessages((prev) =>
        prev.map((msg) =>
          msg.sender === self?.username && msg.receiver === receiver
            ? { ...msg, isSeen: true }
            : msg
        )
      );
    };

    socket.on("messageSeen", handleMessageSeen);
    socket.on("audioMessageSeen", handleAudioMessageSeen);

    return () => {
      socket.off("messageSeen", handleMessageSeen);
      socket.off("audioMessageSeen", handleAudioMessageSeen);
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
              className="md:hidden !p-2 !rounded-full hover:!bg-gray-100 !transition-colors"
            >
              <IoArrowBack className="text-gray-600" size={20} />
            </button>

            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                {selectedUserData?.profilePic ? (
                  <img
                    className="w-full h-full object-cover rounded-full "
                    src={selectedUserData?.profilePic}
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {selectedUserToChat?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-black">{selectedUserData?.name}</span>
              <span className="font-light text-gray-500 text-xs">
                @{selectedUserToChat}
              </span>
              <p className="text-sm text-gray-500">{onCall && "On call"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onDocumentClick}
              className="action-btn !p-3 !rounded-full !bg-purple-500 hover:!bg-purple-600 !text-white !shadow-lg !relative"
              title="Share Documents"
            >
              <IoDocumentText size={18} />
              {unseenDocumentCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-white">
                  {unseenDocumentCount > 99 ? "99+" : unseenDocumentCount}
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
              className="action-btn !p-3 !rounded-full !bg-blue-500 hover:!bg-blue-600 !text-white !shadow-lg"
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
              className="action-btn !p-3 !rounded-full !bg-green-500 hover:!bg-green-600 !text-white !shadow-lg"
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
              className="scroll-down-btn !absolute !bottom-6 !right-6 !z-10 !w-12 !h-12 !bg-blue-500 hover:!bg-blue-600 !text-white !rounded-full !shadow-lg !flex !items-center !justify-center !transition-all !duration-300"
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
            {/* Loading indicator for initial audio loading */}
            {isLoadingAudio && audioMessages.length === 0 && (
              <div className="flex justify-center items-center py-4">
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-sm">Loading audio messages...</span>
                </div>
              </div>
            )}

            {getAllMessages?.map((message, idx) => {
              const isOwn = message.sender === self?.username;
              // Create a stable key for each message
              const messageKey =
                message._id ||
                `${message.type}-${idx}-${message.content || message.duration}`;
              const isDeleted =
                message?.deletedForEveryone ||
                message?.deletedFor?.includes(self?.username);
              return (
                <div
                  key={messageKey}
                  ref={
                    idx === getAllMessages.length - 1 ||
                    idx === getAllMessages.length - 2
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
                      {isOwn ? (
                        self?.profilePic?.url ? (
                          <img
                            className="object-cover w-full h-full rounded-full"
                            src={self?.profilePic?.url}
                          />
                        ) : (
                          <span className="text-white font-semibold text-xs">
                            {self?.username?.charAt(0)?.toUpperCase()}
                          </span>
                        )
                      ) : selectedUserData?.profilePic ? (
                        <img
                          className="object-cover w-full h-full rounded-full"
                          src={selectedUserData?.profilePic}
                        />
                      ) : (
                        <span className="text-white font-semibold text-xs">
                          {" "}
                          {selectedUserToChat?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Message Bubble */}

                    <div className="relative">
                      {deleteMessageOptions._id === message?._id &&
                        !isDeleted && (
                          <div
                            className={`!text-gray-700 !rounded-xl !shadow-lg 
  !border !border-gray-200 !flex !flex-col !p-3 !bg-white 
  !absolute ${
    isOwn ? "!right-0  " : "!left-0 "
  } !z-10 !bottom-full !mb-2 !min-w-48`}
                          >
                            {isOwn && (
                              <button
                                className={`!flex !items-center ${
                                  isOwn ? "!justify-end" : "!justify-start"
                                } !bg-transparent !text-nowrap !gap-2 !w-full 
  !p-2 !rounded-lg hover:!bg-gray-50 !transition-colors 
  !text-sm !font-medium`}
                              >
                                <CiUser size={16} className="!text-blue-500" />
                                <span>Delete For Everyone</span>
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleSelfMessageDelete(message?._id)
                              }
                              className={`!flex ${
                                isOwn ? "!justify-end" : "!justify-start"
                              } !items-center !justify-end !bg-transparent !text-nowrap !gap-2 !w-full        
  !p-2 !rounded-lg hover:!bg-gray-50 !transition-colors
  !text-sm !font-medium`}
                            >
                              <MdDeleteOutline
                                size={16}
                                className="!text-red-500"
                              />
                              <span>Delete For Me</span>
                            </button>
                          </div>
                        )}
                      <div
                        onMouseDown={() => handleMouseDown(message?._id)}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        className={`message-bubble relative px-4 active:scale-[1.1] py-3 cursor-pointer rounded-2xl shadow-sm ${
                          isOwn
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                            : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                        }`}
                      >
                        {message.type === "text" ? (
                          // Text Message
                          <p
                            className="text-sm font-medium leading-relaxed"
                            style={{
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {isDeleted
                              ? "This message was deleted"
                              : message.content}
                          </p>
                        ) : (
                          // Audio Message
                          <div className="flex items-center space-x-3 py-2">
                            {/* Play/Pause Button */}
                            <button
                              onClick={() =>
                                toggleAudioPlayback(
                                  message._id,
                                  message.audioData
                                )
                              }
                              disabled={!message.audioData}
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                isOwn
                                  ? "bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400"
                                  : "bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400"
                              } ${
                                !message.audioData ? "cursor-not-allowed" : ""
                              }`}
                            >
                              {!message.audioData ||
                              loadingAudioData[message._id] ? (
                                // Loading spinner
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : playingAudio === message._id ? (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4 text-white ml-0.5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              )}
                            </button>

                            {/* Waveform/Progress Bar */}
                            <div className="flex-1 space-y-1">
                              {!message.audioData ||
                              loadingAudioData[message._id] ? (
                                // Loading state for waveform
                                <div className="flex items-center space-x-1">
                                  {[...Array(15)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-1 h-3 rounded-full animate-pulse ${
                                        isOwn ? "bg-blue-300" : "bg-gray-400"
                                      }`}
                                      style={{
                                        animationDelay: `${i * 50}ms`,
                                      }}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  {[...Array(15)].map((_, i) => {
                                    // Generate consistent height based on message ID and index
                                    const seedHeight =
                                      (((message._id?.charCodeAt(
                                        i % message._id.length
                                      ) || 0) +
                                        i) %
                                        12) +
                                      6;
                                    return (
                                      <div
                                        key={i}
                                        className={`w-1 rounded-full transition-all duration-200 ${
                                          isOwn ? "bg-blue-200" : "bg-gray-300"
                                        }`}
                                        style={{
                                          height: `${seedHeight}px`,
                                          opacity:
                                            (audioCurrentTime[message._id] ||
                                              0) /
                                              (audioDurations[message._id] ||
                                                message.duration ||
                                                1) >
                                            i / 15
                                              ? 1
                                              : 0.4,
                                        }}
                                      />
                                    );
                                  })}
                                </div>
                              )}

                              {/* Time Display */}
                              <div className="flex justify-between text-xs opacity-75">
                                <span>
                                  {!message.audioData ||
                                  loadingAudioData[message._id]
                                    ? "..."
                                    : formatTime(
                                        audioCurrentTime[message._id] || 0
                                      )}
                                </span>
                                <span>
                                  {!message.audioData ||
                                  loadingAudioData[message._id]
                                    ? "Loading..."
                                    : formatTime(
                                        audioDurations[message._id] ||
                                          message.duration ||
                                          0
                                      )}
                                </span>
                              </div>
                            </div>

                            {/* Hidden Audio Element */}
                            <audio
                              id={`audio-${message._id}`}
                              src={message.audioData}
                              onTimeUpdate={(e) =>
                                handleAudioTimeUpdate(
                                  message._id,
                                  e.target.currentTime,
                                  e.target.duration
                                )
                              }
                              onEnded={() => handleAudioEnded(message._id)}
                              preload="metadata"
                              className="hidden"
                            />
                          </div>
                        )}

                        {/* Message Status - Show for everyone, but with different styling */}
                        <div
                          className={`flex items-center mt-1 gap-1 ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-xs opacity-60">
                            {formatMessageTime(message.timestamp)}
                          </span>
                          {isOwn && (
                            <>
                              {message.isSeen ? (
                                <BsCheckAll
                                  className="text-blue-200"
                                  size={14}
                                />
                              ) : (
                                <BsCheck className="text-blue-200" size={14} />
                              )}
                            </>
                          )}
                        </div>
                      </div>
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

        {/* Recording Indicator */}
        {recording && (
          <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium">Recording...</span>
                <span className="text-red-500 font-mono">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full transition-all duration-150"
                    style={{
                      height: `${Math.max(
                        4,
                        (audioLevel / 100) * 20 + Math.random() * 6
                      )}px`,
                      opacity: audioLevel > 10 ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audio Preview */}
        {audioURL && !recording && (
          <div className="mx-4 mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    const audio = audioRef.current;
                    if (audio.paused) {
                      audio.play();
                    } else {
                      audio.pause();
                    }
                  }}
                  className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white"
                >
                  <svg
                    className="w-4 h-4 ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <span className="text-blue-600 font-medium">
                  Voice message ready
                </span>
                <span className="text-blue-500 text-sm">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={deleteAudioMessage}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={sendAudioMessage}
                  disabled={isSendingAudio}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center space-x-1"
                >
                  {isSendingAudio ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send</span>
                  )}
                </button>
              </div>
            </div>
            <audio ref={audioRef} src={audioURL} className="hidden" />
          </div>
        )}

        {/* Enhanced Input Container */}
        <div className="input-container p-4 m-4 rounded-2xl">
          <div className="flex items-end gap-3">
            {/* Emoji Button */}
            <div className="relative">
              <button
                onClick={() => setEmojiOpen((prev) => !prev)}
                className="action-btn !p-2 !text-blue-500 hover:!bg-blue-50 !rounded-full !transition-colors"
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
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`action-btn !p-2 !rounded-full !transition-colors ${
                recording
                  ? "!bg-red-500 hover:!bg-red-600 !text-white !animate-pulse"
                  : "!text-blue-500 hover:!bg-blue-50"
              }`}
            >
              <MdOutlineKeyboardVoice size={24} />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!content.trim() || !self?.username}
              className={`action-btn !p-3 !rounded-full !shadow-lg !transition-all !duration-200 ${
                content.trim() && self?.username
                  ? "!bg-blue-500 hover:!bg-blue-600 !text-white"
                  : "!bg-gray-300 !text-gray-500 !cursor-not-allowed"
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
