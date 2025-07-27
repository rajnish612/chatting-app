import React from "react";
import { gql, useMutation } from "@apollo/client";

const getAudioMessagesQuery = gql`
  mutation getAudioMessages($sender: String!, $receiver: String!) {
    getAudioMessages(sender: $sender, receiver: $receiver) {
      _id
      sender
      receiver
      audioData
      duration
      fileType
      timestamp
      isSeen
      isPlayed
    }
  }
`;

const AudioBox = ({ onBack, selectedUserToChat, self, socket }) => {
  console.log("self", self);
  console.log("selecteduser", selectedUserToChat);

  const [recording, setRecording] = React.useState(false);
  const [audioMessages, setAudioMessages] = React.useState([]);
  const [getAudioMessages] = useMutation(getAudioMessagesQuery);
  const [audioURL, setAudioURL] = React.useState("");
  const [audioLevel, setAudioLevel] = React.useState(0);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isSending, setIsSending] = React.useState(false);
  const [audioBlobRef, setAudioBlobRef] = React.useState(null);
  const audioRef = React.useRef(null);
  const [playingAudio, setPlayingAudio] = React.useState(null);
  const [audioCurrentTime, setAudioCurrentTime] = React.useState({});
  const [audioDurations, setAudioDurations] = React.useState({});
  const mediaRecorderRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const audioContextRef = React.useRef(null);
  const analyserRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const timerRef = React.useRef(null);
  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average =
      dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(Math.min(100, average * 2));

    animationRef.current = requestAnimationFrame(analyzeAudio);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    mediaRecorderRef.current = new MediaRecorder(stream);

    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
      setAudioBlobRef(audioBlob);
      audioChunksRef.current = [];
    };

    mediaRecorderRef.current.start();
    setRecording(true);
    setRecordingTime(0);

    analyzeAudio();

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach((track) => track.stop());
    setRecording(false);
    setAudioLevel(0);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0 || seconds === undefined || seconds === null) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleAudioPlayback = (messageId, audioSrc) => {
    const audio = document.getElementById(`audio-${messageId}`);
    if (!audio) return;

    if (playingAudio === messageId) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      // Pause any currently playing audio
      if (playingAudio) {
        const currentAudio = document.getElementById(`audio-${playingAudio}`);
        if (currentAudio) currentAudio.pause();
      }
      
      audio.play();
      setPlayingAudio(messageId);
    }
  };

  const handleAudioTimeUpdate = (messageId, currentTime, duration) => {
    setAudioCurrentTime(prev => ({
      ...prev,
      [messageId]: currentTime
    }));
    
    if (duration && isFinite(duration) && duration > 0) {
      setAudioDurations(prev => ({
        ...prev,
        [messageId]: duration
      }));
    }
  };

  const handleAudioLoadedMetadata = (messageId, duration) => {
    if (duration && isFinite(duration) && duration > 0) {
      setAudioDurations(prev => ({
        ...prev,
        [messageId]: duration
      }));
    }
  };

  const handleAudioEnded = (messageId) => {
    setPlayingAudio(null);
    setAudioCurrentTime(prev => ({
      ...prev,
      [messageId]: 0
    }));
  };

  const seekAudio = (messageId, percentage) => {
    const audio = document.getElementById(`audio-${messageId}`);
    if (audio && audioDurations[messageId]) {
      const newTime = (percentage / 100) * audioDurations[messageId];
      audio.currentTime = newTime;
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration || isNaN(duration) || !isFinite(duration) || duration <= 0)
      return;

    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newTime = Math.min(duration, Math.max(0, (clickX / width) * duration));

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendAudioMessage = async () => {
    if (!audioBlobRef || !selectedUserToChat || isSending || !socket) return;

    try {
      setIsSending(true);
      
      const base64Audio = await convertBlobToBase64(audioBlobRef);
      
      const audioMessage = {
        sender: self.username,
        receiver: selectedUserToChat,
        audioData: base64Audio,
        duration: Math.floor(duration) || recordingTime, // Use recordingTime as fallback
        fileType: 'audio/webm'
      };
      
      console.log('🎵 SENDING AUDIO MESSAGE:');
      console.log('- audioMessage.duration:', audioMessage.duration);
      console.log('- original duration:', duration);
      console.log('- recordingTime:', recordingTime);
      console.log('- full audioMessage:', audioMessage);

      socket.emit('sendAudioMessage', audioMessage);
      
      // Add the sent message to the local audio messages state immediately
      setAudioMessages((prev) => [...prev, {
        _id: Date.now().toString(),
        sender: self.username,
        receiver: selectedUserToChat,
        audioData: base64Audio,
        duration: Math.floor(duration) || recordingTime, // Use recordingTime as fallback
        fileType: 'audio/webm',
        timestamp: new Date().toISOString(),
        isSeen: false,
        isPlayed: false
      }]);
      
      setAudioURL("");
      setAudioBlobRef(null);
      setDuration(0);
      setCurrentTime(0);
      setIsPlaying(false);
      console.log('Audio message sent successfully');
    } catch (error) {
      console.error('Error sending audio message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const deleteAudioMessage = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL("");
    setAudioBlobRef(null);
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  React.useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [audioURL]);

  // Fetch audio messages when component loads or user changes
  React.useEffect(() => {
    const fetchAudioMessages = async () => {
      if (!selectedUserToChat || !self.username) return;
      
      try {
        const { data } = await getAudioMessages({
          variables: {
            sender: self.username,
            receiver: selectedUserToChat
          }
        });
        setAudioMessages(data.getAudioMessages || []);
      } catch (error) {
        console.error('Error fetching audio messages:', error);
      }
    };

    fetchAudioMessages();
  }, [selectedUserToChat, self.username, getAudioMessages]);

  // Socket.io listener for incoming audio messages
  React.useEffect(() => {
    if (!socket) return;

    const handleReceiveAudioMessage = (message) => {
      // Only handle audio messages for the current chat
      if (message.receiver === self.username && 
          message.sender === selectedUserToChat) {
        setAudioMessages((prev) => [...prev, {
          _id: message._id,
          sender: message.sender,
          receiver: message.receiver,
          audioData: message.audioData,
          duration: message.duration || 0,
          fileType: message.fileType || 'audio/webm',
          timestamp: message.timestamp,
          isSeen: message.isSeen || false,
          isPlayed: message.isPlayed || false
        }]);
      }
    };

    socket.on('receiveAudioMessage', handleReceiveAudioMessage);

    return () => {
      socket.off('receiveAudioMessage', handleReceiveAudioMessage);
    };
  }, [socket, self.username, selectedUserToChat]);

  // Initialize durations from message data and force metadata loading
  React.useEffect(() => {
    console.log('🔄 PROCESSING AUDIO MESSAGES:', audioMessages.length, 'messages');
    audioMessages.forEach(message => {
      console.log('📨 Message:', message._id, 'duration:', message.duration, 'full message:', message);
      
      // Set duration from message data immediately if we don't have it
      setAudioDurations(prev => {
        if (!prev[message._id] && message.duration) {
          console.log('✅ Setting duration for', message._id, 'to:', message.duration);
          return {
            ...prev,
            [message._id]: message.duration
          };
        }
        console.log('❌ NOT setting duration for', message._id, 'prev exists:', !!prev[message._id], 'message.duration:', message.duration);
        return prev;
      });
      
      // Force audio metadata loading
      setTimeout(() => {
        const audioElement = document.getElementById(`audio-${message._id}`);
        if (audioElement) {
          audioElement.load(); // Force metadata loading
        }
      }, 100);
    });
  }, [audioMessages]);

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
      <div className="w-full overflow-y-scroll h-full mt-22 py-2 px-4">
        {/* Audio messages will be displayed here */}
        <div className="flex flex-col space-y-3">
          {audioMessages && audioMessages.length > 0 ? (
            audioMessages.map((message, index) => (
                <div
                  key={message._id || index}
                  className={`flex ${
                    message.sender === self.username ? 'justify-end' : 'justify-start'
                  } mb-3`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.sender === self.username
                        ? '!bg-blue-500 !text-white rounded-br-sm'
                        : '!bg-gray-200 !text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <div className="mb-2">
                      <span className="text-xs opacity-75">
                        {message.sender === self.username ? 'You' : message.sender}
                      </span>
                    </div>
                    
                    {/* Custom Audio Player */}
                    <div className="flex items-center space-x-3 py-2">
                      {/* Play/Pause Button */}
                      <button
                        onClick={() => toggleAudioPlayback(message._id, message.audioData)}
                        className={`!flex-shrink-0 !w-10 !h-10 !rounded-full !flex !items-center !justify-center !transition-all !duration-200 !shadow-md ${
                          message.sender === self.username
                            ? '!bg-blue-600 hover:!bg-blue-700'
                            : '!bg-gray-600 hover:!bg-gray-700'
                        }`}
                      >
                        {playingAudio === message._id ? (
                          <svg className="w-5 h-5 !text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 !text-white !ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        )}
                      </button>
                      
                      {/* Waveform/Progress Bar */}
                      <div className="!flex-1 !space-y-1">
                        <div 
                          className="!flex !items-center !space-x-1 !cursor-pointer"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                            seekAudio(message._id, percentage);
                          }}
                        >
                          {[...Array(20)].map((_, i) => (
                            <div
                              key={i}
                              className={`!w-1 !rounded-full !transition-all !duration-200 ${
                                message.sender === self.username
                                  ? '!bg-blue-200'
                                  : '!bg-gray-300'
                              }`}
                              style={{
                                height: `${Math.random() * 16 + 8}px`,
                                opacity: (audioCurrentTime[message._id] || 0) / (audioDurations[message._id] || message.duration || 1) > i / 20 ? 1 : 0.4
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Time Display */}
                        <div className="!flex !justify-between !text-xs !opacity-75">
                          <span>
                            {formatTime(audioCurrentTime[message._id] || 0)}
                          </span>
                          <span>
                            {console.log('🕒 DURATION RENDER:', message._id, 'audioDurations:', audioDurations[message._id], 'message.duration:', message.duration)}
                            {formatTime(audioDurations[message._id] || message.duration || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hidden Audio Element */}
                    <audio
                      id={`audio-${message._id}`}
                      src={message.audioData}
                      onTimeUpdate={(e) => handleAudioTimeUpdate(message._id, e.target.currentTime, e.target.duration)}
                      onLoadedMetadata={(e) => handleAudioLoadedMetadata(message._id, e.target.duration)}
                      onLoadedData={(e) => handleAudioLoadedMetadata(message._id, e.target.duration)}
                      onCanPlay={(e) => handleAudioLoadedMetadata(message._id, e.target.duration)}
                      onEnded={() => handleAudioEnded(message._id)}
                      preload="metadata"
                      crossOrigin="anonymous"
                      className="!hidden"
                    />
                    
                    <div className="text-xs opacity-75 mt-1">
                      <span>Voice message</span>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center text-gray-500 text-sm py-8">
              No audio messages yet
            </div>
          )}
        </div>
      </div>
      <div className="w-[90%]  h-[25%] bg-white m-auto shadow-lg    p-2 mb-6  rounded-lg">
        <div className="w-full h-full flex  flex-col justify-center items-center border-2 border-dotted p-4 border-blue-300 rounded-lg">
          {recording && (
            <div className="mb-4 flex flex-col items-center">
              <div className="text-red-500 font-mono text-lg mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full transition-all duration-150"
                    style={{
                      height: `${Math.max(
                        4,
                        (audioLevel / 100) * 32 + Math.random() * 8
                      )}px`,
                      opacity: audioLevel > 10 ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
              <div className="text-red-500 text-sm animate-pulse">
                Recording...
              </div>
            </div>
          )}

          <button
            onClick={!recording ? startRecording : stopRecording}
            className={`${
              recording
                ? "!animate-pulse !bg-gradient-to-r !from-red-500 !to-red-600"
                : "!bg-slate-200"
            } !p-2 !transition-all hover:!scale-[1.1] !rounded-full `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={!recording ? "blue" : "white"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-mic-icon lucide-mic"
            >
              <path d="M12 19v3" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <rect x="9" y="2" width="6" height="13" rx="3" />
            </svg>
          </button>

          {audioURL && !recording && (
            <div className="w-full mt-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm mb-3">
                <audio ref={audioRef} src={audioURL} className="hidden" />

                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlayback}
                    className="flex-shrink-0 w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors shadow-md"
                  >
                    {isPlaying ? (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-white ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 font-medium">
                        Voice Message
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div
                      className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
                      onClick={handleSeek}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-150"
                        style={{
                          width: `${
                            duration && !isNaN(duration) && isFinite(duration) && duration > 0
                              ? Math.min(100, (currentTime / duration) * 100)
                              : 0
                          }%`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 h-1 mx-px bg-blue-100 rounded-full opacity-30"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={deleteAudioMessage}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium text-gray-700"
                >
                  Delete
                </button>
                <button
                  onClick={sendAudioMessage}
                  disabled={isSending}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 ${
                    isSending
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {!recording && !audioURL && (
            <span className="text-black font-semibold mt-2">
              Tap here to send voice message
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioBox;
