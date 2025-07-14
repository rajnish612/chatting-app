import { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

// Temporary token generation for testing - replace with server-side token generation
const generateToken = async (channelName, uid, appId) => {
  // For testing purposes, try with null token first
  // In production, you need to implement proper token server
  return null;
};

const useAgora = () => {
  const [client] = useState(() => AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }));
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        setUsers(prevUsers => {
          const existingUser = prevUsers.find(u => u.uid === user.uid);
          if (existingUser) {
            return prevUsers.map(u => 
              u.uid === user.uid ? { ...u, videoTrack: user.videoTrack } : u
            );
          }
          return [...prevUsers, { uid: user.uid, videoTrack: user.videoTrack, audioTrack: user.audioTrack }];
        });
      }
      
      if (mediaType === 'audio') {
        setUsers(prevUsers => {
          const existingUser = prevUsers.find(u => u.uid === user.uid);
          if (existingUser) {
            return prevUsers.map(u => 
              u.uid === user.uid ? { ...u, audioTrack: user.audioTrack } : u
            );
          }
          return [...prevUsers, { uid: user.uid, audioTrack: user.audioTrack }];
        });
      }
    };

    const handleUserUnpublished = (user) => {
      setUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
    };

    const handleUserLeft = (user) => {
      setUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserLeft);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-left', handleUserLeft);
    };
  }, [client]);

  useEffect(() => {
    if (localTracks && localVideoRef.current) {
      localTracks[1]?.play(localVideoRef.current);
    }
  }, [localTracks]);

  useEffect(() => {
    if (users.length > 0 && remoteVideoRef.current) {
      const remoteUser = users[0];
      if (remoteUser.videoTrack) {
        remoteUser.videoTrack.play(remoteVideoRef.current);
      }
    }
  }, [users]);

  const startCall = async (channelName, uid, appId = "f4b6ac703ee04238b632d361bc408766") => {
    try {
      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      
      setLocalTracks([microphoneTrack, cameraTrack]);
      
      // For testing, using null token (only works in testing mode)
      await client.join(appId, channelName, null, uid);
      
      await client.publish([microphoneTrack, cameraTrack]);
      
      setInCall(true);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to start call:', error);
      return { success: false, error: error.message };
    }
  };

  const endCall = async () => {
    try {
      if (localTracks) {
        localTracks.forEach(track => {
          track.stop();
          track.close();
        });
        setLocalTracks(null);
      }
      
      await client.leave();
      setUsers([]);
      setInCall(false);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to end call:', error);
      return { success: false, error: error.message };
    }
  };

  const toggleAudio = () => {
    if (localTracks && localTracks[0]) {
      if (isAudioEnabled) {
        localTracks[0].setEnabled(false);
      } else {
        localTracks[0].setEnabled(true);
      }
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localTracks && localTracks[1]) {
      if (isVideoEnabled) {
        localTracks[1].setEnabled(false);
      } else {
        localTracks[1].setEnabled(true);
      }
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  return {
    client,
    users,
    localTracks,
    inCall,
    isAudioEnabled,
    isVideoEnabled,
    localVideoRef,
    remoteVideoRef,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo
  };
};

export default useAgora;