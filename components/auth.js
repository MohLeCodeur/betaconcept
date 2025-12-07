/**
 * Beta Concept Authentication System
 * Système d'authentification partagé pour le site
 */

(function() {
    'use strict';

    const AUTH_KEY = 'beta_auth_user';
    const AUTH_TOKEN_KEY = 'beta_auth_token';

    // Utilisateurs de démonstration (à remplacer par une vraie API)
    // En production, ceci devrait être géré côté serveur
    const DEMO_USERS = [
        { email: 'info@beta-concept.com', password: 'W529hS621pL3s4Zk279@', name: 'Jerry', role: 'client' }

    ];

    /**
     * Connexion utilisateur
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{success: boolean, message?: string, user?: object}>}
     */
    async function login(email, password) {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 500));

        // Rechercher l'utilisateur
        const user = DEMO_USERS.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        );

        if (user) {
            // Créer un token simple (en production, utiliser JWT côté serveur)
            const token = btoa(JSON.stringify({
                email: user.email,
                timestamp: Date.now(),
                expires: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
            }));

            // Sauvegarder la session
            const userData = {
                email: user.email,
                name: user.name,
                role: user.role,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
            localStorage.setItem(AUTH_TOKEN_KEY, token);

            return {
                success: true,
                user: userData
            };
        }

        return {
            success: false,
            message: 'Invalid email or password.'
        };
    }

    /**
     * Déconnexion utilisateur
     */
    function logout() {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        
        // Rediriger vers la page d'accueil
        window.location.href = getBasePath() + 'index.html';
    }

    /**
     * Vérifier si l'utilisateur est connecté
     * @returns {boolean}
     */
    function isLoggedIn() {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const user = localStorage.getItem(AUTH_KEY);

        if (!token || !user) {
            return false;
        }

        try {
            const tokenData = JSON.parse(atob(token));
            
            // Vérifier si le token n'est pas expiré
            if (tokenData.expires < Date.now()) {
                logout();
                return false;
            }

            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Obtenir l'utilisateur actuel
     * @returns {object|null}
     */
    function getCurrentUser() {
        if (!isLoggedIn()) {
            return null;
        }

        try {
            return JSON.parse(localStorage.getItem(AUTH_KEY));
        } catch (e) {
            return null;
        }
    }

    /**
     * Vérifier si l'utilisateur a un rôle spécifique
     * @param {string} role 
     * @returns {boolean}
     */
    function hasRole(role) {
        const user = getCurrentUser();
        return user && user.role === role;
    }

    /**
     * Protéger une page (rediriger si non connecté)
     * @param {string} redirectTo - URL de redirection si non connecté
     */
    function requireAuth(redirectTo) {
        if (!isLoggedIn()) {
            const basePath = getBasePath();
            window.location.href = redirectTo || (basePath + 'index.html');
            return false;
        }
        return true;
    }

    /**
     * Obtenir le chemin de base
     */
    function getBasePath() {
        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length - 1;
        
        if (depth <= 1) {
            return './';
        }
        
        let basePath = '';
        for (let i = 0; i < depth; i++) {
            basePath += '../';
        }
        return basePath;
    }

    // Exposer l'API publique
    window.BetaAuth = {
        login: login,
        logout: logout,
        isLoggedIn: isLoggedIn,
        getCurrentUser: getCurrentUser,
        hasRole: hasRole,
        requireAuth: requireAuth
    };

})();
