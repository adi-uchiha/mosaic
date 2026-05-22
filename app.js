/* ============================================================
   Bento New Tab – Application Engine
   Theme: Bentofolio BentoX / Dark Glass
   Architecture: Zero-dependency, HTML-level performance
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// 1. GLOBAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  SHORTCUTS: 'bento_shortcuts',
  THEME:     'bento_theme',
  NAME:      'bento_username',
  SOUND:     'bento_sound',
  ENGINE:    'bento_search_engine',
};

const SEARCH_ENGINES = {
  google:     q => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  github:     q => `https://github.com/search?q=${encodeURIComponent(q)}&type=repositories`,
  duckduckgo: q => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  youtube:    q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
};

const ENGINE_ORDER = ['google', 'github', 'duckduckgo', 'youtube'];

// Warm singleton AudioContext – avoids repeated allocation on every toggle
let _audioCtx = null;

let state = {
  shortcuts:    [],
  theme:        'dark',
  soundEnabled: true,
  engine:       'google',
  dragging:     null,   // currently dragged shortcut id
  editingId:    null,   // shortcut id being edited (null = create)
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. PERSISTENCE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function loadState() {
  state.theme        = ls(STORAGE_KEYS.THEME)   || (
    window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  );
  state.soundEnabled = ls(STORAGE_KEYS.SOUND) !== 'false';
  state.engine       = ls(STORAGE_KEYS.ENGINE) || 'google';
  state.shortcuts    = parseJSON(ls(STORAGE_KEYS.SHORTCUTS), DEFAULT_SHORTCUTS);

  // Restore editable name
  const savedName = ls(STORAGE_KEYS.NAME);
  if (savedName) {
    const el = document.getElementById('user-name');
    if (el) el.textContent = savedName;
  }
}

function saveShortcuts() {
  setls(STORAGE_KEYS.SHORTCUTS, JSON.stringify(state.shortcuts));
}

function ls(key)          { try { return localStorage.getItem(key); } catch { return null; } }
function setls(key, val)  { try { localStorage.setItem(key, val); } catch {} }
function parseJSON(raw, fallback) {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DEFAULT SHORTCUTS
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SHORTCUTS = [];
// Add your own shortcuts via the "New Shortcut" card — they persist in localStorage.

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. THEME ENGINE  (view-transition aware, Web Audio tone)
// ─────────────────────────────────────────────────────────────────────────────

function applyTheme(theme, animate = false) {
  const root = document.documentElement;

  const commit = () => {
    state.theme = theme;
    root.setAttribute('data-theme', theme);
    setls(STORAGE_KEYS.THEME, theme);
    document.getElementById('sun-icon').classList.toggle('hidden', theme !== 'dark');
    document.getElementById('moon-icon').classList.toggle('hidden', theme === 'dark');
  };

  if (animate && document.startViewTransition) {
    // Lock transitions so staggered CSS durations don't glitch
    root.classList.add('theme-transition-lock');
    document.startViewTransition(() => {
      commit();
    }).finished.finally(() => {
      root.classList.remove('theme-transition-lock');
    });
  } else {
    commit();
  }
}

function toggleTheme() {
  const next = state.theme === 'dark' ? 'light' : 'dark';
  if (state.soundEnabled) playTone(next === 'light' ? 880 : 440, next === 'light' ? 440 : 880);
  applyTheme(next, true);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. WEB AUDIO – Ephemeral Synth Tone
// ─────────────────────────────────────────────────────────────────────────────

function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

function playTone(startFreq, endFreq, duration = 0.12) {
  if (!state.soundEnabled) return;
  try {
    const ctx  = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('[BentoTab] Audio blocked:', e.message);
  }
}

function playClick() { playTone(520, 640, 0.06); }
function playDelete() { playTone(400, 280, 0.1); }
function playOpen()   { playTone(660, 880, 0.09); }

// ─────────────────────────────────────────────────────────────────────────────
// 6. CLOCK & GREETING
// ─────────────────────────────────────────────────────────────────────────────

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function updateClock() {
  const now = new Date();
  const h   = now.getHours();
  const m   = now.getMinutes();
  const s   = now.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;

  const clockEl = document.querySelector('.clock-time');
  const ampmEl  = document.querySelector('.clock-ampm');
  if (clockEl) clockEl.textContent = `${pad(h12)}:${pad(m)}:${pad(s)}`;
  if (ampmEl)  ampmEl.textContent  = ampm;

  const dateEl = document.getElementById('live-date');
  if (dateEl) {
    const day  = DAYS[now.getDay()];
    const date = now.getDate();
    const mon  = MONTHS[now.getMonth()];
    const yr   = now.getFullYear();
    dateEl.textContent = `${day}, ${date} ${mon} ${yr}`;
  }

  // Greeting label
  const tagEl = document.getElementById('greeting-time-tag');
  if (tagEl) {
    if (h < 12)      tagEl.textContent = 'morning';
    else if (h < 17) tagEl.textContent = 'afternoon';
    else if (h < 21) tagEl.textContent = 'evening';
    else             tagEl.textContent = 'night';
  }
}

function pad(n) { return String(n).padStart(2, '0'); }

// ─────────────────────────────────────────────────────────────────────────────
// 7. SEARCH ENGINE SWITCHER
// ─────────────────────────────────────────────────────────────────────────────

function setEngine(engine) {
  state.engine = engine;
  setls(STORAGE_KEYS.ENGINE, engine);

  document.querySelectorAll('.engine-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.engine === engine);
  });
  playClick();
}

function handleSearch(e) {
  e.preventDefault();
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  const builder = SEARCH_ENGINES[state.engine] || SEARCH_ENGINES.google;
  window.open(builder(q), '_self');
}



// ─────────────────────────────────────────────────────────────────────────────
// 8. FAVICON RESOLUTION
// ─────────────────────────────────────────────────────────────────────────────

function getDomain(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    let host = u.hostname.toLowerCase();
    
    // Strip common web-app subdomains that block/confuse favicon crawlers (e.g. web.whatsapp.com -> whatsapp.com)
    const prefixes = ['web.', 'app.', 'desktop.', 'm.', 'mobile.'];
    for (const p of prefixes) {
      if (host.startsWith(p)) {
        host = host.slice(p.length);
        break;
      }
    }
    return host;
  } catch {
    return url;
  }
}

function faviconSrc(url, size = 64) {
  const domain = getDomain(url);
  // Google's S2 favicon service — extremely fast, high-res, globally cached
  return `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`;
}

// Build fallback letter badge (SVG data URI – zero HTTP request)
function fallbackFavicon(name) {
  const letter = (name || '?')[0].toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
    <rect width="56" height="56" rx="16" fill="#22c55e"/>
    <text x="28" y="36" font-family="Outfit,system-ui,sans-serif" font-size="24" font-weight="700"
      fill="white" text-anchor="middle" dominant-baseline="middle">${letter}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. SHORTCUT CARD RENDERER
// ─────────────────────────────────────────────────────────────────────────────

function createShortcutCard(shortcut) {
  const card = document.createElement('div');
  card.className = 'bento-card shortcut-card';
  card.id        = `card-${shortcut.id}`;
  card.setAttribute('draggable', 'true');
  card.dataset.id = shortcut.id;

  // Spotlight layer
  const spotlight = document.createElement('div');
  spotlight.className = 'bento-spotlight-both bento-spotlight-inner';
  card.appendChild(spotlight);

  const inner = document.createElement('div');
  inner.className = 'bento-card-inner';

  // Hover action buttons (edit + delete)
  const actions = document.createElement('div');
  actions.className = 'shortcut-actions';
  actions.innerHTML = `
    <button class="action-btn edit" title="Edit shortcut" aria-label="Edit">
      <svg viewBox="0 0 256 256" width="12" height="12">
        <path d="M227.3,73.4,182.6,28.7a16,16,0,0,0-22.6,0L36,152.7A15.9,15.9,0,0,0,31.4,164l-7.3,76.3a8,8,0,0,0,7.9,8.7l76.3-7.3A16,16,0,0,0,119.3,237l123-123A16,16,0,0,0,227.3,73.4Z"
              fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path>
      </svg>
    </button>
    <button class="action-btn delete" title="Remove shortcut" aria-label="Delete">
      <svg viewBox="0 0 256 256" width="12" height="12">
        <polyline points="216 60 40 60" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="18"></polyline>
        <path d="M104,104v96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="18"></path>
        <path d="M152,104v96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="18"></path>
        <path d="M200,60V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V60" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="18"></path>
        <path d="M168,60V40a8,8,0,0,0-8-8H96a8,8,0,0,0-8,8V60" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="18"></path>
      </svg>
    </button>
  `;

  // Favicon wrapper
  const faviconWrapper = document.createElement('div');
  faviconWrapper.className = 'favicon-wrapper';

  const img = document.createElement('img');
  img.className   = 'favicon-img';
  img.src         = faviconSrc(shortcut.url, 64);
  img.alt         = `${shortcut.name} favicon`;
  img.loading     = 'lazy';
  img.decoding    = 'async';
  img.onerror     = function () {
    this.style.display = 'none';
    const fb = document.createElement('div');
    fb.className = 'favicon-fallback';
    fb.textContent = (shortcut.name || '?')[0].toUpperCase();
    faviconWrapper.appendChild(fb);
  };

  faviconWrapper.appendChild(img);

  const name = document.createElement('span');
  name.className   = 'shortcut-name';
  name.textContent = shortcut.name;
  name.title       = shortcut.url;

  inner.appendChild(actions);
  inner.appendChild(faviconWrapper);
  inner.appendChild(name);
  card.appendChild(inner);

  // ── Event Listeners ──────────────────────────────────────────────────

  // Double-click → open URL
  card.addEventListener('dblclick', () => {
    playOpen();
    window.open(shortcut.url, '_self');
  });

  // Single click on body opens URL too (not on action buttons)
  card.addEventListener('click', (e) => {
    if (e.target.closest('.action-btn')) return;
    if (e.detail === 1) {
      // Debounce: single-click also opens (one-click convenience)
      playOpen();
      window.open(shortcut.url, '_self');
    }
  });

  // Edit button
  actions.querySelector('.edit').addEventListener('click', (e) => {
    e.stopPropagation();
    playClick();
    openModal(shortcut.id);
  });

  // Delete button
  actions.querySelector('.delete').addEventListener('click', (e) => {
    e.stopPropagation();
    playDelete();
    deleteShortcut(shortcut.id, card);
  });

  // Spotlight mouse tracking
  attachSpotlight(card, spotlight);

  // Drag & Drop handlers
  card.addEventListener('dragstart', onDragStart);
  card.addEventListener('dragend',   onDragEnd);
  card.addEventListener('dragover',  onDragOver);
  card.addEventListener('dragleave', onDragLeave);
  card.addEventListener('drop',      onDrop);

  // ── Keyboard accessibility ──────────────────────────────────────────
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'link');
  card.setAttribute('aria-label', `Open ${shortcut.name}`);

  // Enter / Space opens the URL (mirrors click behaviour)
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playOpen();
      window.open(shortcut.url, '_self');
    }
    // 'e' key shows edit modal; 'Delete'/'Backspace' deletes
    if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      playClick();
      openModal(shortcut.id);
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      playDelete();
      deleteShortcut(shortcut.id, card);
    }
  });

  return card;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. RENDER SHORTCUTS TO DOM
// ─────────────────────────────────────────────────────────────────────────────

function renderShortcuts() {
  const container = document.getElementById('shortcuts-container');
  const addBtn    = document.getElementById('add-shortcut-trigger');

  // Remove all shortcut cards (keep add button)
  container.querySelectorAll('.shortcut-card').forEach(el => el.remove());

  state.shortcuts.forEach(shortcut => {
    const card = createShortcutCard(shortcut);
    container.insertBefore(card, addBtn);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. DRAG & DROP REORDERING  (HTML5 native – zero deps, GPU-composited)
// ─────────────────────────────────────────────────────────────────────────────

function onDragStart(e) {
  state.dragging = this.dataset.id;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', state.dragging);
}

function onDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.shortcut-card.drag-over').forEach(el => el.classList.remove('drag-over'));
  state.dragging = null;
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (this.dataset.id !== state.dragging) {
    document.querySelectorAll('.shortcut-card.drag-over').forEach(el => el.classList.remove('drag-over'));
    this.classList.add('drag-over');
  }
}

function onDragLeave() {
  this.classList.remove('drag-over');
}

function onDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  const targetId  = this.dataset.id;
  const sourceId  = state.dragging;
  if (!sourceId || sourceId === targetId) return;

  const srcIdx = state.shortcuts.findIndex(s => s.id === sourceId);
  const tgtIdx = state.shortcuts.findIndex(s => s.id === targetId);
  if (srcIdx === -1 || tgtIdx === -1) return;

  // Reorder array
  const [moved] = state.shortcuts.splice(srcIdx, 1);
  state.shortcuts.splice(tgtIdx, 0, moved);
  saveShortcuts();
  renderShortcuts();
  playClick();
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. SPOTLIGHT EFFECT (GPU-composited transform only – zero repaint)
// ─────────────────────────────────────────────────────────────────────────────

function attachSpotlight(card, spotlight) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x    = e.clientX - rect.left - 400;
    const y    = e.clientY - rect.top  - 400;
    spotlight.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}

// Attach spotlight to static cards (greeting, search, add)
function attachStaticSpotlights() {
  document.querySelectorAll('.bento-card:not(.shortcut-card)').forEach(card => {
    const spotlight = card.querySelector('.bento-spotlight-both');
    if (spotlight) attachSpotlight(card, spotlight);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. MODAL – Add / Edit Shortcut
// ─────────────────────────────────────────────────────────────────────────────

function openModal(id = null) {
  state.editingId = id;

  const modal      = document.getElementById('shortcut-modal');
  const titleEl    = document.getElementById('modal-title');
  const nameInput  = document.getElementById('shortcut-name');
  const urlInput   = document.getElementById('shortcut-url');
  const idInput    = document.getElementById('shortcut-id');
  const submitBtn  = document.getElementById('modal-submit-btn');

  if (id) {
    // Edit mode
    const shortcut = state.shortcuts.find(s => s.id === id);
    if (!shortcut) return;
    titleEl.textContent   = 'Edit Shortcut';
    nameInput.value       = shortcut.name;
    urlInput.value        = shortcut.url;
    idInput.value         = shortcut.id;
    submitBtn.textContent = 'Save Changes';
  } else {
    // Create mode
    titleEl.textContent   = 'Add New Shortcut';
    nameInput.value       = '';
    urlInput.value        = '';
    idInput.value         = '';
    submitBtn.textContent = 'Add Shortcut';
  }

  modal.showModal();
  // Focus name after transition
  requestAnimationFrame(() => nameInput.focus());
}

function closeModal() {
  document.getElementById('shortcut-modal').close();
  state.editingId = null;
}

function handleModalSubmit(e) {
  e.preventDefault();

  let name = document.getElementById('shortcut-name').value.trim();
  let url  = document.getElementById('shortcut-url').value.trim();
  const id = document.getElementById('shortcut-id').value;

  if (!name || !url) return;

  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  if (id) {
    // Update existing
    const idx = state.shortcuts.findIndex(s => s.id === id);
    if (idx !== -1) {
      state.shortcuts[idx] = { id, name, url };
    }
  } else {
    // Create new
    state.shortcuts.push({ id: uid(), name, url });
  }

  saveShortcuts();
  renderShortcuts();
  closeModal();
  playClick();
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. DELETE SHORTCUT  (with fade-out micro-animation)
// ─────────────────────────────────────────────────────────────────────────────

function deleteShortcut(id, cardEl) {
  // Animate out
  cardEl.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
  cardEl.style.transform  = 'scale(0.85)';
  cardEl.style.opacity    = '0';

  setTimeout(() => {
    state.shortcuts = state.shortcuts.filter(s => s.id !== id);
    saveShortcuts();
    renderShortcuts();
  }, 240);
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. EDITABLE USER NAME
// ─────────────────────────────────────────────────────────────────────────────

function initEditableName() {
  const el = document.getElementById('user-name');
  if (!el) return;

  // Restore saved name
  const saved = ls(STORAGE_KEYS.NAME);
  if (saved) el.textContent = saved;

  el.addEventListener('blur', () => {
    const val = el.textContent.trim() || 'you';
    el.textContent = val;
    setls(STORAGE_KEYS.NAME, val);
  });

  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
    if (e.key === 'Escape') {
      el.textContent = ls(STORAGE_KEYS.NAME) || 'you';
      el.blur();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. SOUND TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

function initSoundToggle() {
  const btn = document.getElementById('sound-toggle');
  if (!btn) return;

  const applyMuted = () => btn.classList.toggle('muted', !state.soundEnabled);
  applyMuted();

  btn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    setls(STORAGE_KEYS.SOUND, String(state.soundEnabled));
    applyMuted();
    if (state.soundEnabled) playClick();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. KEYBOARD SHORTCUT – '/' focuses search
// ─────────────────────────────────────────────────────────────────────────────

function initGlobalKeys() {
  document.addEventListener('keydown', (e) => {
    // '/' key focuses search (like GitHub/Notion)
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && !e.target.isContentEditable) {
      e.preventDefault();
      document.getElementById('search-input').focus();
    }
    // Escape closes modal
    if (e.key === 'Escape') {
      const modal = document.getElementById('shortcut-modal');
      if (modal.open) closeModal();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. SUPPRESS CHROME'S INJECTED NTP ATTRIBUTION & CUSTOMIZE CHROME BUTTON
//     Chrome force-injects these elements into all extension-controlled NTP
//     pages. The CSS handles static elements; this MutationObserver handles
//     dynamically injected ones that appear after DOMContentLoaded.
// ─────────────────────────────────────────────────────────────────────────────

// Known IDs / tag names Chrome injects into extension NTP pages
const NTP_SUPPRESS_IDS      = new Set(['ntp-app', 'ntp-footer', 'ntp-attribution', 'ntp-most-visited', 'customize-chrome-button']);
const NTP_SUPPRESS_PREFIXES = ['ntp-', 'customize-chrome'];
const NTP_SUPPRESS_TAGS     = new Set(['ntp-app', 'ntp-most-visited', 'cr-toast-manager', 'ntp-customize-dialog']);

function nukeElement(el) {
  if (!el || el.dataset.bentoOwned) return;
  const id  = (el.id  || '').toLowerCase();
  const tag = (el.tagName || '').toLowerCase();
  const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();

  const isInjected = (
    NTP_SUPPRESS_IDS.has(id) ||
    NTP_SUPPRESS_TAGS.has(tag) ||
    NTP_SUPPRESS_PREFIXES.some(p => id.startsWith(p) || cls.includes(p))
  );

  if (isInjected) {
    // Force-hide via inline style (wins over any Chrome stylesheet)
    el.style.cssText = [
      'display:none!important',
      'visibility:hidden!important',
      'opacity:0!important',
      'height:0!important',
      'max-height:0!important',
      'overflow:hidden!important',
      'pointer-events:none!important',
      'position:absolute!important',
      'top:-9999px!important',
      'left:-9999px!important',
    ].join(';');
  }
}

function suppressChromeNTPInjections() {
  // 1. Nuke any elements already in the DOM at this point
  document.querySelectorAll(
    '[id^="ntp-"], [id*="customize-chrome"], ntp-app, ntp-most-visited, cr-toast-manager'
  ).forEach(nukeElement);

  // 2. Watch for anything Chrome injects later (it often appends after load)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1 /* ELEMENT_NODE */) {
          nukeElement(node);
          // Also check children in case Chrome injects a wrapper div
          node.querySelectorAll?.(
            '[id^="ntp-"], [id*="customize-chrome"], ntp-app, cr-toast-manager'
          ).forEach(nukeElement);
        }
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. INIT – Wire everything up on DOMContentLoaded
// ─────────────────────────────────────────────────────────────────────────────

