
import React from 'react';
import { MicOnIcon, MicOffIcon, VideoOnIcon, VideoOffIcon, HangUpIcon, CopyIcon } from './Icons';

interface ControlBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  hangUp: () => void;
  copyRoomLink: () => void;
}

const ControlButton: React.FC<{ onClick: () => void; title: string; children: React.ReactNode; className?: string; }> = ({ onClick, title, children, className = '' }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors duration-200 ${className}`}
    >
      {children}
    </button>
);


const ControlBar: React.FC<ControlBarProps> = ({ isMuted, isVideoOff, toggleAudio, toggleVideo, hangUp, copyRoomLink }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4">
        <div className="flex justify-center items-center gap-4 p-3 bg-gray-800 bg-opacity-70 rounded-full shadow-lg backdrop-blur-md">
            <ControlButton
                onClick={toggleAudio}
                title={isMuted ? 'Unmute' : 'Mute'}
                className={isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}
            >
                {isMuted ? <MicOffIcon className="w-6 h-6 text-white" /> : <MicOnIcon className="w-6 h-6 text-white" />}
            </ControlButton>
            <ControlButton
                onClick={toggleVideo}
                title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                className={isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}
            >
                {isVideoOff ? <VideoOffIcon className="w-6 h-6 text-white" /> : <VideoOnIcon className="w-6 h-6 text-white" />}
            </ControlButton>
            <ControlButton
                onClick={copyRoomLink}
                title="Copy Room Link"
                className="bg-indigo-600 hover:bg-indigo-700"
            >
                <CopyIcon className="w-6 h-6 text-white" />
            </ControlButton>
            <ControlButton
                onClick={hangUp}
                title="Hang Up"
                className="bg-red-600 hover:bg-red-700 ml-4"
            >
                <HangUpIcon className="w-6 h-6 text-white" />
            </ControlButton>
        </div>
    </div>
  );
};

export default ControlBar;
