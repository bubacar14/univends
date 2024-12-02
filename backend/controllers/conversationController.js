const Conversation = require('../models/Conversation');
const Product = require('../models/Product');

// Obtenir toutes les conversations d'un utilisateur
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.uid,
      status: { $ne: 'deleted' }
    })
    .populate('product', 'title images price')
    .sort('-updatedAt');

    res.json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Error retrieving conversations' });
  }
};

// Créer une nouvelle conversation
exports.createConversation = async (req, res) => {
  try {
    const { productId, message } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Vérifier si une conversation existe déjà
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user.uid, product.seller] },
      product: productId,
      status: 'active'
    });

    if (existingConversation) {
      return res.status(400).json({ 
        error: 'Conversation already exists',
        conversationId: existingConversation._id 
      });
    }

    // Créer une nouvelle conversation
    const conversation = new Conversation({
      participants: [req.user.uid, product.seller],
      product: productId
    });

    // Ajouter le premier message
    if (message) {
      await conversation.addMessage({
        sender: req.user.uid,
        content: message
      });
    }

    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Error creating conversation' });
  }
};

// Obtenir les messages d'une conversation
exports.getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Vérifier que l'utilisateur est un participant
    if (!conversation.participants.includes(req.user.uid)) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' });
    }

    res.json(conversation.messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Error retrieving messages' });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { content, attachments } = req.body;
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Vérifier que l'utilisateur est un participant
    if (!conversation.participants.includes(req.user.uid)) {
      return res.status(403).json({ error: 'Not authorized to send messages in this conversation' });
    }

    await conversation.addMessage({
      sender: req.user.uid,
      content,
      attachments
    });

    // Émettre un événement WebSocket pour la mise à jour en temps réel
    req.app.get('io').to(conversation._id.toString()).emit('newMessage', {
      conversationId: conversation._id,
      message: conversation.lastMessage
    });

    res.json(conversation.lastMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
};

// Marquer les messages comme lus
exports.markAsRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Vérifier que l'utilisateur est un participant
    if (!conversation.participants.includes(req.user.uid)) {
      return res.status(403).json({ error: 'Not authorized to access this conversation' });
    }

    // Marquer tous les messages non lus comme lus
    const unreadMessages = conversation.messages.filter(
      msg => !msg.readBy.includes(req.user.uid)
    );

    for (const message of unreadMessages) {
      await conversation.markMessageAsRead(message._id, req.user.uid);
    }

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Error marking messages as read' });
  }
};

// Archiver/Supprimer une conversation
exports.updateConversationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Vérifier que l'utilisateur est un participant
    if (!conversation.participants.includes(req.user.uid)) {
      return res.status(403).json({ error: 'Not authorized to modify this conversation' });
    }

    conversation.status = status;
    await conversation.save();

    res.json({ message: 'Conversation status updated', status });
  } catch (error) {
    console.error('Error updating conversation status:', error);
    res.status(500).json({ error: 'Error updating conversation status' });
  }
};
