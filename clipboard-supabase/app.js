// ========================================
// Supabase Client Initialization
// ========================================
let supabase;

// Initialize Supabase
function initSupabase() {
    try {
        supabase = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        console.log('✅ Supabase initialized - Mode Presse-Papiers Partagé Public');
        updateUIForPublicMode();
        loadClipboardHistory();
        setupRealtimeSubscription();
    } catch (error) {
        console.error('❌ Erreur initialisation Supabase:', error);
        showToast('Erreur de configuration. Vérifiez config.js', 'error');
    }
}

// ========================================
// Public Mode UI
// ========================================
function updateUIForPublicMode() {
    const authSection = document.querySelector('.auth-section');
    const syncStatus = document.getElementById('sync-status');

    // Hide authentication section
    if (authSection) {
        authSection.style.display = 'none';
    }

    // Update sync status
    syncStatus.textContent = 'Partagé ☁️';
    syncStatus.style.color = 'var(--success)';
}

// ========================================
// Clipboard Operations
// ========================================
let clipboardHistory = [];

async function captureClipboard() {
    try {
        const text = await navigator.clipboard.readText();

        if (!text || text.trim() === '') {
            showToast('Le presse-papiers est vide', 'warning');
            return;
        }

        // Check if already exists in recent history
        const isDuplicate = clipboardHistory.some(item =>
            item.content === text &&
            (Date.now() - new Date(item.created_at).getTime()) < 5000
        );

        if (isDuplicate) {
            showToast('Cet élément a déjà été ajouté récemment', 'warning');
            return;
        }

        await saveToSupabase(text);
        showToast('✅ Sauvegardé et partagé!', 'success');
    } catch (error) {
        console.error('Erreur capture:', error);
        showToast('Erreur: Autorisez l\'accès au presse-papiers', 'error');
    }
}

async function saveToSupabase(content) {
    try {
        const { data, error } = await supabase
            .from('clipboard_items')
            .insert([
                {
                    content: content,
                    content_type: 'text',
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) throw error;

        // Add to local array for immediate UI update
        if (data && data[0]) {
            clipboardHistory.unshift(data[0]);
            updateHistoryUI();
            updateStats();
        }
    } catch (error) {
        console.error('Erreur sauvegarde Supabase:', error);
        showToast('Erreur de sauvegarde cloud', 'error');
    }
}

async function loadClipboardHistory() {
    try {
        const { data, error } = await supabase
            .from('clipboard_items')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        clipboardHistory = data || [];
        updateHistoryUI();
        updateStats();
    } catch (error) {
        console.error('Erreur chargement:', error);
        showToast('Erreur de chargement', 'error');
    }
}

async function deleteItem(itemId) {
    try {
        const { error } = await supabase
            .from('clipboard_items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;

        clipboardHistory = clipboardHistory.filter(item => item.id !== itemId);
        updateHistoryUI();
        updateStats();
        showToast('Élément supprimé', 'success');
    } catch (error) {
        console.error('Erreur suppression:', error);
        showToast('Erreur de suppression', 'error');
    }
}

async function clearAllHistory() {
    if (!confirm('Voulez-vous vraiment supprimer TOUT l\'historique partagé ?\n(Cela affectera tous les utilisateurs)')) {
        return;
    }

    try {
        // Delete all items from the table
        const { error } = await supabase
            .from('clipboard_items')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

        if (error) throw error;

        clipboardHistory = [];
        updateHistoryUI();
        updateStats();
        showToast('Historique partagé effacé', 'success');
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de la suppression', 'error');
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('📋 Copié!', 'success');
    } catch (error) {
        console.error('Erreur copie:', error);
        showToast('Erreur de copie', 'error');
    }
}

// ========================================
// Realtime Subscription
// ========================================
let realtimeChannel;

function setupRealtimeSubscription() {
    // Unsubscribe from previous channel if exists
    if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
    }

    realtimeChannel = supabase
        .channel('public_clipboard_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'clipboard_items'
            },
            (payload) => {
                console.log('Realtime update:', payload);

                if (payload.eventType === 'INSERT') {
                    // Check if not already in local array (avoid duplicates)
                    const exists = clipboardHistory.some(item => item.id === payload.new.id);
                    if (!exists) {
                        clipboardHistory.unshift(payload.new);
                        updateHistoryUI();
                        updateStats();
                        showToast('📋 Nouveau élément ajouté par un autre utilisateur', 'success');
                    }
                } else if (payload.eventType === 'DELETE') {
                    clipboardHistory = clipboardHistory.filter(item => item.id !== payload.old.id);
                    updateHistoryUI();
                    updateStats();
                }
            }
        )
        .subscribe();
}

// ========================================
// UI Updates
// ========================================
function updateHistoryUI() {
    const historyList = document.getElementById('history-list');
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;

    let filteredHistory = clipboardHistory;

    // Apply search filter
    if (searchTerm) {
        filteredHistory = filteredHistory.filter(item =>
            item.content.toLowerCase().includes(searchTerm)
        );
    }

    // Apply time filter
    const now = new Date();
    if (activeFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filteredHistory = filteredHistory.filter(item =>
            new Date(item.created_at) >= today
        );
    } else if (activeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredHistory = filteredHistory.filter(item =>
            new Date(item.created_at) >= weekAgo
        );
    }

    if (filteredHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>Aucun élément trouvé</h3>
                <p>${searchTerm ? 'Essayez une autre recherche' : 'Commencez par copier du texte et cliquez sur "Coller & Sauvegarder"'}</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = filteredHistory.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="item-header">
                <span class="item-date">${formatDate(item.created_at)}</span>
                <div class="item-actions">
                    <button class="btn btn-icon" onclick="copyToClipboard(\`${escapeHtml(item.content)}\`)" title="Copier">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M3 11V3C3 2.44772 3.44772 2 4 2H10" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                    </button>
                    <button class="btn btn-icon" onclick="deleteItem('${item.id}')" title="Supprimer">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 4H14M6 4V2H10V4M3 4L4 14H12L13 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="item-content">${escapeHtml(truncateText(item.content, 200))}</div>
        </div>
    `).join('');
}

function updateStats() {
    const totalItems = clipboardHistory.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayItems = clipboardHistory.filter(item =>
        new Date(item.created_at) >= today
    ).length;

    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('today-items').textContent = todayItems;
}

function clearHistoryUI() {
    clipboardHistory = [];
    updateHistoryUI();
    updateStats();
}

// ========================================
// Utility Functions
// ========================================
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;

    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// Event Listeners
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase
    initSupabase();

    // Clipboard capture
    document.getElementById('paste-btn').addEventListener('click', captureClipboard);

    // Keyboard shortcut (Ctrl+V)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'v' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            captureClipboard();
        }
    });

    // Search
    const searchInput = document.getElementById('search-input');
    const clearSearch = document.getElementById('clear-search');

    searchInput.addEventListener('input', (e) => {
        clearSearch.style.display = e.target.value ? 'block' : 'none';
        updateHistoryUI();
    });

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.style.display = 'none';
        updateHistoryUI();
    });

    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateHistoryUI();
        });
    });

    // Clear all
    document.getElementById('clear-all-btn').addEventListener('click', clearAllHistory);
});
