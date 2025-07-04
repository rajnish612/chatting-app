import React, { useCallback } from "react";
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
import { gql, useQuery } from "@apollo/client";

import AudioCall from "./AudioCall";

import { useState } from "react";
import useSocket from "../../hooks/Socket";
const DrawerItems = [
  {
    icon: <IoChatboxEllipsesSharp size={20} />,
    element: Chats,
  },
  {
    icon: <IoMdContact size={20} />,
    element: Contact,
  },
  {
    icon: <IoSettingsSharp size={20} />,
    element: Settings,
  },
  {
    icon: <FaUserFriends />,
    element: Search,
  },
];
const selfQuery = gql`
  query {
    self {
      _id
      email
      username
      followings
      followers
    }
  }
`;
const chatsQuery = gql`
  query {
    getChats {
      username
      unseenCount
    }
  }
`;
const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
const Home = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [userOnCall, setUserOnCall] = useState("");
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);
  const [showOutgoingCallModal, setShowOutgoingCallModal] = useState(false);
  const { socket } = useSocket();
  const peerConnection = React.useRef(null);
  let [chats, setChats] = useState([{}]);
  const { loading, refetch: selfRefetch } = useQuery(selfQuery, {
    onCompleted: async (data) => {
      setSelf(data?.self);
    },
  });
  const { getMyChats, refetch: chatsrefetch } = useQuery(chatsQuery, {
    onCompleted: async (data) => {
      setChats(data.getChats);
    },
    onError: async (err) => {},
  });

  const [selectedUserToChat, setSelectedUserToChat] = useState("");
  const [self, setSelf] = React.useState("");
  const [onCall, setOnCall] = React.useState(false);
  const [userMessages, setUserMessages] = useState([]);
  const [refreshUsers, setRefreshUsers] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [idx, setIdx] = React.useState(0);
  const SelectedComponent = DrawerItems[idx].element;

  useEffect(() => {
    const handleReceive = ({ sender, receiver, content }) => {
      console.log("content", content);
      setUserMessages((prev) => [...prev, { sender, receiver, content }]);
      chatsrefetch().then((data) => {
        setChats(data.data.getChats);
      });
    };

    socket.on("receive", handleReceive);

    return () => {
      socket.off("receive", handleReceive); // clean up
    };
  }, [chatsrefetch, socket]);
  useEffect(() => {
    socket.on("connect", () => {});
    socket.emit("join", self?.username);
    return () => {
      socket.off("connect", () => {
        socket.emit("join", self.username);
      });
    };
    // return () => {
    //   socket.disconnect();
    // };
  }, [self?.username, socket]);
  useEffect(() => {
    selfRefetch().then((data) => setSelf(data.data.self));
  });
  useEffect(() => {
    async function receiveCall({ from, offer }) {
      console.log("receiving from", from);

      setUserOnCall(from);
      setIncomingCall({ from, offer }); // store incoming call
      setShowIncomingCallModal(true);
    }
    socket.on("receive-call", receiveCall);
    return () => {
      socket.off("receive-call", receiveCall);
    };
  }, [socket, self?.username]);
  const handleAcceptCall = async () => {
    const { from, offer } = incomingCall;
    peerConnection.current = new RTCPeerConnection(config);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: from,
          from: self?.username,
          candidate: event.candidate,
        });
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit("answer-call", {
      to: from,
      from: self?.username,
      answer,
    });
    setOnCall(true);
  };
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
  socket.on("call-answered", async ({ from, answer }) => {
    setOnCall(true);
    console.log("from answer", from);
    console.log(" answer", answer);

    if (peerConnection.current) {
      try {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error("Failed to set remote description:", error);
      }
    }
  });
  const destroyPeerConnection = useCallback(
    (peerConnection) => {
      if (peerConnection.current) {
        peerConnection.current.getSenders().forEach((sender) => {
          if (sender.track) {
            sender.track.stop();
          }
        });

        // Close the peer connection
        peerConnection.current.close();
        peerConnection.current = null;
      }

      // Optionally emit a socket event to notify the other user
      socket.emit("call-ended", {
        from: self?.username,
        to: userOnCall,
      });

      setOnCall(false);
    },
    [userOnCall, self?.username, socket]
  );
  const callEnded = useCallback(() => {
    console.log("call ended");

    setIncomingCall(null);
    setShowOutgoingCallModal(false);
    setShowIncomingCallModal(false);
    destroyPeerConnection(peerConnection);
  }, []);
  useEffect(() => {
    socket.on("call-ended", callEnded);
    return () => {
      socket.off("call-ended", callEnded);
    };
  }, [socket, destroyPeerConnection, callEnded]);

  if (loading) return <h1>Loading</h1>;
  return (
    <div className="w-screen h-screen  bg-white">
      {showOutgoingCallModal && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white border p-4 shadow-lg z-50 flex gap-3 rounded">
          <span>{incomingCall?.from} is calling...</span>
          {onCall ? (
            <h1 className="text-black">OnCall</h1>
          ) : (
            <>
              <button className="bg-green-500 text-white px-3 py-1 rounded">
                calling....
              </button>
            </>
          )}
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => {
              destroyPeerConnection(peerConnection);
              setShowOutgoingCallModal(false);
            }}
          >
            Cancel
          </button>
        </div>
      )}
      {showIncomingCallModal && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white border p-4 shadow-lg z-50 flex gap-3 rounded">
          <span>{incomingCall?.from} is calling...</span>

          {onCall ? (
            <h1 className="text-black">On call</h1>
          ) : (
            <>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={handleAcceptCall}
              >
                Accept
              </button>
            </>
          )}
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => {
              destroyPeerConnection(peerConnection);
              setShowIncomingCallModal(false);
              setIncomingCall(null);
            }}
          >
            Reject
          </button>
        </div>
      )}
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
      <SelectedComponent
        onCall={onCall}
        peerConnection={peerConnection}
        destroyPeerConnection={destroyPeerConnection}
        showOutgoingCallModal={showOutgoingCallModal}
        setShowOutgoingCallModal={setShowOutgoingCallModal}
        selectedUserToChat={selectedUserToChat}
        setSelectedUserToChat={setSelectedUserToChat}
        self={self}
        userOnCall={userOnCall}
        setUserOnCall={setUserOnCall}
        setUserMessages={setUserMessages}
        userMessages={userMessages}
        socket={socket}
        setChats={setChats}
        chatsrefetch={chatsrefetch}
        chats={chats}
        setRefreshUsers={setRefreshUsers}
      />{" "}
      {/* {DrawerItems[idx].element} */}
    </div>
  );
};

export default Home;
