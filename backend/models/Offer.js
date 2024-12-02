const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired', 'completed'],
        default: 'pending'
    },
    counterOffers: [{
        amount: Number,
        proposedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(+new Date() + 24*60*60*1000) // Expire après 24h
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    }
}, { timestamps: true });

// Index pour la recherche rapide des offres
offerSchema.index({ product: 1, buyer: 1, seller: 1 });
offerSchema.index({ status: 1, expiresAt: 1 });

// Middleware pour vérifier automatiquement si l'offre a expiré
offerSchema.pre('save', function(next) {
    if (this.status === 'pending' && this.expiresAt < new Date()) {
        this.status = 'expired';
    }
    next();
});

module.exports = mongoose.model('Offer', offerSchema);
