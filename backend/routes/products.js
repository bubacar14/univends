const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/auth');

// Configuration de multer pour le stockage temporaire des images
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

// Obtenir tous les produits avec pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const products = await Product.find(query)
      .populate('seller', 'fullName phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un nouveau produit
router.post('/', 
  auth,
  upload.array('images', 5),
  [
    body('title').trim().isLength({ min: 3 }).withMessage('Le titre doit contenir au moins 3 caractères'),
    body('description').trim().isLength({ min: 10 }).withMessage('La description doit contenir au moins 10 caractères'),
    body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
    body('category').isIn(['Livres', 'Électronique', 'Meubles', 'Vêtements', 'Autres']).withMessage('Catégorie invalide')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const imageUploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'student-marketplace' },
            (error, result) => {
              if (error) reject(error);
              else resolve({ url: result.secure_url, publicId: result.public_id });
            }
          );

          stream.end(file.buffer);
        });
      });

      const uploadedImages = await Promise.all(imageUploadPromises);

      const product = new Product({
        ...req.body,
        images: uploadedImages,
        seller: req.user.uid
      });

      await product.save();

      // Ajouter le produit à la liste des produits de l'utilisateur
      await User.findOneAndUpdate(
        { uid: req.user.uid },
        { $push: { products: product._id } }
      );

      res.status(201).json(product);
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

// Mettre à jour un produit
router.put('/:id',
  auth,
  [
    body('title').optional().trim().isLength({ min: 3 }),
    body('description').optional().trim().isLength({ min: 10 }),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().isIn(['Livres', 'Électronique', 'Meubles', 'Vêtements', 'Autres']),
    body('status').optional().isIn(['disponible', 'vendu', 'réservé'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Produit non trouvé' });
      }

      if (product.seller.toString() !== req.user.uid) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      Object.assign(product, req.body);
      await product.save();

      res.json(product);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

// Supprimer un produit
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    if (product.seller.toString() !== req.user.uid) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Supprimer les images de Cloudinary
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await product.remove();

    // Retirer le produit de la liste des produits de l'utilisateur
    await User.findOneAndUpdate(
      { uid: req.user.uid },
      { $pull: { products: product._id } }
    );

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Liker/Unliker un produit
router.post('/:id/like', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isLiked = product.likes.includes(user._id);
    if (isLiked) {
      product.likes.pull(user._id);
      user.favorites.pull(product._id);
    } else {
      product.likes.push(user._id);
      user.favorites.push(product._id);
    }

    await Promise.all([product.save(), user.save()]);

    res.json({ liked: !isLiked });
  } catch (error) {
    console.error('Erreur lors du like/unlike:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
