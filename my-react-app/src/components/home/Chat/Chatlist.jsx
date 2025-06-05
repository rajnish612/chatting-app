import React from "react";
import { CiSearch } from "react-icons/ci";
const Chatlist = ({self}) => {
  console.log(self);
  
  return (
    <div className="lg:w-125  w-50 sm:hidden md:flex md:w-100 gap-5 rounded-2xl shadow-lg   flex-col  bg-white h-screen p-3">
      <div className="w-full mt-10 flex flex-col gap-2  justify-center items-center">
        <span className="text-black font-bold text-2xl">Chats</span>
        <div className="text-black w-[90%] flex items-center gap-2 overflow-hidden h-10  px-2 py-1 rounded-full bg-slate-200">
          <CiSearch /> <input className="h-full w-full outline-none" type="text" placeholder="search" />
        </div>
      </div>
      <div className="h-0.5 bg-slate-400 w-full" />
      <div
        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        className="h-full w-full items-center flex flex-col gap-4 overflow-y-scroll "
      >
        {self?.followings?.map((username, index) => (
          <button key={index} className=" w-[90%] focus:shadow-lg h-20 mt-2 !transition-all !border-0 focus:scale-[1.1] focus:rounded-2xl focus:!border-l-4 focus:!border-blue-500    !outline-0 text-black !flex !bg-white justify-start items-center">
            <div className="w-20 h-20  rounded-full overflow-hidden">
              <img
                src="/images/avatar.png"
                className="w-full object-contain h-full"
              />
            </div>
            <div className="flex flex-col  items-start ">
              <span> {username}</span>
              <span className="text-slate-400 text-sm ">message</span>
            </div>
            <div className="ml-auto flex justify-center items-center gap-2 flex-col">
              <span className=" w-4 h-4 text-xs flex justify-center items-center bg-red-500 rounded-full text-white">
                {index + 1}
              </span>
              <span className="text-xs text-slate-400">yesterday</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Chatlist;
