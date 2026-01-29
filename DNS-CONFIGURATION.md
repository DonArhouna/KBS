# Configuration DNS pour keweboutique.com

## Étapes à suivre dans votre espace client OVH

### 1. Accéder à la zone DNS
1. Connectez-vous à votre [espace client OVH](https://www.ovh.com/manager/)
2. Allez dans **Web Cloud** > **Noms de domaine**
3. Sélectionnez **keweboutique.com**
4. Cliquez sur l'onglet **Zone DNS**

### 2. Configurer les enregistrements DNS

Ajoutez ou modifiez les enregistrements suivants :

#### Enregistrement A (domaine principal)
```
Type    : A
Sous-domaine : (vide ou @)
Cible   : 57.129.115.47
TTL     : 3600
```

#### Enregistrement A (www)
```
Type    : A
Sous-domaine : www
Cible   : 57.129.115.47
TTL     : 3600
```

### 3. Sauvegarder et attendre la propagation

- Cliquez sur **Ajouter une entrée** ou **Modifier**
- Sauvegardez vos modifications
- ⏰ **Délai de propagation** : 4 à 24 heures (généralement 1-2h)

### 4. Vérifier la configuration

Après quelques heures, testez avec :
```bash
# Vérifier la résolution DNS
nslookup keweboutique.com
nslookup www.keweboutique.com

# Ou avec dig
dig keweboutique.com
dig www.keweboutique.com
```

Les deux doivent pointer vers **57.129.115.47**

## Configuration Optionnelle

### Redirection www vers non-www (ou inverse)
Si vous voulez que `www.keweboutique.com` redirige vers `keweboutique.com`, Nginx s'en chargera automatiquement avec le certificat SSL.

### Enregistrement MX (Email)
Si vous voulez utiliser des emails @keweboutique.com, configurez les enregistrements MX selon votre fournisseur d'email.
