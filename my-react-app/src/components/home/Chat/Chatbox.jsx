import { gql, useMutation } from "@apollo/client";
import React, { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";

import { FaPhoneAlt } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
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
const Chatbox = ({
  selectedUserToChat,
  socket,
  setChats,
  self,
  setUserMessages,
  userMessages,
}) => {
  const messagesEndRef = React.useRef(null);
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
  useEffect(() => {
    const handleScroll = () => {
      const container = chatContainerRef.current;
      if (!container) return;

      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 50;

      setShowScrollDownArrow(!isAtBottom);
    };

    const chatBox = chatContainerRef.current;
    if (chatBox) {
      chatBox.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatBox) chatBox.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [userMessages]);

  if (!selectedUserToChat) return <h1>Loading</h1>;
  return (
    <div className="relative h-full w-full">
      {/* Scroll-to-bottom Arrow */}
      {showScrollDownArrow && (
        <button className="fixed bottom-24 right-6 z-[1000] p-3 bg-red-500 text-black">
          Show ⬇
        </button>
      )}
      <div
        ref={chatContainerRef}
        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        className="h-full  pb-4 border-t-1 flex flex-col justify-between border-slate-400 bg-slate-100  lg:w-150 relative  items-center  overflow-y-scroll  text-black"
      >
        <div className="!bg-white w-full px-5 gap-7   h-20  !transition-all !border-0 focus:scale-[1.1]     !outline-0 text-black flex justify-start items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            <img
              src="/images/avatar.png"
              className="w-full object-contain h-full"
            />
          </div>
          <span>{selectedUserToChat}</span>
          <FaPhoneAlt color="blue" size={20} style={{ marginLeft: "auto" }} />
          <FaVideo color="blue" size={24} />
        </div>
        <div
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          className=" justify-start h-full w-full  overflow-y-scroll items-center flex flex-col"
        >
          {userMessages?.map((messages, idx) => {
            return messages.sender === self?.username ? (
              <div key={idx} className=" w-full p-5 flex justify-end relative">
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
                  style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                  className="bg-blue-500 p-2 font-medium rounded-tr-3xl rounded-tl-3xl text-xs max-w-70 rounded-br-3xl text-white"
                >
                  {messages.content}
                </span>
              </div>
            );
          })}
        </div>
        <div
          ref={messagesEndRef}
          className=" flex-col gap-2 overflow-hidden bg-white  h-fit py-5 rounded-2xl  w-[90%]  flex justify-center items-center  "
        >
          <textarea
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
    </div>
  );
};

export default Chatbox;
