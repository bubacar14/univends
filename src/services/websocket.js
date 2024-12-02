class WebSocketService {
    constructor() {
        this.ws = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectTimeout = 1000; // Commence à 1 seconde
    }

    connect(token) {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        const wsUrl = `${process.env.REACT_APP_WS_URL}?token=${token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connecté');
            this.reconnectAttempts = 0;
            this.reconnectTimeout = 1000;
            this.emit('connection_status', { status: 'connected' });
        };

        this.ws.onclose = () => {
            console.log('WebSocket déconnecté');
            this.emit('connection_status', { status: 'disconnected' });
            this.handleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('Erreur WebSocket:', error);
            this.emit('error', error);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.emit(data.type, data);
            } catch (error) {
                console.error('Erreur de parsing du message:', error);
            }
        };
    }

    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Nombre maximum de tentatives de reconnexion atteint');
            return;
        }

        setTimeout(() => {
            console.log(`Tentative de reconnexion ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
            this.reconnectAttempts++;
            this.connect();
            this.reconnectTimeout *= 2; // Backoff exponentiel
        }, this.reconnectTimeout);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        // Retourne une fonction pour se désabonner
        return () => {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.listeners.delete(event);
                }
            }
        };
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    send(type, data) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...data }));
        } else {
            console.error('WebSocket non connecté');
            throw new Error('WebSocket non connecté');
        }
    }

    // Méthodes spécifiques pour le chat
    sendMessage(conversationId, content, attachments = []) {
        this.send('chat_message', {
            conversationId,
            content,
            attachments
        });
    }

    sendTypingIndicator(conversationId, isTyping) {
        this.send('typing', {
            conversationId,
            isTyping
        });
    }

    sendReadReceipt(conversationId, messageId) {
        this.send('read_receipt', {
            conversationId,
            messageId
        });
    }
}

// Créer une instance unique du service
const wsService = new WebSocketService();

export default wsService;
