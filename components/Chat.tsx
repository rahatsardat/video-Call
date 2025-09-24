
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon } from './Icons';

interface ChatProps {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
  roomId: string;
}

const Chat: React.FC<ChatProps> = ({ messages, sendMessage, roomId }) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      sendMessage(currentMessage.trim());
      setCurrentMessage('');
    }
  };

  return (
    <div className="w-full md:w-80 bg-gray-800 flex flex-col h-full p-4 rounded-lg shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">Chat</h3>
      <div className="text-sm text-gray-400 mb-3">Room: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{roomId}</span></div>
      <div ref={chatBoxRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-4">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.isLocal ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-lg max-w-xs break-words ${msg.isLocal ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                {!msg.isLocal && <span className="text-xs font-bold text-indigo-400 block">{msg.sender}</span>}
                <p>{msg.text}</p>
                 <span className="text-xs text-gray-400 block mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-gray-700">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!currentMessage.trim()}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
