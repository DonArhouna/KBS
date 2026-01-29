#!/bin/bash

# Script de déploiement pour KBS sur serveur OVH
# Usage: ./deploy.sh

set -e

echo "🚀 Déploiement de KBS sur serveur OVH"
echo "======================================"

# Variables
SERVER_USER="rhone"
SERVER_IP="57.129.115.47"
APP_DIR="/home/rhone/kbs"
REPO_URL="https://github.com/DonArhouna/KBS.git"

echo "📡 Connexion au serveur..."

ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
set -e

echo "🗑️  Nettoyage de l'ancien déploiement..."
# Arrêter les processus PM2 existants
pm2 stop all || true
pm2 delete all || true

# Supprimer l'ancien répertoire
rm -rf ~/kbs

echo "📦 Clonage du nouveau projet..."
cd ~
git clone https://github.com/DonArhouna/KBS.git kbs
cd kbs

echo "🔧 Installation des dépendances..."
npm run install-all

echo "🏗️  Build du frontend..."
cd KBS
npm run build
cd ..

echo "🗄️  Configuration de PostgreSQL..."
# Créer la base de données si elle n'existe pas
sudo -u postgres psql -c "CREATE DATABASE kbservice;" || echo "Database already exists"

# Exécuter les scripts SQL
sudo -u postgres psql -d kbservice -f backend/init-db.sql
sudo -u postgres psql -d kbservice -f backend/add-min-stock-level.sql || true

echo "⚙️  Configuration des variables d'environnement..."
cat > KBS/.env << 'EOF'
VITE_API_BASE_URL=https://keweboutique.com/api
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kbservice
DB_USER=postgres
DB_PASSWORD=Passer123
PORT=3001
EOF

echo "🚀 Démarrage du backend avec PM2..."
cd backend
pm2 start server.js --name kbs-backend
pm2 save
pm2 startup

echo "🌐 Configuration de Nginx..."
sudo tee /etc/nginx/sites-available/kbs > /dev/null << 'NGINXCONF'
server {
    listen 80;
    server_name keweboutique.com www.keweboutique.com;

    location / {
        root /home/rhone/kbs/KBS/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXCONF

sudo ln -sf /etc/nginx/sites-available/kbs /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "� Installation du certificat SSL..."
sudo certbot --nginx -d keweboutique.com -d www.keweboutique.com --non-interactive --agree-tos --email rhonekane@gmail.com || echo "SSL setup skipped (configure manually)"

echo "✅ Déploiement terminé !"
echo "📍 Site: https://keweboutique.com"
echo "📍 Admin: https://keweboutique.com/admin"

ENDSSH

echo "✨ Déploiement réussi !"
