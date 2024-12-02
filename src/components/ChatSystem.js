import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useWebSocket from '../hooks/useWebSocket';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ChatSystem = ({ conversationId }) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const messageEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const {
        sendMessage,
        sendTypingIndicator,
        sendReadReceipt,
        wsService
    } = useWebSocket({
        new_message: handleNewMessage,
        typing_indicator: handleTypingIndicator,
        read_receipt: handleReadReceipt
    });

    useEffect(() => {
        // Charger l'historique des messages
        fetchMessageHistory();
        
        // Scroll to bottom on new messages
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationId]);

    const fetchMessageHistory = async () => {
        try {
            const response = await fetch(`/api/conversations/${conversationId}/messages`);
            const data = await response.json();
            setMessages(data);
            // Marquer tous les messages non lus comme lus
            data.forEach(message => {
                if (!message.read && message.sender !== currentUser.uid) {
                    sendReadReceipt(conversationId, message._id);
                }
            });
        } catch (error) {
            console.error('Erreur lors du chargement des messages:', error);
        }
    };

    function handleNewMessage(data) {
        if (data.conversationId === conversationId) {
            setMessages(prev => [...prev, data.message]);
            // Envoyer un accusé de lecture si le message vient d'un autre utilisateur
            if (data.message.sender !== currentUser.uid) {
                sendReadReceipt(conversationId, data.message._id);
            }
        }
    }

    function handleTypingIndicator(data) {
        if (data.conversationId === conversationId && data.userId !== currentUser.uid) {
            if (data.isTyping) {
                setTypingUsers(prev => new Set(prev).add(data.userId));
            } else {
                setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.userId);
                    return newSet;
                });
            }
        }
    }

    function handleReadReceipt(data) {
        if (data.conversationId === conversationId) {
            setMessages(prev => prev.map(msg => 
                msg._id === data.messageId 
                    ? { ...msg, read: true } 
                    : msg
            ));
        }
    }

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            sendTypingIndicator(conversationId, true);
        }

        // Réinitialiser le timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            sendTypingIndicator(conversationId, false);
        }, 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            sendMessage(conversationId, newMessage.trim());
            setNewMessage('');
            setIsTyping(false);
            sendTypingIndicator(conversationId, false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow">
            {/* En-tête */}
            <div className="px-4 py-3 border-b">
                <h2 className="text-lg font-semibold">Chat</h2>
                {typingUsers.size > 0 && (
                    <p className="text-sm text-gray-500 italic">
                        {Array.from(typingUsers).length > 1 
                            ? 'Plusieurs personnes écrivent...'
                            : 'Quelqu\'un écrit...'}
                    </p>
                )}
            </div>

            {/* Zone des messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={message._id}
                        className={`flex ${
                            message.sender === currentUser.uid ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                                message.sender === currentUser.uid
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100'
                            }`}
                        >
                            <p className="break-words">{message.content}</p>
                            <div className="flex items-center justify-end mt-1 space-x-1">
                                <span className="text-xs opacity-75">
                                    {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
                                </span>
                                {message.sender === currentUser.uid && (
                                    <span className="text-xs">
                                        {message.read ? '✓✓' : '✓'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messageEndRef} />
            </div>

            {/* Zone de saisie */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        placeholder="Écrivez votre message..."
                        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        Envoyer
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatSystem;
