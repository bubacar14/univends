import { getDatabase, ref, onValue, push, set, query, orderByChild, equalTo } from 'firebase/database';
import { app } from '../config/firebase';

const db = getDatabase(app);

export const messagesService = {
  // Créer une nouvelle conversation
  createConversation: async (senderId, receiverId, productId) => {
    const conversationsRef = ref(db, 'conversations');
    const newConversationRef = push(conversationsRef);
    const conversation = {
      participants: [senderId, receiverId],
      productId,
      lastMessage: null,
      timestamp: Date.now()
    };
    await set(newConversationRef, conversation);
    return newConversationRef.key;
  },

  // Envoyer un message
  sendMessage: async (conversationId, senderId, content) => {
    const messagesRef = ref(db, `messages/${conversationId}`);
    const newMessageRef = push(messagesRef);
    const message = {
      senderId,
      content,
      timestamp: Date.now()
    };
    await set(newMessageRef, message);

    // Mettre à jour le dernier message de la conversation
    const conversationRef = ref(db, `conversations/${conversationId}`);
    await set(conversationRef, {
      lastMessage: content,
      lastMessageTimestamp: Date.now()
    });
  },

  // S'abonner aux messages d'une conversation
  subscribeToMessages: (conversationId, callback) => {
    const messagesRef = ref(db, `messages/${conversationId}`);
    return onValue(messagesRef, (snapshot) => {
      const messages = [];
      snapshot.forEach((child) => {
        messages.push({
          id: child.key,
          ...child.val()
        });
      });
      callback(messages);
    });
  },

  // Récupérer les conversations d'un utilisateur
  getUserConversations: (userId, callback) => {
    const conversationsRef = ref(db, 'conversations');
    const userConversationsQuery = query(
      conversationsRef,
      orderByChild('participants'),
      equalTo(userId)
    );
    return onValue(userConversationsQuery, (snapshot) => {
      const conversations = [];
      snapshot.forEach((child) => {
        conversations.push({
          id: child.key,
          ...child.val()
        });
      });
      callback(conversations);
    });
  },

  // Marquer les messages comme lus
  markConversationAsRead: async (conversationId, userId) => {
    const messagesRef = ref(db, `messages/${conversationId}`);
    const unreadMessagesQuery = query(
      messagesRef,
      orderByChild('read'),
      equalTo(false)
    );
    onValue(unreadMessagesQuery, async (snapshot) => {
      const updates = {};
      snapshot.forEach((child) => {
        if (child.val().senderId !== userId) {
          updates[`${child.key}/read`] = true;
        }
      });
      if (Object.keys(updates).length > 0) {
        await set(ref(db, `messages/${conversationId}`), updates);
      }
    });
  }
};
