
import React, { useState, useEffect } from 'react';

interface LobbyProps {
  joinRoom: (roomId: string, userName: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ joinRoom }) => {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    // Check for roomId in URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomId = urlParams.get('roomId');
    if (urlRoomId) {
      setRoomId(urlRoomId);
    } else {
        // Generate a default room ID if none in URL
        setRoomId(`room-${Math.random().toString(36).substring(2, 9)}`);
    }

    // Generate a default username
    if (!userName) {
      setUserName(`Guest-${Math.floor(Math.random() * 1000)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId && userName) {
      joinRoom(roomId, userName);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-white mb-2">Video Chat</h1>
        <p className="text-center text-gray-400 mb-8">Join a room to start a call</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-300">
              Your Name
            </label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-300">
              Room ID
            </label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter or generate a room ID"
              className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
          >
            Join Call
          </button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;
