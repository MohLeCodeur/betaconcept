/**
 * Login Overlay Component
 * Composant partagé pour le formulaire de connexion "Sign in below"
 * Utilisé par toutes les pages du site
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        redirectAfterLogin: 'account/login/index.html', // Page après connexion réussie (chemin relatif)
        passwordResetPath: 'account/password-reset/index.html'
    };

    // Déterminer le chemin de base selon la profondeur de la page
    function getBasePath() {
        const path = window.location.pathname;
        
        // Trouver l'index de "betaconcept" dans le chemin
        const betaconceptIndex = path.toLowerCase().indexOf('/betaconcept/');
        
        if (betaconceptIndex !== -1) {
            // Extraire le chemin relatif après "betaconcept/"
            const relativePath = path.substring(betaconceptIndex + '/betaconcept/'.length);
            
            // Si on est à la racine du projet
            if (!relativePath || relativePath === 'index.html') {
                return './';
            }
            
            // Compter les dossiers dans le chemin relatif
            const segments = relativePath.split('/').filter(s => s && !s.endsWith('.html'));
            
            let basePath = '';
            for (let i = 0; i < segments.length; i++) {
                basePath += '../';
            }
            
            return basePath || './';
        }
        
        // Fallback pour serveur web standard
        if (path === '/' || path === '/index.html') {
            return './';
        }
        
        const segments = path.split('/').filter(s => s && !s.endsWith('.html'));
        let basePath = '';
        for (let i = 0; i < segments.length; i++) {
            basePath += '../';
        }
        
        return basePath || './';
    }

    // Template HTML du formulaire de login
    function getLoginOverlayHTML() {
        const basePath = getBasePath();
        
        // Styles CSS pour garantir l'alignement sur toutes les pages
        const overlayStyles = `
            <style id="login-overlay-styles">
                #login-overlay .client-inner {
                    float: none !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    text-align: center !important;
                }
                #login-overlay h3 {
                    text-align: center !important;
                    width: 100% !important;
                    margin-bottom: 20px !important;
                }
                #login-overlay .login-form {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    width: 100% !important;
                }
                #login-overlay .login-form .in-text {
                    width: 100% !important;
                    max-width: 300px !important;
                    box-sizing: border-box !important;
                    margin-bottom: 10px !important;
                    margin-left: auto !important;
                    margin-right: auto !important;
                }
                #login-overlay .input-row {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    width: 100% !important;
                    max-width: 340px !important;
                    margin-bottom: 10px !important;
                }
                #login-overlay .input-row .in-text {
                    flex: 1 !important;
                    margin-bottom: 0 !important;
                }
                #login-overlay .paste-btn {
                    padding: 10px 12px !important;
                    background: #8f2829 !important;
                    color: #fff !important;
                    border: none !important;
                    border-radius: 4px !important;
                    cursor: pointer !important;
                    font-size: 12px !important;
                    white-space: nowrap !important;
                }
                #login-overlay .paste-btn:hover {
                    background: #6b1e1f !important;
                }
                #login-overlay .clear-btn {
                    display: none;
                    padding: 4px 8px !important;
                    background: transparent !important;
                    color: #999 !important;
                    border: none !important;
                    cursor: pointer !important;
                    font-size: 16px !important;
                    line-height: 1 !important;
                }
                #login-overlay .clear-btn:hover {
                    color: #e74c3c !important;
                }
                #login-overlay .clear-btn.visible {
                    display: inline-block !important;
                }
                #login-overlay .login-form .btn {
                    width: 100% !important;
                    max-width: 300px !important;
                    margin-left: auto !important;
                    margin-right: auto !important;
                }
                #login-overlay .user-links {
                    text-align: center !important;
                    width: 100% !important;
                    margin-top: 15px !important;
                }
                #login-overlay .login-error {
                    width: 100% !important;
                    max-width: 300px !important;
                    text-align: center !important;
                }
            </style>
        `;
        
        return `
            ${overlayStyles}
            <div class="client-overlay-wrap" aria-hidden="true" id="login-overlay">
                <div class="client-inner">
                    <button type="button" class="close-overlay">
                        <span class="font-ico-close"></span>
                        <span class="sr-only">Close client overlay</span>
                    </button>
                    <h3>Sign in below</h3>

                    <form class="form login-form" id="login-form" method="post">
                        <div class="validation-summary-valid" data-valmsg-summary="true">
                            <ul>
                                <li style="display:none"></li>
                            </ul>
                        </div>
                        <div class="login-error" id="login-error" style="display: none; color: #e74c3c;"></div>
                        <div class="input-row">
                            <input 
                                class="in-text" 
                                data-val="true"
                                data-val-required="The User name field is required." 
                                id="client-email" 
                                name="Username"
                                placeholder="Email address" 
                                type="email" 
                                value="info@beta-concept.com" 
                                required
                            />
                            <button type="button" class="paste-btn" data-target="client-email">Paste</button>
                            <button type="button" class="clear-btn" data-target="client-email">✕</button>
                        </div>
                        <div class="input-row">
                            <input 
                                class="in-text" 
                                data-val="true"
                                data-val-length="The field Password must be a string with a maximum length of 256."
                                data-val-length-max="256" 
                                data-val-required="The Password field is required."
                                id="client-password" 
                                maxlength="256" 
                                name="Password" 
                                placeholder="Password" 
                                type="password"
                                value="" 
                                readonly
                                required
                            />
                            <button type="button" class="paste-btn" data-target="client-password">Paste</button>
                            <button type="button" class="clear-btn" data-target="client-password">✕</button>
                        </div>
                        <button type="submit" class="btn keep-overlay-open">Login</button>
                    </form>
                    <div class="user-links">
                        <a href="${basePath}${CONFIG.passwordResetPath}">Forgot your password?</a>
                    </div>
                </div>
            </div>
        `;
    }

    // Injecter le formulaire de login dans la page
    function injectLoginOverlay() {
        // Vérifier si le overlay existe déjà
        if (document.getElementById('login-overlay')) {
            return;
        }

        // Trouver le header ou créer un conteneur
        const header = document.querySelector('header.header');
        if (header) {
            // Supprimer l'ancien overlay s'il existe
            const existingOverlay = header.querySelector('.client-overlay-wrap');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            // Injecter le nouveau overlay
            header.insertAdjacentHTML('beforeend', getLoginOverlayHTML());
        } else {
            // Si pas de header, ajouter au body
            document.body.insertAdjacentHTML('beforeend', getLoginOverlayHTML());
        }

        // Initialiser les événements
        initLoginEvents();
    }

    // Initialiser les événements du formulaire
    function initLoginEvents() {
        const overlay = document.getElementById('login-overlay');
        const form = document.getElementById('login-form');
        const closeBtn = overlay?.querySelector('.close-overlay');

        // Ouvrir l'overlay
        document.querySelectorAll('.js-open-client').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                openLoginOverlay();
            });
        });

        // Fermer l'overlay
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                closeLoginOverlay();
            });
        }

        // Fermer en cliquant en dehors
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    closeLoginOverlay();
                }
            });
        }

        // Fermer avec Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLoginOverlay();
            }
        });

        // Soumission du formulaire
        if (form) {
            form.addEventListener('submit', handleLogin);
        }

        // Boutons Paste - coller depuis le presse-papiers
        document.querySelectorAll('.paste-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                if (targetInput) {
                    try {
                        const text = await navigator.clipboard.readText();
                        if (text && text.trim().length > 0) {
                            targetInput.value = text.trim();
                            // Afficher la croix pour le mot de passe
                            const clearBtn = this.parentElement.querySelector('.clear-btn');
                            if (clearBtn) {
                                clearBtn.classList.add('visible');
                            }
                        }
                    } catch (err) {
                        console.error('Clipboard access error:', err);
                    }
                }
            });
        });

        // Boutons Clear - effacer le champ
        document.querySelectorAll('.clear-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                if (targetInput) {
                    targetInput.value = '';
                    this.classList.remove('visible');
                }
            });
        });

        // Afficher la croix quand on saisit dans le champ email
        const emailInput = document.getElementById('client-email');
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                const clearBtn = this.parentElement.querySelector('.clear-btn');
                if (clearBtn) {
                    if (this.value.length > 0) {
                        clearBtn.classList.add('visible');
                    } else {
                        clearBtn.classList.remove('visible');
                    }
                }
            });
        }
    }

    // Ouvrir l'overlay de login
    function openLoginOverlay() {
        const overlay = document.getElementById('login-overlay');
        if (overlay) {
            overlay.classList.add('open');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Focus sur le premier champ
            const emailInput = overlay.querySelector('#client-email');
            if (emailInput) {
                setTimeout(() => emailInput.focus(), 100);
            }
        }
    }

    // Fermer l'overlay de login
    function closeLoginOverlay() {
        const overlay = document.getElementById('login-overlay');
        if (overlay) {
            overlay.classList.remove('open');
            overlay.classList.remove('full-page-login');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    // Gérer la soumission du formulaire de login
    async function handleLogin(e) {
        e.preventDefault();

        const form = e.target;
        const email = form.querySelector('#client-email').value.trim();
        const password = form.querySelector('#client-password').value;
        const errorDiv = document.getElementById('login-error');
        const submitBtn = form.querySelector('button[type="submit"]');

        // Reset error
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
        }

        // Validation basique
        if (!email || !password) {
            showLoginError('Please fill in all fields.');
            return;
        }

        // Désactiver le bouton pendant le traitement
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
        }

        try {
            // Appeler le système d'authentification
            const result = await window.BetaAuth.login(email, password);

            if (result.success) {
                // Redirection après connexion réussie
                const basePath = getBasePath();
                window.location.href = basePath + CONFIG.redirectAfterLogin;
            } else {
                showLoginError(result.message || 'Invalid credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showLoginError('An error occurred. Please try again.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        }
    }

    // Afficher une erreur de login
    function showLoginError(message) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    // Mettre à jour l'UI selon l'état de connexion
    function updateUIForAuthState() {
        const isLoggedIn = window.BetaAuth && window.BetaAuth.isLoggedIn();
        const clientButtons = document.querySelectorAll('.js-open-client');

        clientButtons.forEach(btn => {
            if (isLoggedIn) {
                const user = window.BetaAuth.getCurrentUser();
                btn.innerHTML = `<span>My Account</span>`;
                btn.onclick = function(e) {
                    e.preventDefault();
                    const basePath = getBasePath();
                    window.location.href = basePath + 'account/login/index.html';
                };
            }
        });
    }

    // Initialisation au chargement du DOM
    function init() {
        injectLoginOverlay();
        updateUIForAuthState();
    }

    // Exécuter l'initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exposer les fonctions publiques
    window.LoginOverlay = {
        open: openLoginOverlay,
        close: closeLoginOverlay,
        updateUI: updateUIForAuthState
    };

})();
