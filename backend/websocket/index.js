const WebSocket = require('ws');
const admin = require('firebase-admin');
const Conversation = require('../models/Conversation');

function initializeWebSocket(server) {
    const wss = new WebSocket.Server({ server });
    
    // Stockage des connexions actives
    const clients = new Map();

    wss.on('connection', async (ws, req) => {
        try {
            // Extraire le token du query string
            const token = new URL(req.url, 'http://localhost').searchParams.get('token');
            if (!token) {
                ws.close(1008, 'Token manquant');
                return;
            }

            // Vérifier le token
            const decodedToken = await admin.auth().verifyIdToken(token);
            const userId = decodedToken.uid;
            
            // Stocker la connexion
            clients.set(userId, ws);

            // Gérer les messages
            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data);
                    
                    switch (message.type) {
                        case 'chat_message':
                            await handleChatMessage(message, userId, clients);
                            break;
                        case 'typing':
                            await handleTypingIndicator(message, userId, clients);
                            break;
                        case 'read_receipt':
                            await handleReadReceipt(message, userId, clients);
                            break;
                    }
                } catch (error) {
                    console.error('Erreur de traitement du message:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        error: 'Erreur de traitement du message'
                    }));
                }
            });

            // Gérer la déconnexion
            ws.on('close', () => {
                clients.delete(userId);
                broadcastUserStatus(userId, 'offline', clients);
            });

            // Envoyer la confirmation de connexion
            ws.send(JSON.stringify({
                type: 'connection_established',
                userId: userId
            }));

            // Diffuser le statut en ligne
            broadcastUserStatus(userId, 'online', clients);

        } catch (error) {
            console.error('Erreur de connexion WebSocket:', error);
            ws.close(1008, 'Erreur d\'authentification');
        }
    });

    return wss;
}

async function handleChatMessage(message, senderId, clients) {
    try {
        const { conversationId, content, attachments } = message;
        
        // Sauvegarder le message dans la base de données
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throw new Error('Conversation non trouvée');
        }

        const newMessage = {
            sender: senderId,
            content,
            attachments,
            timestamp: new Date()
        };

        conversation.messages.push(newMessage);
        conversation.lastMessage = newMessage;
        await conversation.save();

        // Envoyer le message à tous les participants
        conversation.participants.forEach(participantId => {
            const client = clients.get(participantId.toString());
            if (client && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'new_message',
                    conversationId,
                    message: newMessage
                }));
            }
        });

    } catch (error) {
        console.error('Erreur lors du traitement du message:', error);
        throw error;
    }
}

async function handleTypingIndicator(message, userId, clients) {
    const { conversationId, isTyping } = message;
    
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Envoyer l'indicateur de frappe aux autres participants
        conversation.participants.forEach(participantId => {
            if (participantId.toString() !== userId) {
                const client = clients.get(participantId.toString());
                if (client && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'typing_indicator',
                        conversationId,
                        userId,
                        isTyping
                    }));
                }
            }
        });
    } catch (error) {
        console.error('Erreur lors du traitement de l\'indicateur de frappe:', error);
    }
}

async function handleReadReceipt(message, userId, clients) {
    const { conversationId, messageId } = message;
    
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Mettre à jour le statut de lecture du message
        const messageToUpdate = conversation.messages.id(messageId);
        if (messageToUpdate) {
            messageToUpdate.read = true;
            await conversation.save();

            // Notifier l'expéditeur original
            const sender = messageToUpdate.sender.toString();
            const senderClient = clients.get(sender);
            if (senderClient && senderClient.readyState === WebSocket.OPEN) {
                senderClient.send(JSON.stringify({
                    type: 'read_receipt',
                    conversationId,
                    messageId,
                    readBy: userId
                }));
            }
        }
    } catch (error) {
        console.error('Erreur lors du traitement de l\'accusé de lecture:', error);
    }
}

function broadcastUserStatus(userId, status, clients) {
    // Informer tous les clients connectés du changement de statut
    clients.forEach((client, clientId) => {
        if (clientId !== userId && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'user_status',
                userId,
                status
            }));
        }
    });
}

module.exports = initializeWebSocket;
