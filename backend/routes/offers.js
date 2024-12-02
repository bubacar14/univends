const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Obtenir toutes les offres (pour un produit ou un utilisateur)
router.get('/', auth, async (req, res) => {
    try {
        const { productId, type } = req.query;
        let query = {};

        if (productId) {
            query.product = productId;
        }

        if (type === 'sent') {
            query.buyer = req.user._id;
        } else if (type === 'received') {
            query.seller = req.user._id;
        }

        const offers = await Offer.find(query)
            .populate('product', 'title images price')
            .populate('buyer', 'fullName profileImage')
            .populate('seller', 'fullName profileImage')
            .sort('-createdAt');

        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Créer une nouvelle offre
router.post('/', auth, async (req, res) => {
    try {
        const { productId, amount } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        // Vérifier si une offre active existe déjà
        const existingOffer = await Offer.findOne({
            product: productId,
            buyer: req.user._id,
            status: 'pending'
        });

        if (existingOffer) {
            return res.status(400).json({ 
                message: 'Vous avez déjà une offre en cours pour ce produit' 
            });
        }

        const offer = new Offer({
            product: productId,
            buyer: req.user._id,
            seller: product.seller,
            amount
        });

        await offer.save();
        
        await offer
            .populate('product', 'title images price')
            .populate('buyer', 'fullName profileImage')
            .populate('seller', 'fullName profileImage')
            .execPopulate();

        res.status(201).json(offer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Répondre à une offre (accepter/refuser)
router.post('/:id/respond', auth, async (req, res) => {
    try {
        const { action } = req.body;
        const offer = await Offer.findOne({
            _id: req.params.id,
            seller: req.user._id,
            status: 'pending'
        });

        if (!offer) {
            return res.status(404).json({ message: 'Offre non trouvée' });
        }

        if (action === 'accept') {
            offer.status = 'accepted';
        } else if (action === 'reject') {
            offer.status = 'rejected';
        } else {
            return res.status(400).json({ message: 'Action invalide' });
        }

        await offer.save();
        
        await offer
            .populate('product', 'title images price')
            .populate('buyer', 'fullName profileImage')
            .populate('seller', 'fullName profileImage')
            .execPopulate();

        res.json(offer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Faire une contre-offre
router.post('/:id/counter', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        const offer = await Offer.findOne({
            _id: req.params.id,
            $or: [{ seller: req.user._id }, { buyer: req.user._id }],
            status: 'pending'
        });

        if (!offer) {
            return res.status(404).json({ message: 'Offre non trouvée' });
        }

        offer.counterOffers.push({
            amount,
            proposedBy: req.user._id
        });

        await offer.save();
        
        await offer
            .populate('product', 'title images price')
            .populate('buyer', 'fullName profileImage')
            .populate('seller', 'fullName profileImage')
            .execPopulate();

        res.json(offer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Marquer une offre comme complétée
router.post('/:id/complete', auth, async (req, res) => {
    try {
        const offer = await Offer.findOne({
            _id: req.params.id,
            seller: req.user._id,
            status: 'accepted'
        });

        if (!offer) {
            return res.status(404).json({ message: 'Offre non trouvée' });
        }

        offer.status = 'completed';
        await offer.save();
        
        await offer
            .populate('product', 'title images price')
            .populate('buyer', 'fullName profileImage')
            .populate('seller', 'fullName profileImage')
            .execPopulate();

        res.json(offer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
