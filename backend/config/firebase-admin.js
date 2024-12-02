const admin = require('firebase-admin');
require('dotenv').config();

let serviceAccount;
try {
  // Parse the service account JSON
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  
  // Si la private_key est une chaîne JSON échappée, la formater correctement
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key
      .replace(/\\n/g, '\n')
      .replace(/\"/g, '');
  }
} catch (error) {
  console.error('Error parsing Firebase service account:', error);
  serviceAccount = {};
}

if (!serviceAccount.project_id) {
  console.warn('Warning: Firebase service account not properly configured');
}

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

module.exports = admin;
