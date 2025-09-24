
import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  stream?: MediaStream;
  userName: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isLocal: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, userName, isMuted, isVideoOff, isLocal }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg relative aspect-video flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || isMuted}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
      />
      {isVideoOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-4xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-md backdrop-blur-sm">
        {userName} {isLocal && '(You)'}
      </div>
       {!isLocal && (
        <div className="absolute top-2 right-2">
          {isMuted && (
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a4 4 0 014-4V5a4 4 0 10-8 0v2a4 4 0 014 4zM6.71 6.71a7.003 7.003 0 00-5.42 8.29l9.71-9.71A7.003 7.003 0 006.71 6.71z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"></path></svg>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
