import { gql, useMutation } from "@apollo/client";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";

import { FaPhoneAlt } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { MdOutlineKeyboardVoice } from "react-icons/md";
const getSelectedUserChatsQuery = gql`
  mutation getMessages($sender: String!, $receiver: String!) {
    getMessages(sender: $sender, receiver: $receiver) {
      sender
      receiver
      content
    }
  }
`;
const Chatbox = ({
  selectedUserToChat,
  socket,
  self,
  setUserMessages,
  userMessages,
}) => {
  const [getSelectedUserChat] = useMutation(getSelectedUserChatsQuery, {
    onCompleted: async (data) => {
      setUserMessages(data.getMessages);
    },
    onErrorasync: (err) => {
      console.log("error is", err);
    },
  });
  let [content, setContent] = useState("");
  console.log("hey", self);

  function handleChange(e) {
    console.log(e.target.value);

    setContent(e.target.value);
  }
  function handleSend() {
    socket.emit("message", {
      sender: self.username,
      receiver: selectedUserToChat,
      content: content,
    });
    setUserMessages((prev) => [
      ...prev,
      { sender: self.username, receiver: selectedUserToChat, content: content },
    ]);
  }
  useEffect(() => {
    async function getSelectedUserChatFnc() {
      if (self.username && selectedUserToChat) {
        await getSelectedUserChat({
          variables: { sender: self.username, receiver: selectedUserToChat },
        });
      }
    }
    getSelectedUserChatFnc();
  }, [self?.username, selectedUserToChat, getSelectedUserChat]);

  if (!selectedUserToChat || userMessages.length === 0) return <h1>Loading</h1>;
  return (
    <div
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
      <div className=" flex-col gap-2 overflow-hidden bg-white  h-fit py-5 rounded-2xl  w-[90%]  flex justify-center items-center  ">
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
  );
};

export default Chatbox;
