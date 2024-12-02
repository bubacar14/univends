const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');

// Obtenir toutes les conversations d'un utilisateur
router.get('/', auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
        .populate('participants', 'fullName profileImage')
        .populate('product', 'title images price')
        .sort('-updatedAt');

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Créer une nouvelle conversation
router.post('/', auth, async (req, res) => {
    try {
        const { participantId, productId, initialMessage } = req.body;

        // Vérifier si une conversation existe déjà
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, participantId] },
            product: productId
        });

        if (conversation) {
            return res.status(400).json({ 
                message: 'Une conversation existe déjà' 
            });
        }

        conversation = new Conversation({
            participants: [req.user._id, participantId],
            product: productId,
            messages: [{
                sender: req.user._id,
                content: initialMessage
            }],
            lastMessage: {
                sender: req.user._id,
                content: initialMessage
            }
        });

        await conversation.save();
        
        await conversation
            .populate('participants', 'fullName profileImage')
            .populate('product', 'title images price');

        res.status(201).json(conversation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Obtenir les messages d'une conversation
router.get('/:id/messages', auth, async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            participants: req.user._id
        }).populate('messages.sender', 'fullName profileImage');

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation non trouvée' });
        }

        res.json(conversation.messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ajouter un message à une conversation
router.post('/:id/messages', auth, async (req, res) => {
    try {
        const { content, attachments } = req.body;
        
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            participants: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation non trouvée' });
        }

        const newMessage = {
            sender: req.user._id,
            content,
            attachments
        };

        conversation.messages.push(newMessage);
        conversation.lastMessage = newMessage;
        
        await conversation.save();
        
        await conversation
            .populate('messages.sender', 'fullName profileImage')
            .execPopulate();

        const populatedMessage = conversation.messages[conversation.messages.length - 1];
        
        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Marquer les messages comme lus
router.post('/:id/read', auth, async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            participants: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation non trouvée' });
        }

        // Marquer tous les messages non lus comme lus
        conversation.messages.forEach(message => {
            if (message.sender.toString() !== req.user._id.toString()) {
                message.read = true;
            }
        });

        await conversation.save();
        res.json({ message: 'Messages marqués comme lus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
