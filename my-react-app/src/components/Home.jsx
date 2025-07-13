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
import { FaUserFriends } from "react-icons/fa";
import Search from "./Search";
import { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import useSocket from "../../hooks/Socket";
import FollowersAndFollowings from "./FollowersAndFollowings";

const DrawerItems = [
  {
    icon: <IoChatboxEllipsesSharp size={20} />,
    element: Chats,
    label: "Chats",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: <IoMdContact size={20} />,
    element: Contact,
    label: "Contacts",
    color: "from-green-500 to-green-600",
  },
  {
    icon: <IoSettingsSharp size={20} />,
    element: Settings,
    label: "Settings",
    color: "from-gray-500 to-gray-600",
  },
  {
    icon: <FaUserFriends />,
    element: Search,
    label: "Search",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: <FaUserFriends />,
    element: FollowersAndFollowings,
    label: "Friends",
    color: "from-pink-500 to-pink-600",
  },
];

const selfQuery = gql`
  query {
    self {
      _id
      email
      username
      followings {
        _id
        username
        email
      }
      followers {
        _id
        username
        email
      }
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

  const { refetch: chatsrefetch } = useQuery(chatsQuery, {
    onCompleted: async (data) => {
      setChats(data.getChats);
    },
    onError: async () => {},
  });

  const [selectedUserToChat, setSelectedUserToChat] = useState("");
  const [self, setSelf] = React.useState(null);
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
      socket.off("receive", handleReceive);
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
  }, [self?.username, socket]);

  useEffect(() => {
    if (refreshUsers) {
      selfRefetch().then((data) => {
        setSelf(data.data.self);
        setRefreshUsers(false);
      });
    }
  }, [refreshUsers, selfRefetch]);

  useEffect(() => {
    async function receiveCall({ from, offer }) {
      console.log("receiving from", from);
      setUserOnCall(from);
      setIncomingCall({ from, offer });
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

        peerConnection.current.close();
        peerConnection.current = null;
      }

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

  if (loading) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-700 font-medium">Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Inline Styles for Advanced Animations */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

        .gradient-bg {
          background: linear-gradient(
            -45deg,
            #f8fafc,
            #e2e8f0,
            #f1f5f9,
            #ffffff,
            #e0f2fe
          );
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .glass-morphism {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .call-modal {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
        }

        .pulse-ring {
          animation: pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955)
            infinite;
        }

        @keyframes pulseRing {
          0% {
            transform: scale(0.33);
            opacity: 1;
          }
          80%,
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }

        .phone-vibrate {
          animation: vibrate 0.3s ease-in-out infinite;
        }

        @keyframes vibrate {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-2px);
          }
          75% {
            transform: translateX(2px);
          }
        }

        .drawer-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .drawer-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .drawer-button:hover::before {
          left: 100%;
        }

        .floating-action {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>

      <div className="gradient-bg w-screen h-screen relative overflow-hidden">
        {/* Beautiful Outgoing Call Modal */}
        {showOutgoingCallModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="call-modal rounded-3xl p-8 max-w-md w-full mx-4 text-center">
              <div className="relative mb-6">
                <div className="pulse-ring absolute inset-0 border-4 border-blue-400 rounded-full"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {userOnCall?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Calling...
              </h3>
              <p className="text-gray-600 mb-6">{userOnCall}</p>

              {onCall ? (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-semibold">
                    Connected
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-600 font-semibold">
                    Connecting...
                  </span>
                </div>
              )}

              <button
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => {
                  destroyPeerConnection(peerConnection);
                  setShowOutgoingCallModal(false);
                }}
              >
                End Call
              </button>
            </div>
          </div>
        )}

        {/* Beautiful Incoming Call Modal */}
        {showIncomingCallModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div
              className={`call-modal rounded-3xl p-8 max-w-md w-full mx-4 text-center ${
                !onCall && "phone-vibrate"
              }`}
            >
              <div className="relative mb-6">
                <div className="pulse-ring absolute inset-0 border-4 border-green-400 rounded-full"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {incomingCall?.from?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Incoming Call
              </h3>
              <p className="text-gray-600 mb-8">{incomingCall?.from}</p>

              {onCall ? (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-semibold">On Call</span>
                  <button
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-110 shadow-lg"
                    onClick={() => {
                      destroyPeerConnection(peerConnection);
                      setShowIncomingCallModal(false);
                      setIncomingCall(null);
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 001.414 1.414L10 12.414l3.293 3.293a1 1 0 001.414-1.414L11.414 11l3.293-3.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex gap-4 justify-center">
                  <button
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-110 shadow-lg"
                    onClick={handleAcceptCall}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </button>

                  <button
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-110 shadow-lg"
                    onClick={() => {
                      destroyPeerConnection(peerConnection);
                      setShowIncomingCallModal(false);
                      setIncomingCall(null);
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 001.414 1.414L10 12.414l3.293 3.293a1 1 0 001.414-1.414L11.414 11l3.293-3.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Menu Button */}
        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={() => setOpen(true)}
            className="glass-morphism floating-action p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
          >
            <SlOptions
              size={20}
              className="text-gray-700 group-hover:text-blue-600 transition-colors duration-300"
            />
          </button>
        </div>

        {/* Beautiful Enhanced Drawer */}
        <Drawer
          PaperProps={{
            sx: {
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              width: 280,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            },
          }}
          anchor="left"
          open={open}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white text-xl font-bold">Menu</h2>
              <p className="text-gray-400 text-sm">
                Welcome back, {self?.username || "User"}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
            >
              <RxCross1 size={18} className="text-white" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-3">
            {DrawerItems.map((item, itemIdx) => (
              <button
                key={itemIdx}
                onClick={() => {
                  setIdx(itemIdx);
                  setOpen(false);
                }}
                className={`drawer-button flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  idx === itemIdx
                    ? `bg-gradient-to-r ${item.color} shadow-lg text-white`
                    : "hover:bg-white/10 text-gray-300 hover:text-white"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    idx === itemIdx ? "bg-white/20" : "bg-white/10"
                  }`}
                >
                  {item.icon}
                </div>
                <span className="font-medium">{item.label}</span>
                {idx === itemIdx && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* User Profile Section */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {self?.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {self?.username || "Username"}
                </p>
                <p className="text-gray-400 text-sm truncate">
                  {self?.email || "email@example.com"}
                </p>
              </div>
            </div>
          </div>
        </Drawer>

        {/* Main Content Area */}
        <div className="h-full w-full">
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
            setIdx={setIdx}
            setChats={setChats}
            chatsrefetch={chatsrefetch}
            chats={chats}
            setRefreshUsers={setRefreshUsers}
          />
        </div>
      </div>
    </>
  );
};

export default Home;
