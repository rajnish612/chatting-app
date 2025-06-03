import React from "react";
import Drawer from "@mui/material/Drawer";
import { Box } from "@mui/material";
import { SlOptions } from "react-icons/sl";
import { IoChatboxEllipsesSharp } from "react-icons/io5";
import { IoMdContact } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import Chats from "./home/Chat/Chats";
import { IoSettingsSharp } from "react-icons/io5";
import Settings from "./home/Settings";
import Contact from "./home/Contact";
import { io } from "socket.io-client";
import { FaUserFriends } from "react-icons/fa";
import Search from "./Search";
import { useEffect } from "react";
const DrawerItems = [
  {
    icon: <IoChatboxEllipsesSharp size={20} />,
    element: <Chats />,
  },
  {
    icon: <IoMdContact size={20} />,
    element: <Contact />,
  },
  {
    icon: <IoSettingsSharp size={20} />,
    element: <Settings />,
  },
  {
    icon: <FaUserFriends />,
    element: <Search />,
  },
];

const Home = () => {
  const socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ["websocket"],
  });
  const [open, setOpen] = React.useState(false);
  const [idx, setIdx] = React.useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + "/api/users", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          console.log("User data fetched successfully:", data);
        } else {
          console.error("Failed to fetch user data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchData();
  }, []);
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
      socket.emit("message", "Hello from React Native");
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <div className="w-screen h-screen bg-white">
      <SlOptions
        onClick={() => setOpen(true)}
        color="black"
        className="absolute cursor-pointer hover:scale-[1.1] transition-transform top-2 z-[1000]  left-4 "
      />

      <Drawer
        PaperProps={{
          sx: {
            backgroundColor: "black",
            transition: "all  linear",

            display: "flex",
            width: 200,
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 2,
          },
        }}
        anchor="left"
        open={open}
      >
        <RxCross1
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 hover:scale-[1.1] transition-transform cursor-pointer"
          color="white"
        />
        <div className="h-5" />
        {DrawerItems.map((item, idx) => (
          <button
            onClick={() => setIdx(idx)}
            style={{ backgroundColor: "black" }}
            className="focus:!bg-red-700   !outline-none rounded-full p-2  !transition-all hover:scale-[1.1] text-white !outline-0"
          >
            {item.icon}
          </button>
        ))}
      </Drawer>
      {DrawerItems[idx].element}
    </div>
  );
};

export default Home;
