import React from "react";
import Chatlist from "./Chatlist";
import Chatbox from "./Chatbox";
import Details from "./Details";

const Chats = ({
  self,
  chats,
  setSelectedUserToChat,
  selectedUserToChat,
  socket,
 setUserMessages,
  userMessages ,
}) => {
  return (
    <div className="h-screen bg-white w-screen flex">
      <Chatlist
        setSelectedUserToChat={setSelectedUserToChat}
        selectedUserToChat={selectedUserToChat}
        self={self}
        chats={chats}
      />
      <Chatbox
        setUserMessages={setUserMessages}
        userMessages={userMessages}
        socket={socket}
        self={self}
        selectedUserToChat={selectedUserToChat}
      />
      <Details />
    </div>
  );
};

export default Chats;
