const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['books', 'electronics', 'furniture', 'clothing', 'other']
  },
  images: [{
    type: String,
    required: true
  }],
  seller: {
    type: String, // Firebase UID
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  favorites: [{
    type: String, // Firebase UID
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour la recherche
productSchema.index({ title: 'text', description: 'text' });

// Méthode pour incrémenter les vues
productSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
