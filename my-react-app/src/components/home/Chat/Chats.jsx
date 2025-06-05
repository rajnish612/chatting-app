import React from "react";
import Chatlist from "./Chatlist";
import Chatbox from "./Chatbox";
import Details from "./Details";

const Chats = ({self}) => {
  return (
    <div className="h-screen bg-white w-screen flex">
      <Chatlist self={self} />
      <Chatbox />
      <Details/>
    </div>
  );
};

export default Chats;
