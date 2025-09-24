
export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string;
  isLocal: boolean;
}

export interface Peer {
  id: string;
  userName: string;
  stream?: MediaStream;
}
