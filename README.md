# KB&S - Plateforme E-commerce avec Gestion de Stock

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

Plateforme e-commerce complète avec système de gestion de stock avancé, développée avec React (Vite) et Node.js (Express).

## 🚀 Fonctionnalités

### Front-Office (Client)
- 🛍️ Catalogue de produits avec filtres par catégorie
- 🛒 Panier d'achat dynamique
- 📦 Système de commande avec suivi
- 🗺️ Carte interactive (Mapbox) pour localisation
- 💬 Chatbot intégré pour assistance client
- 📱 Design responsive et moderne

### Back-Office (Administration)
- 📊 **Gestion de Stock Complète**
  - Vue d'ensemble avec KPI (En stock, Stock faible, Ruptures)
  - Historique des mouvements de stock (Entrées/Sorties/Ajustements)
  - Système d'alertes automatiques (stock faible/rupture)
  - Configuration des seuils d'alerte par produit
- 🏷️ Gestion des produits et catégories
- 📋 Gestion des commandes
- 📄 Génération de devis et factures (PDF)
- 🎨 Personnalisation du contenu du site
- 📧 Notifications WhatsApp et Email

## 🛠️ Stack Technique

### Frontend (`/KBS`)
- **Framework**: React 18 + Vite
- **Langage**: TypeScript
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Maps**: Mapbox GL
- **PDF**: jsPDF + html2canvas

### Backend (`/backend`)
- **Runtime**: Node.js
- **Framework**: Express 5
- **Base de données**: PostgreSQL
- **ORM**: pg (node-postgres)
- **Upload**: Multer
- **Env**: dotenv

## 📦 Installation

### Prérequis
- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm ou yarn

### 1. Cloner le projet
```bash
git clone https://github.com/DonArhouna/KBS.git
cd KBS
```

### 2. Installer les dépendances
```bash
# Installation globale (frontend + backend)
npm run install-all

# OU manuellement
cd backend && npm install
cd ../KBS && npm install
```

### 3. Configuration de la base de données

Créez une base de données PostgreSQL nommée `KBService` :
```sql
CREATE DATABASE KBService;
```

Créez un fichier `.env` dans le dossier `KBS/` :
```env
VITE_API_BASE_URL=http://localhost:3001/api
DB_HOST=localhost
DB_PORT=5432
DB_NAME=KBService
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
PORT=3001
```

### 4. Initialiser la base de données

**Option 1 - Via l'interface Admin** (Recommandé)
1. Démarrez le backend : `cd backend && npm start`
2. Démarrez le frontend : `cd KBS && npm run dev`
3. Accédez à `/admin` (mot de passe: `kbs2024admin`)
4. Cliquez sur "Initialiser la base de données"

**Option 2 - Manuellement**
```bash
# Exécutez le script SQL
psql -U postgres -d KBService -f backend/init-db.sql

# Ajoutez la colonne manquante (si nécessaire)
psql -U postgres -d KBService -f backend/add-min-stock-level.sql
```

## 🚀 Démarrage

### Mode Développement
```bash
# Démarrer frontend et backend simultanément
npm run dev

# OU séparément
npm run backend  # Backend sur http://localhost:3001
npm run frontend # Frontend sur http://localhost:5173
```

### Mode Production
```bash
# Build du frontend
npm run build

# Le backend reste en mode production
cd backend && npm start
```

## 📁 Structure du Projet

```
KBS/
├── backend/                 # API Express
│   ├── server.js           # Point d'entrée
│   ├── init-db.sql         # Schéma de la base de données
│   └── ImagesSite/         # Stockage des images uploadées
├── KBS/                    # Application React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   │   ├── admin/      # Composants d'administration
│   │   │   └── ui/         # Composants UI (Shadcn)
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   ├── hooks/          # Hooks personnalisés
│   │   └── lib/            # Utilitaires
│   └── public/             # Assets statiques
└── package.json            # Scripts racine
```

## 🔑 Accès Admin

- **URL**: `http://localhost:5173/admin`
- **Mot de passe**: `kbs2024admin`

## 📊 API Endpoints

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/stock` - État du stock
- `POST /api/products` - Créer un produit
- `PUT /api/products/:id` - Modifier un produit
- `DELETE /api/products/:id` - Supprimer un produit

### Stock
- `GET /api/stock-movements` - Historique des mouvements
- `POST /api/stock-movements` - Créer un mouvement
- `GET /api/stock-alerts` - Alertes actives
- `PUT /api/stock-alerts/:id/resolve` - Résoudre une alerte
- `PUT /api/products/:id/stock-settings` - Modifier les seuils

### Commandes
- `GET /api/orders` - Liste des commandes
- `POST /api/orders` - Créer une commande

## 🐛 Dépannage

### Erreur 500 sur `/api/products/stock`
Si vous rencontrez une erreur "column min_stock_level does not exist" :
```bash
psql -U postgres -d KBService -f backend/add-min-stock-level.sql
```

### Le backend ne démarre pas
Vérifiez que PostgreSQL est en cours d'exécution et que les credentials dans `.env` sont corrects.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📝 License

MIT © 2024 KB&S

## 👨‍💻 Auteur

**DonArhouna**
- GitHub: [@DonArhouna](https://github.com/DonArhouna)