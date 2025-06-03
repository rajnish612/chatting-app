import React from "react";
import Chatlist from "./Chatlist";
import Chatbox from "./Chatbox";
import Details from "./Details";

const Chats = () => {
  return (
    <div className="h-screen bg-white w-screen flex">
      <Chatlist />
      <Chatbox />
      <Details/>
    </div>
  );
};

export default Chats;
