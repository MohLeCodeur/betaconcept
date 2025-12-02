// ========================================
// Configuration Supabase
// ========================================
// IMPORTANT: Remplacez ces valeurs par vos propres clés Supabase
// Pour obtenir vos clés:
// 1. Créez un compte sur https://supabase.com
// 2. Créez un nouveau projet
// 3. Allez dans Settings > API
// 4. Copiez l'URL et la clé anon/public

const SUPABASE_CONFIG = {
    url: 'VOTRE_SUPABASE_URL', // Ex: https://xxxxx.supabase.co
    anonKey: 'VOTRE_SUPABASE_ANON_KEY' // Votre clé publique/anon
};

// ========================================
// Instructions de configuration
// ========================================
/*
ÉTAPE 1: Créer un compte Supabase
- Allez sur https://supabase.com
- Cliquez sur "Start your project"
- Créez un compte gratuit

ÉTAPE 2: Créer un nouveau projet
- Cliquez sur "New Project"
- Donnez un nom à votre projet (ex: "clipboard-manager")
- Choisissez un mot de passe pour la base de données
- Sélectionnez une région proche de vous
- Cliquez sur "Create new project"

ÉTAPE 3: Obtenir vos clés API
- Une fois le projet créé, allez dans Settings > API
- Copiez "Project URL" et remplacez VOTRE_SUPABASE_URL ci-dessus
- Copiez "anon public" key et remplacez VOTRE_SUPABASE_ANON_KEY ci-dessus

ÉTAPE 4: Créer la table dans la base de données
- Allez dans l'onglet "SQL Editor"
- Copiez et exécutez le SQL suivant:

-- Créer la table clipboard_items (PRESSE-PAPIERS PARTAGÉ PUBLIC)
CREATE TABLE clipboard_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index pour améliorer les performances
CREATE INDEX idx_clipboard_created_at ON clipboard_items(created_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE clipboard_items ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut voir tous les items (lecture publique)
CREATE POLICY "Anyone can view all clipboard items"
    ON clipboard_items
    FOR SELECT
    USING (true);

-- Politique: Tout le monde peut insérer des items (écriture publique)
CREATE POLICY "Anyone can insert clipboard items"
    ON clipboard_items
    FOR INSERT
    WITH CHECK (true);

-- Politique: Tout le monde peut supprimer n'importe quel item (suppression publique)
CREATE POLICY "Anyone can delete any clipboard item"
    ON clipboard_items
    FOR DELETE
    USING (true);

ÉTAPE 5: Renommer ce fichier
- Renommez "config.example.js" en "config.js"
- Assurez-vous que vos clés sont correctement configurées

ÉTAPE 6: Tester l'application
- Ouvrez index.html dans votre navigateur
- Inscrivez-vous avec un email et mot de passe
- Commencez à utiliser l'application!
*/
