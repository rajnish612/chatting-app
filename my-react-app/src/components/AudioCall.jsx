import React, { useEffect, useRef, useState } from "react";

const AudioCall = ({ socket, selfUsername, targetUsername }) => {
  const localAudioRef = useRef();
  const [peerConnection, setPeerConnection] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [calling, setCalling] = useState(false);

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    const pc = new RTCPeerConnection(config);
    setPeerConnection(pc);

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      localAudioRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: targetUsername,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteAudio = new Audio();
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play();
    };

    socket.on("receive-call", async ({ from, offer }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer-call", { to: from, answer });
      setCallAccepted(true);
    });

    socket.on("call-answered", async ({ answer }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      setCallAccepted(true);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.off("receive-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
    };
  }, []);

  const startCall = async () => {
    if (!peerConnection) return;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("call-user", { to: targetUsername, offer });
    setCalling(true);
  };

  return (
    <div className="p-4 border border-black rounded-lg">
      <h2 className="text-lg font-bold mb-2">Audio Call</h2>
      {!calling && !callAccepted && (
        <button
          onClick={startCall}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Call
        </button>
      )}
      {callAccepted && <p className="text-green-700">Call Connected ✅</p>}
      <audio ref={localAudioRef} autoPlay muted />
    </div>
  );
};

export default AudioCall;
