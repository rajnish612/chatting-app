import { from, gql, useMutation } from "@apollo/client";
import React, { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";

import { FaPhoneAlt } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { useLayoutEffect } from "react";
import { MdOutlineKeyboardVoice } from "react-icons/md";
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
  socket,
  setChats,
  self,
  setUserMessages,
  userMessages,
}) => {
  const messagesEndRef = React.useRef(null);
  const peerConnection = React.useRef(null);
  const chatContainerRef = React.useRef(null);
  const [showScrollDownArrow, setShowScrollDownArrow] = useState(false);
  const [getSelectedUserChat] = useMutation(getSelectedUserChatsQuery, {
    onCompleted: async (data) => {
      setUserMessages(data.getMessages);
    },
    onError: (err) => {
      console.log("error is", err);
    },
  });
  const [seeMessage] = useMutation(isSeenQuery, {
    onCompleted: async (data) => {
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

  function handleChange(e) {
    setContent(e.target.value);
  }
  function handleSend() {
    if (!content.trim()) return;
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
      variables: { sender: selectedUserToChat, receiver: self.username },
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
  }, [userMessages]);
  async function handleCall() {
    try {
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
    const handleAnswer = async ({ from, answer }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    };

    socket.on("answer-call", handleAnswer);

    return () => {
      socket.off("answer-call", handleAnswer);
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
          msg.sender === self.username && msg.receiver === receiver
            ? { ...msg, isSeen: true }
            : msg
        )
      );
    };

    socket.on("messageSeen", handleMessageSeen);

    return () => {
      socket.off("messageSeen", handleMessageSeen);
    };
  }, [socket, self.username, setUserMessages]);
  useLayoutEffect(() => {
    if (!showScrollDownArrow) {
      scrollToBottom();
    }
  }, [userMessages]);

  if (!selectedUserToChat) return <h1>Loading</h1>;
  return (
    <div
      style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      // overflow-y-scroll
      className="h-full  pb-4 border-t-1 flex flex-col justify-between border-slate-400 bg-slate-100  lg:w-150 relative  items-center    text-black"
    >
      <div className="!bg-white w-full px-5 gap-7   h-20  !transition-all !border-0 focus:scale-[1.1]     !outline-0 text-black flex justify-start items-center">
        <div className="w-20 h-20 rounded-full overflow-hidden">
          <img
            src="/images/avatar.png"
            className="w-full object-contain h-full"
          />
        </div>
        <span>{selectedUserToChat}</span>
        <FaPhoneAlt
          onClick={handleCall}
          color="blue"
          size={20}
          style={{ marginLeft: "auto" }}
        />
        <FaVideo color="blue" size={24} />
      </div>
      {showScrollDownArrow && (
        <button
          className="!bg-red-400 !w-20 absolute bottom-37 right-7 z-10"
          onClick={scrollToBottom}
        >
          Hey
        </button>
      )}
      <div
        ref={chatContainerRef}
        onScroll={() => {
          const container = chatContainerRef.current;
          const isAtBottom =
            container.scrollHeight - container.scrollTop <=
            container.clientHeight + 10;

          console.log("At Bottom:", isAtBottom); // ✅ Check this
          setShowScrollDownArrow(!isAtBottom);
        }}
        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        className=" justify-start h-full w-full  overflow-y-scroll items-center flex flex-col"
      >
        {userMessages?.map((messages, idx) => {
          return messages.sender === self?.username ? (
            <div
              ref={
                idx === userMessages.length - 1 || userMessages.length - 2
                  ? messagesEndRef
                  : null
              }
              key={idx}
              className=" w-full p-5 flex justify-end relative"
            >
              <span
                style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                className="bg-red-600 font-medium p-2 rounded-tl-3xl rounded-tr-3xl text-xs max-w-70 rounded-bl-3xl text-white"
              >
                {messages.content}
                {!messages.isSeen && "not seen"}
              </span>
              <img
                src="/images/avatar.png"
                className="w-10 h-10 object-contain  "
              />
            </div>
          ) : (
            <div className=" w-full p-5 flex justify-start items-end relative">
              <img
                src="/images/avatar.png"
                className="w-10 h-10 object-contain  "
              />
              <span
                ref={
                  idx === userMessages.length - 1 || userMessages.length - 2
                    ? messagesEndRef
                    : null
                }
                style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                className="bg-blue-500 p-2 font-medium rounded-tr-3xl rounded-tl-3xl text-xs max-w-70 rounded-br-3xl text-white"
              >
                {messages.content}
              </span>
            </div>
          );
        })}
      </div>

      <div className=" flex-col gap-2 overflow-hidden bg-white  h-fit py-5 rounded-2xl  w-[90%]  flex justify-center items-center  ">
        <textarea
          value={content}
          onChange={handleChange}
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            resize: "none",
          }}
          className="w-full text-gray-400 outline-0 h-20 px-2"
          placeholder="enter your message"
        />{" "}
        <div className="flex justify-start items-end px-5  gap-2  w-full">
          <MdOutlineEmojiEmotions size={25} style={{ color: "blue" }} />
          <MdOutlineKeyboardVoice size={25} style={{ color: "blue" }} />
          <IoIosSend
            onClick={() => handleSend()}
            size={25}
            style={{ color: "blue", marginLeft: "auto" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
