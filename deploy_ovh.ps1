# Script de déploiement automatique via SSH
$ServerIP = "57.129.115.47"
$User = "rhone"

Write-Host "Connexion au serveur $ServerIP..." -ForegroundColor Green

ssh -t $User@$ServerIP "
    echo '>>> 1. Mise à jour du code...'
    cd ~/kbs
    git fetch origin
    git checkout features
    git pull origin features

    echo '>>> 2. Installation des dépendances Backend...'
    cd backend
    npm install --no-audit

    echo '>>> 3. Installation des dépendances Frontend...'
    cd ../KBS
    npm install --no-audit

    echo '>>> 4. Build du Frontend...'
    npm run build

    echo '>>> 5. Redémarrage des services...'
    pm2 restart all || echo 'PM2 not found or no process to restart'

    echo '>>> DÉPLOIEMENT TERMINÉ ! ✅'
    echo 'N oubliez pas de mettre à jour vos variables .env (SMTP, Google ID) sur le serveur.'
"
