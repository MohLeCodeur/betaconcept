# 📋 ClipSync - Presse-Papiers Partagé Public

Application web pour partager votre presse-papiers avec tout le monde en temps réel via Supabase.

## ✨ Fonctionnalités

- 📋 **Capture du presse-papiers** - Sauvegardez et partagez votre contenu copié
- ☁️ **Presse-papiers partagé** - Tout le monde voit les mêmes éléments
- 🔍 **Recherche puissante** - Trouvez rapidement ce que vous cherchez
- 🎨 **Interface moderne** - Design élégant avec dark mode et animations
- 📱 **Responsive** - Fonctionne parfaitement sur mobile et desktop
- ⚡ **Temps réel** - Synchronisation instantanée pour tous les utilisateurs
- 💾 **Stockage gratuit** - Jusqu'à 500 MB avec Supabase
- 🌍 **Public** - Pas besoin de compte, accessible à tous

## 🚀 Installation Rapide

### Étape 1: Télécharger les fichiers

Assurez-vous d'avoir tous les fichiers du projet :
- `index.html`
- `style.css`
- `app.js`
- `config.example.js`

### Étape 2: Créer un compte Supabase (Gratuit)

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"**
3. Créez un compte gratuit (avec Google, GitHub, ou email)

### Étape 3: Créer un nouveau projet

1. Une fois connecté, cliquez sur **"New Project"**
2. Remplissez les informations :
   - **Name**: `clipboard-manager` (ou votre choix)
   - **Database Password**: Choisissez un mot de passe fort
   - **Region**: Choisissez la région la plus proche de vous
3. Cliquez sur **"Create new project"**
4. Attendez 1-2 minutes que le projet soit créé

### Étape 4: Obtenir vos clés API

1. Dans votre projet Supabase, allez dans **Settings** (icône ⚙️ en bas à gauche)
2. Cliquez sur **API** dans le menu
3. Vous verrez deux informations importantes :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (une longue chaîne de caractères)

### Étape 5: Configurer la base de données

1. Dans Supabase, cliquez sur **SQL Editor** (icône 📝 dans le menu)
2. Cliquez sur **"New query"**
3. Copiez et collez ce code SQL :

```sql
- Créer la table clipboard_items
CREATE TABLE clipboard_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer des index pour améliorer les performances
CREATE INDEX idx_clipboard_user_id ON clipboard_items(user_id);
CREATE INDEX idx_clipboard_created_at ON clipboard_items(created_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE clipboard_items ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir uniquement leurs propres items
CREATE POLICY "Users can view their own clipboard items"
    ON -clipboard_items
    FOR SELECT
    USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent insérer leurs propres items
CREATE POLICY "Users can insert their own clipboard items"
    ON clipboard_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent supprimer leurs propres items
CREATE POLICY "Users can delete their own clipboard items"
    ON clipboard_items
    FOR DELETE
    USING (auth.uid() = user_id);
```

4. Cliquez sur **"Run"** (ou appuyez sur Ctrl+Enter)
5. Vous devriez voir "Success. No rows returned"

### Étape 6: Configurer l'application

1. **Renommez** `config.example.js` en `config.js`
2. **Ouvrez** `config.js` dans un éditeur de texte
3. **Remplacez** les valeurs :

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co', // Votre Project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Votre anon key
};
```

4. **Sauvegardez** le fichier

### Étape 7: Lancer l'application

1. Ouvrez `index.html` dans votre navigateur
2. Cliquez sur **"Inscription"**
3. Créez un compte avec votre email et un mot de passe (minimum 6 caractères)
4. Vérifiez votre email pour confirmer (si demandé)
5. Connectez-vous et commencez à utiliser l'application ! 🎉

## 📖 Utilisation

### Capturer du contenu

1. **Copiez** du texte n'importe où (Ctrl+C ou Cmd+C)
2. Cliquez sur **"Coller & Sauvegarder"** dans l'application
3. Votre contenu est sauvegardé et synchronisé ! ✅

### Rechercher dans l'historique

- Utilisez la **barre de recherche** pour trouver du contenu
- Filtrez par **Aujourd'hui** ou **Cette semaine**

### Copier depuis l'historique

- Cliquez sur l'icône **📋** à côté d'un élément pour le copier

### Supprimer des éléments

- Cliquez sur l'icône **🗑️** pour supprimer un élément
- Utilisez **"Tout effacer"** pour vider l'historique

### Synchronisation multi-appareils

1. Connectez-vous avec le **même compte** sur un autre appareil
2. Votre historique se synchronise **automatiquement** ! ☁️

## 🛠️ Technologies Utilisées

- **HTML5** - Structure
- **CSS3** - Design moderne avec glassmorphism
- **JavaScript (Vanilla)** - Logique de l'application
- **Supabase** - Backend as a Service
  - Authentification
  - Base de données PostgreSQL
  - Synchronisation temps réel
  - Row Level Security (RLS)

## 🔒 Sécurité

- ✅ Authentification sécurisée avec Supabase Auth
- ✅ Row Level Security (RLS) - Chaque utilisateur ne voit que ses données
- ✅ Connexion HTTPS
- ✅ Pas de stockage de mots de passe en clair

## 📱 Compatibilité

- ✅ Chrome, Firefox, Safari, Edge (versions récentes)
- ✅ Mobile (iOS Safari, Chrome Android)
- ⚠️ Nécessite HTTPS pour l'API Clipboard (ou localhost)

## 🐛 Dépannage

### "Erreur de configuration"
- Vérifiez que `config.js` existe (pas `config.example.js`)
- Vérifiez que vos clés Supabase sont correctes

### "Autorisez l'accès au presse-papiers"
- Certains navigateurs nécessitent HTTPS
- Sur localhost, cela devrait fonctionner
- Autorisez l'accès quand le navigateur le demande

### "Erreur de sauvegarde cloud"
- Vérifiez votre connexion Internet
- Vérifiez que la table est bien créée dans Supabase
- Vérifiez que les politiques RLS sont actives

### L'historique ne se synchronise pas
- Assurez-vous d'être connecté avec le même compte
- Vérifiez votre connexion Internet
- Rafraîchissez la page

## 💡 Conseils

- 🔐 Utilisez un **mot de passe fort** pour votre compte
- 💾 L'historique fonctionne aussi **hors ligne** (stockage local)
- 🔄 La synchronisation se fait **automatiquement** quand vous êtes en ligne
- 📊 Limite de **100 éléments** chargés par défaut (modifiable dans le code)

## 📄 Licence

Ce projet est libre d'utilisation pour un usage personnel et éducatif.

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez la section **Dépannage** ci-dessus
2. Consultez la [documentation Supabase](https://supabase.com/docs)
3. Vérifiez la console du navigateur (F12) pour les erreurs

---

Fait avec ❤️ - Profitez de votre gestionnaire de presse-papiers !
