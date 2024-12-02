const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const productController = require('../controllers/productController');
const conversationController = require('../controllers/conversationController');

// Routes publiques des produits
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProduct);

// Routes protégées
router.use(authenticateUser); // Applique l'authentification à toutes les routes suivantes

// Routes des produits
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.post('/products/:id/favorite', productController.toggleFavorite);

// Routes des conversations
router.get('/conversations', conversationController.getConversations);
router.post('/conversations', conversationController.createConversation);
router.get('/conversations/:id/messages', conversationController.getMessages);
router.post('/conversations/:id/messages', conversationController.sendMessage);
router.post('/conversations/:id/read', conversationController.markAsRead);
router.put('/conversations/:id/status', conversationController.updateConversationStatus);

// Routes du profil utilisateur
router.get('/profile', async (req, res) => {
  const { uid, email, emailVerified } = req.user;
  res.json({ uid, email, emailVerified });
});

module.exports = router;
