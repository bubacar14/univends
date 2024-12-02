# UniVends - Student Marketplace

UniVends est une plateforme de marketplace mobile-first conçue spécifiquement pour les étudiants universitaires, leur permettant d'acheter et de vendre des produits au sein de leur communauté.

## 🚀 Technologies Utilisées

### Frontend
- React.js (avec Vite)
- Tailwind CSS
- Socket.IO Client (pour le chat en temps réel)
- Firebase Authentication

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Socket.IO
- Cloudinary (gestion des images)

## 🛠️ Installation

### Prérequis
- Node.js (v18+)
- npm ou yarn
- Compte Firebase
- Compte MongoDB Atlas

### Configuration

1. Clonez le repository
```bash
git clone https://github.com/votre-username/student-marketplace.git
cd student-marketplace
```

2. Installez les dépendances
```bash
npm install
```

3. Configurez les variables d'environnement
Créez un fichier `.env` avec les variables suivantes :
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_MONGODB_URI=your_mongodb_connection_string
```

### Démarrage du développement
```bash
npm run dev
```

## 🌐 Déploiement

### Vercel
1. Connectez votre compte GitHub à Vercel
2. Importez le repository
3. Configurez les variables d'environnement dans les paramètres du projet

### Render
1. Créez un nouveau service Web
2. Connectez votre compte GitHub
3. Sélectionnez le repository
4. Configuration recommandée :
   - Build Command: `npm run build`
   - Start Command: `npm run start`
   - Ajoutez les variables d'environnement

## 🤝 Contributions

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :
1. Fork du repository
2. Créez une branche de fonctionnalité
3. Commitez vos modifications
4. Poussez votre branche
5. Ouvrez une Pull Request

## 📄 Licence
Ce projet est sous licence MIT.
