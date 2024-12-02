import { useEffect, useCallback } from 'react';
import wsService from '../services/websocket';

export const useWebSocket = (events = {}) => {
    useEffect(() => {
        // Enregistrer tous les événements
        const unsubscribes = Object.entries(events).map(([event, callback]) => {
            return wsService.on(event, callback);
        });

        // Nettoyer les abonnements
        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    }, [events]);

    const sendMessage = useCallback((conversationId, content, attachments) => {
        wsService.sendMessage(conversationId, content, attachments);
    }, []);

    const sendTypingIndicator = useCallback((conversationId, isTyping) => {
        wsService.sendTypingIndicator(conversationId, isTyping);
    }, []);

    const sendReadReceipt = useCallback((conversationId, messageId) => {
        wsService.sendReadReceipt(conversationId, messageId);
    }, []);

    return {
        sendMessage,
        sendTypingIndicator,
        sendReadReceipt,
        wsService
    };
};

export default useWebSocket;
