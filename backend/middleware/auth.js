const firebaseAdmin = require('../config/firebase-admin');

const authenticateUser = async (req, res, next) => {
  try {
    // Vérifier si Firebase est initialisé
    if (!firebaseAdmin.isInitialized()) {
      console.warn('Firebase non initialisé - Autorisation désactivée');
      req.user = { disabled: true };
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided',
        code: 'auth/no-token'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      disabled: false
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Gestion détaillée des erreurs
    const errorResponse = {
      error: 'Unauthorized',
      code: error.code || 'auth/unknown',
      message: 'Invalid authentication token'
    };

    if (error.code === 'auth/id-token-expired') {
      errorResponse.message = 'Authentication token has expired';
    }

    return res.status(401).json(errorResponse);
  }
};

module.exports = { authenticateUser };