function init() {
  // Kill Chrome's NTP attribution bar & Customize Chrome button first
  suppressChromeNTPInjections();
  loadState();

  // Apply theme immediately (no animation on first load)
  applyTheme(state.theme, false);
  // Remove transition lock after first frame is painted
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('theme-transition-lock');
  });

  // Live clock
  updateClock();
  setInterval(updateClock, 1000);

  // Search engine tabs
  document.querySelectorAll('.engine-tab').forEach(btn => {
    btn.addEventListener('click', () => setEngine(btn.dataset.engine));
  });
  // Restore active engine tab
  setEngine(state.engine);

  // Search form
  const searchForm = document.getElementById('search-form');
  if (searchForm) searchForm.addEventListener('submit', handleSearch);

  // Render shortcuts
  renderShortcuts();

  // Add shortcut trigger
  const addTrigger = document.getElementById('add-shortcut-trigger');
  if (addTrigger) {
    addTrigger.addEventListener('click', () => {
      playClick();
      openModal(null);
    });
    addTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playClick();
        openModal(null);
      }
    });
  }

  // Modal controls
  document.getElementById('shortcut-form').addEventListener('submit', handleModalSubmit);
  document.getElementById('modal-close').addEventListener('click', () => {
    playClick();
    closeModal();
  });
  document.getElementById('modal-cancel-btn').addEventListener('click', () => {
    playClick();
    closeModal();
  });

  // Close modal on backdrop click
  document.getElementById('shortcut-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      playClick();
      closeModal();
    }
  });

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Sound toggle
  initSoundToggle();

  // Editable name
  initEditableName();

  // Global keyboard shortcuts
  initGlobalKeys();

  // Static card spotlights
  attachStaticSpotlights();

  // Auto-focus search
  const si = document.getElementById('search-input');
  if (si) setTimeout(() => si.focus(), 120);

  // ── Tab / Shift+Tab grid navigation ───────────────────────────────────
  // Intercepts Tab globally to cycle focus only through the shortcut grid.
  // When a modal dialog is open, default browser focus trapping behavior is preserved.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    // If modal is open, let user tab naturally within the modal
    const modal = document.getElementById('shortcut-modal');
    if (modal && modal.open) return;

    const cards = [...document.querySelectorAll('#shortcuts-container .shortcut-card, #shortcuts-container .add-card')];
    if (!cards.length) return;

    const focused = document.activeElement;
    const idx = cards.indexOf(focused);

    e.preventDefault();
    if (idx === -1) {
      // If focus is anywhere else, Tab focuses the first card, Shift+Tab focuses the last card
      if (e.shiftKey) {
        cards[cards.length - 1].focus();
      } else {
        cards[0].focus();
      }
    } else {
      if (e.shiftKey) {
        // Shift+Tab → previous card (wraps to last)
        cards[idx === 0 ? cards.length - 1 : idx - 1].focus();
      } else {
        // Tab → next card (wraps to first)
        cards[idx === cards.length - 1 ? 0 : idx + 1].focus();
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
