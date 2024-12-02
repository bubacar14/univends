const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // Limite de 2MB
  }
});

// Créer ou mettre à jour un profil utilisateur
router.post('/profile',
  auth,
  upload.single('profileImage'),
  [
    body('fullName').trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
    body('phone').trim().notEmpty().withMessage('Le numéro de téléphone est requis')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let user = await User.findOne({ uid: req.user.uid });
      const userData = {
        uid: req.user.uid,
        email: req.user.email,
        fullName: req.body.fullName,
        phone: req.body.phone
      };

      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'student-marketplace/profiles' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(req.file.buffer);
        });

        userData.profileImage = {
          url: result.secure_url,
          publicId: result.public_id
        };

        // Supprimer l'ancienne image de profil si elle existe
        if (user?.profileImage?.publicId) {
          await cloudinary.uploader.destroy(user.profileImage.publicId);
        }
      }

      if (user) {
        user = await User.findOneAndUpdate(
          { uid: req.user.uid },
          userData,
          { new: true }
        );
      } else {
        user = new User(userData);
        await user.save();
      }

      res.json(user);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

// Obtenir le profil de l'utilisateur
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid })
      .populate('products')
      .populate('favorites');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir les produits favoris de l'utilisateur
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid })
      .populate('favorites');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user.favorites);
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir les produits de l'utilisateur
router.get('/products', auth, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid })
      .populate('products');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user.products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
