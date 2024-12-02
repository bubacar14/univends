const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function addProduct() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Créer un nouveau produit
    const newProduct = new Product({
      title: 'Livre de Mathématiques Avancées',
      description: 'Livre en excellent état, utilisé seulement un semestre. Idéal pour les étudiants en sciences.',
      price: 25,
      category: 'books',
      images: [
        'https://example.com/livre-mathematiques.jpg'
      ],
      seller: 'exemple-firebase-uid', // Remplacez par un UID Firebase réel
      status: 'available'
    });

    // Sauvegarder le produit
    const savedProduct = await newProduct.save();
    console.log('Produit ajouté avec succès :', savedProduct);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit :', error);
  } finally {
    // Fermer la connexion MongoDB
    await mongoose.connection.close();
  }
}

// Exécuter la fonction
addProduct();
