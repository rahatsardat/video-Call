
import { useState, useRef, useEffect, useCallback } from 'react';
import type { Peer, ChatMessage } from '../types';

const WEBSOCKET_URL = 'ws://localhost:3001';

const RTC_CONFIG: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const useWebRTC = () => {
    const [selfId, setSelfId] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [roomId, setRoomId] = useState<string>('');
    const [inCall, setInCall] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
    const [localStream, setLocalStream] = useState<MediaStream | undefined>();
    const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    const wsRef = useRef<WebSocket | null>(null);
    const pcRefs = useRef<Map<string, RTCPeerConnection>>(new Map());

    const cleanup = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        pcRefs.current.forEach(pc => pc.close());
        pcRefs.current.clear();
        setPeers(new Map());
        setLocalStream(undefined);
        setInCall(false);
        setChatMessages([]);
    }, [localStream]);

    const createPeerConnection = useCallback((peerId: string, peerUserName: string) => {
        if (pcRefs.current.has(peerId)) {
            return pcRefs.current.get(peerId)!;
        }
        
        const pc = new RTCPeerConnection(RTC_CONFIG);
        pcRefs.current.set(peerId, pc);

        pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'ice-candidate', room: roomId, payload: event.candidate, senderId: selfId }));
            }
        };

        pc.ontrack = (event) => {
            setPeers(prev => new Map(prev).set(peerId, { id: peerId, userName: peerUserName, stream: event.streams[0] }));
        };
        
        localStream?.getTracks().forEach(track => pc.addTrack(track, localStream));

        return pc;
    }, [localStream, roomId, selfId]);

    const handleSignalingMessage = useCallback(async (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        const { type, payload, senderId, senderName, peers: newPeers, participant } = data;
        
        if(senderId === selfId) return;

        switch (type) {
            case 'joined':
                setSelfId(data.selfId);
                for (const peer of data.peers) {
                    const pc = createPeerConnection(peer.id, peer.userName);
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    wsRef.current?.send(JSON.stringify({ type: 'offer', room: roomId, payload: offer, senderId: data.selfId, senderName: userName }));
                }
                break;
            case 'participantJoined':
                setPeers(prev => new Map(prev).set(participant.id, { id: participant.id, userName: participant.userName }));
                break;
            case 'offer':
                const pc = createPeerConnection(senderId, senderName);
                await pc.setRemoteDescription(new RTCSessionDescription(payload));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                wsRef.current?.send(JSON.stringify({ type: 'answer', room: roomId, payload: answer, senderId: selfId, senderName: userName }));
                break;
            case 'answer':
                 if (pcRefs.current.has(senderId)) {
                    await pcRefs.current.get(senderId)!.setRemoteDescription(new RTCSessionDescription(payload));
                }
                break;
            case 'ice-candidate':
                if (pcRefs.current.has(senderId)) {
                    await pcRefs.current.get(senderId)!.addIceCandidate(new RTCIceCandidate(payload));
                }
                break;
            case 'participantLeft':
                if (pcRefs.current.has(participant.id)) {
                    pcRefs.current.get(participant.id)!.close();
                    pcRefs.current.delete(participant.id);
                }
                setPeers(prev => {
                    const newPeersMap = new Map(prev);
                    newPeersMap.delete(participant.id);
                    return newPeersMap;
                });
                break;
             case 'chatMessage':
                setChatMessages(prev => [...prev, { ...payload, sender: senderName, isLocal: false }]);
                break;
            default:
                break;
        }
    }, [createPeerConnection, roomId, selfId, userName]);

    const joinRoom = async (newRoomId: string, newUserName: string) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            setRoomId(newRoomId);
            setUserName(newUserName);
            
            wsRef.current = new WebSocket(WEBSOCKET_URL);
            wsRef.current.onopen = () => {
                wsRef.current?.send(JSON.stringify({ type: 'join', room: newRoomId, userName: newUserName }));
                setInCall(true);
            };
            wsRef.current.onmessage = handleSignalingMessage;
        } catch (error) {
            console.error('Failed to get user media', error);
            alert('Could not access camera/microphone. Please check permissions.');
        }
    };

    const hangUp = () => {
        cleanup();
    };
    
    useEffect(() => {
        return () => {
            if (inCall) {
                cleanup();
            }
        };
    }, [inCall, cleanup]);

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(prev => !prev);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(prev => !prev);
        }
    };

    const sendMessage = (text: string) => {
        const message = {
            text,
            timestamp: new Date().toISOString(),
        };
        wsRef.current?.send(JSON.stringify({ type: 'chatMessage', room: roomId, payload: message, userName }));
        setChatMessages(prev => [...prev, { ...message, sender: 'You', isLocal: true }]);
    };
    
    const copyRoomLink = () => {
        const roomLink = `${window.location.origin}${window.location.pathname}?roomId=${roomId}`;
        navigator.clipboard.writeText(roomLink).then(() => {
          alert('Room link copied to clipboard!');
        }).catch(err => {
          console.error('Failed to copy room link:', err);
        });
    };

    return {
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
    };
};
