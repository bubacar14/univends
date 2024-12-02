const admin = require('firebase-admin');
require('dotenv').config();

// Initialisation de Firebase Admin avec les informations d'identification du service
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

if (!serviceAccount.project_id) {
  console.warn('Warning: Firebase service account not properly configured');
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

module.exports = admin;
