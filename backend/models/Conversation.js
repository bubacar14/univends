const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String, // Firebase UID
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [{
    type: String, // URL of the attachment
  }],
  readBy: [{
    type: String, // Firebase UID
    ref: 'User'
  }]
}, {
  timestamps: true
});

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: String, // Firebase UID
    required: true,
    ref: 'User'
  }],
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  lastMessage: messageSchema,
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
});

// Index pour la recherche rapide des conversations par participant
conversationSchema.index({ participants: 1 });

// Méthode pour marquer un message comme lu
conversationSchema.methods.markMessageAsRead = async function(messageId, userId) {
  const message = this.messages.id(messageId);
  if (message && !message.readBy.includes(userId)) {
    message.readBy.push(userId);
    
    // Mettre à jour le compteur de messages non lus
    const unreadCount = this.unreadCount.get(userId) || 0;
    if (unreadCount > 0) {
      this.unreadCount.set(userId, unreadCount - 1);
    }
    
    await this.save();
  }
  return this;
};

// Méthode pour ajouter un nouveau message
conversationSchema.methods.addMessage = async function(messageData) {
  const message = {
    ...messageData,
    readBy: [messageData.sender]
  };

  this.messages.push(message);
  this.lastMessage = message;

  // Mettre à jour les compteurs de messages non lus pour tous les participants sauf l'expéditeur
  this.participants.forEach(participantId => {
    if (participantId !== messageData.sender) {
      const currentCount = this.unreadCount.get(participantId) || 0;
      this.unreadCount.set(participantId, currentCount + 1);
    }
  });

  await this.save();
  return this;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
