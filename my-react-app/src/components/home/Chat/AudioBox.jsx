import React from "react";

const AudioBox = ({ onBack }) => {
  return (
    <div className="relative h-screen flex  bg-slate-50 flex-col ">
      <header className="p-2 py-5 absolute left-0 right-0 top-0 bg-white shadow-lg z-10">
        <button
          onClick={onBack}
          className="!p-2 !bg-blue-400 !w-fit !rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
        </button>
      </header>
      <div className="w-full overflow-y-scroll h-full  mt-22 py-2">
        <h1 className="text-black">first</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">hey</h1>
        <h1 className="text-black">last</h1>
      </div>
      <div className="w-[90%]  h-[25%] bg-white m-auto shadow-lg    p-2 mb-6  rounded-lg">
        <div className="w-full h-full flex  flex-col justify-center items-center border-2 border-dotted border-blue-300 rounded-lg">
          <button className="!p-2 !transition-all hover:scale-[1.1] !rounded-full !bg-slate-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="blue"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-mic-icon lucide-mic"
            >
              <path d="M12 19v3" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <rect x="9" y="2" width="6" height="13" rx="3" />
            </svg>
          </button>
          <span className="text-black font-semibold">Tap here to send voice message</span>
        </div>
      </div>
    </div>
  );
};

export default AudioBox;
