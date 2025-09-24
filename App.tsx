import React from 'react';
import { useWebRTC } from './hooks/useWebRTC';
import Lobby from './components/Lobby';
import VideoPlayer from './components/VideoPlayer';
import ControlBar from './components/ControlBar';
import Chat from './components/Chat';
import type { Peer } from './types';

const App: React.FC = () => {
  const {
    userName,
    roomId,
    inCall,
    isMuted,
    isVideoOff,
    localStream,
    peers,
    chatMessages,
    joinRoom,
    hangUp,
    toggleAudio,
    toggleVideo,
    sendMessage,
    copyRoomLink,
  } = useWebRTC();

  if (!inCall) {
    return <Lobby joinRoom={joinRoom} />;
  }

  const peerList = Array.from(peers.values());
  const gridCols = `grid-cols-${Math.min(3, Math.ceil(Math.sqrt(peerList.length + 1)))}`;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <main className="flex-1 flex flex-col relative">
        <div className={`p-4 grid gap-4 flex-1 ${gridCols} grid-rows-auto`}>
          <VideoPlayer
            stream={localStream}
            userName={userName}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isLocal={true}
          />
          {/* FIX: Explicitly type 'peer' to resolve type inference errors. */}
          {peerList.map((peer: Peer) => (
            <VideoPlayer
              key={peer.id}
              stream={peer.stream}
              userName={peer.userName}
              isMuted={false} // This would need to be signaled for remote mute status
              isVideoOff={!peer.stream?.getVideoTracks()[0]?.enabled} // A simple check
              isLocal={false}
            />
          ))}
        </div>
        <ControlBar
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          hangUp={hangUp}
          copyRoomLink={copyRoomLink}
        />
      </main>
      <aside className="w-[350px] p-4 h-screen">
         <Chat messages={chatMessages} sendMessage={sendMessage} roomId={roomId} />
      </aside>
    </div>
  );
};

export default App;
