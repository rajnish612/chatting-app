import React from "react";

import { FaPhoneAlt } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { MdOutlineKeyboardVoice } from "react-icons/md";
const Chatbox = () => {
  return (
    <div
      style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      className="h-full  border-t-1 flex flex-col justify-between border-slate-400 bg-slate-100  lg:w-150 relative  items-center  overflow-y-scroll  text-black"
    >
      <div className="!bg-white w-full px-5 gap-7   h-20  !transition-all !border-0 focus:scale-[1.1]     !outline-0 text-black flex justify-start items-center">
        <div className="w-20 h-20 rounded-full overflow-hidden">
          <img
            src="/images/avatar.png"
            className="w-full object-contain h-full"
          />
        </div>
        <span>Name</span>
        <FaPhoneAlt color="blue" size={20} style={{ marginLeft: "auto" }} />
        <FaVideo color="blue" size={24} />
      </div>
      <div style={{msOverflowStyle:"none",scrollbarWidth:"none"}} className=" justify-start h-full w-full  overflow-y-scroll items-center flex flex-col">
        <div className=" w-full p-5 flex justify-end relative">
          <span
            style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
            className="bg-red-600 font-medium p-2 rounded-tl-3xl rounded-tr-3xl text-xs w-70 rounded-bl-3xl text-white"
          >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A officiis
            dolore cum, voluptatibus natus perferendis distinctio laborum minima
            sunt laboriosam pariatur unde nemo omnis. Facere quasi vitae
            doloremque rem aspernatur? Veniam nam mollitia voluptatum temporibus
            ratione nemo? Neque magni quia harum deleniti ipsam? Ea ab fugiat
            error totam maxime voluptate, temporibus, est mollitia, illo illum
            quos dolore quisquam dignissimos! Explicabo. Consequuntur, odit!
            Commodi aut cupiditate placeat! Voluptatum officia obcaecati quis
            numquam necessitatibus laborum doloremque excepturi provident autem
            beatae id impedit atque eum iusto, natus nihil quia harum tempora!
            Eligendi, laboriosam.
          </span>
          <img
            src="/images/avatar.png"
            className="w-10 h-10 object-contain  "
          />
        </div>
        <div className=" w-full p-5 flex justify-start items-end relative">
          <img
            src="/images/avatar.png"
            className="w-10 h-10 object-contain  "
          />
          <span
            style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
            className="bg-blue-500 p-2 font-medium rounded-tr-3xl rounded-tl-3xl text-xs w-70 rounded-br-3xl text-white"
          >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A officiis
            dolore cum, voluptatibus natus perferendis distinctio laborum minima
            sunt laboriosam pariatur unde nemo omnis. Facere quasi vitae
            doloremque rem aspernatur? Veniam nam mollitia voluptatum temporibus
            ratione nemo? Neque magni quia harum deleniti ipsam? Ea ab fugiat
            error totam maxime voluptate, temporibus, est mollitia, illo illum
            quos dolore quisquam dignissimos! Explicabo. Consequuntur, odit!
            Commodi aut cupiditate placeat! Voluptatum officia obcaecati quis
            numquam necessitatibus laborum doloremque excepturi provident autem
            beatae id impedit atque eum iusto, natus nihil quia harum tempora!
            Eligendi, laboriosam.
          </span>
        </div>
      </div>
      <div className=" flex-col gap-2 overflow-hidden bg-white  h-fit py-5 rounded-2xl  w-[90%]  flex justify-center items-center  ">
        <textarea
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
          <IoIosSend size={25} style={{ color: "blue", marginLeft: "auto" }} />
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
