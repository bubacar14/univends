import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PaperAirplaneIcon,
  PhotoIcon,
  EllipsisHorizontalIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

export default function ChatSystem({ conversationId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const ws = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversation();
    initializeWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const [messagesRes, participantRes] = await Promise.all([
        fetch(`/api/conversations/${conversationId}/messages`),
        fetch(`/api/conversations/${conversationId}/participant`)
      ]);
      
      const messagesData = await messagesRes.json();
      const participantData = await participantRes.json();
      
      setMessages(messagesData);
      setParticipant(participantData);
    } catch (error) {
      setError('Erreur lors du chargement de la conversation');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeWebSocket = () => {
    ws.current = new WebSocket(
      `${process.env.REACT_APP_WS_URL}/chat/${conversationId}`
    );

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          handleNewMessage(data.message);
          break;
        case 'typing':
          handleTypingIndicator(data.userId);
          break;
        case 'read':
          handleReadReceipt(data.messageId);
          break;
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Erreur de connexion au chat');
    };
  };

  const handleNewMessage = (message) => {
    setMessages((prev) => [...prev, message]);
    scrollToBottom();
  };

  const handleTypingIndicator = (userId) => {
    if (userId !== currentUser.id) {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };

  const handleReadReceipt = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      content: newMessage.trim(),
      senderId: currentUser.id,
      conversationId,
      timestamp: new Date().toISOString(),
    };

    try {
      ws.current.send(JSON.stringify({
        type: 'message',
        message: messageData,
      }));
      
      setNewMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  };

  const handleTyping = () => {
    ws.current.send(JSON.stringify({
      type: 'typing',
      userId: currentUser.id,
    }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* En-tête du chat */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <div className="flex items-center space-x-3">
          <img
            src={participant?.avatar}
            alt={participant?.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-medium text-gray-900">{participant?.name}</h3>
            {isTyping ? (
              <p className="text-sm text-primary-600">En train d'écrire...</p>
            ) : (
              <p className="text-sm text-gray-500">
                {participant?.isOnline ? 'En ligne' : 'Hors ligne'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <PhoneIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <VideoCameraIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <InformationCircleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === currentUser.id;
          const showAvatar = index === 0 || 
            messages[index - 1].senderId !== message.senderId;

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isCurrentUser && showAvatar && (
                <img
                  src={participant.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div
                className={`max-w-[70%] ${
                  isCurrentUser
                    ? 'bg-primary-600 text-white rounded-l-lg rounded-tr-lg'
                    : 'bg-white text-gray-900 rounded-r-lg rounded-tl-lg'
                } px-4 py-2 shadow-sm`}
              >
                <p className="text-sm">{message.content}</p>
                <div
                  className={`flex items-center text-xs mt-1 ${
                    isCurrentUser ? 'text-primary-100' : 'text-gray-400'
                  }`}
                >
                  <span>{formatTime(message.timestamp)}</span>
                  {isCurrentUser && message.read && (
                    <span className="ml-1">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <PhotoIcon className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
              placeholder="Écrivez votre message..."
              className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-full ${
              newMessage.trim()
                ? 'text-primary-600 hover:bg-primary-50'
                : 'text-gray-400'
            }`}
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
