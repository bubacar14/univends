const admin = require('firebase-admin');
require('dotenv').config();

let firebaseInitialized = false;

const initializeFirebase = () => {
  try {
    // Vérifier si Firebase est déjà initialisé
    if (admin.apps.length) {
      console.log('Firebase Admin déjà initialisé');
      return true;
    }

    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountStr) {
      console.warn('FIREBASE_SERVICE_ACCOUNT non défini');
      return false;
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountStr);
    } catch (error) {
      console.error('Erreur lors du parsing du service account:', error);
      return false;
    }

    if (!serviceAccount.project_id || !serviceAccount.private_key) {
      console.warn('Service account incomplet');
      return false;
    }

    // Nettoyer la private_key
    serviceAccount.private_key = serviceAccount.private_key
      .replace(/\\n/g, '\n')
      .replace(/\"/g, '')
      .trim();

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('Firebase Admin initialisé avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase:', error);
    return false;
  }
};

// Tenter d'initialiser Firebase
firebaseInitialized = initializeFirebase();

// Exporter une version sécurisée de l'admin
module.exports = {
  auth: () => {
    if (!firebaseInitialized) {
      throw new Error('Firebase non initialisé');
    }
    return admin.auth();
  },
  firestore: () => {
    if (!firebaseInitialized) {
      throw new Error('Firebase non initialisé');
    }
    return admin.firestore();
  },
  messaging: () => {
    if (!firebaseInitialized) {
      throw new Error('Firebase non initialisé');
    }
    return admin.messaging();
  },
  isInitialized: () => firebaseInitialized
};
