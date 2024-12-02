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

1. Clonez le repository :
```bash
git clone <votre-repo-url>
cd student-marketplace
```

2. Installez les dépendances :
```bash
# Frontend (racine du projet)
npm install

# Backend
cd backend
npm install
```

3. Configurez les variables d'environnement :
- Copiez `.env.example` vers `.env` dans les dossiers frontend et backend
- Remplissez les variables avec vos propres valeurs

4. Démarrez l'application :
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 📱 Fonctionnalités

- 🔐 Authentification avec Firebase
- 📦 Gestion des produits (CRUD)
- 💬 Messagerie en temps réel
- 🖼️ Upload d'images avec Cloudinary
- 🔍 Recherche et filtrage avancés
- ❤️ Système de favoris

## 🌐 Architecture

```
student-marketplace/
├── src/                   # Frontend React
│   ├── components/        # Composants React
│   ├── pages/            # Pages de l'application
│   ├── services/         # Services API
│   └── context/          # Contextes React
│
└── backend/              # Backend Node.js
    ├── config/           # Configurations
    ├── controllers/      # Contrôleurs
    ├── middleware/       # Middleware
    ├── models/           # Modèles Mongoose
    ├── routes/           # Routes API
    └── services/         # Services

```

## 🔒 Sécurité

- Authentification Firebase
- Protection des routes API
- Validation des données
- Gestion sécurisée des fichiers
- Variables d'environnement pour les informations sensibles

## 🚀 Déploiement

- Frontend : Vercel
- Backend : Render/Railway
- Base de données : MongoDB Atlas
- Images : Cloudinary
- Monitoring : Firebase Analytics

## 📝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- Votre nom - Développeur principal
