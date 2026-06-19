/* =========================================================
   BigQuery Release Notes – app.js
   ========================================================= */

const $ = (id) => document.getElementById(id);

// ---- State -----------------------------------------------
let allEntries   = [];
let selectedIds  = new Set();

// ---- DOM refs --------------------------------------------
const refreshBtn      = $('refreshBtn');
const spinnerIcon     = $('spinnerIcon');
const refreshLabel    = $('refreshLabel');
const entriesGrid     = $('entriesGrid');
const skeletonGrid    = $('skeletonGrid');
const errorBanner     = $('errorBanner');
const errorMessage    = $('errorMessage');
const entryCount      = $('entryCount');
const tweetBar        = $('tweetBar');
const tweetBarCount   = $('tweetBarCount');
const clearSelBtn     = $('clearSelectionBtn');
const tweetBtn        = $('tweetBtn');
const tweetModal      = $('tweetModal');
const tweetText       = $('tweetText');
const charCount       = $('charCount');
const charCounter     = document.querySelector('.char-counter');
const modalClose      = $('modalClose');
const modalCancel     = $('modalCancel');
const modalTweetBtn   = $('modalTweetBtn');

// ---- Helpers ---------------------------------------------
function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year:  'numeric',
      month: 'short',
      day:   'numeric',
    }).format(new Date(iso));
  } catch (_) {
    return iso.slice(0, 10);
  }
}

function truncate(text, max = 200) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

// ---- Fetch -----------------------------------------------
async function loadReleaseNotes() {
  setLoading(true);
  hideError();

  try {
    const res = await fetch('/api/release-notes');
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || 'Unknown server error');
    }

    allEntries = data.entries;
    selectedIds.clear();
    renderEntries(allEntries);
    updateTweetBar();
    entryCount.textContent = `${allEntries.length} entries`;
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

// ---- UI State --------------------------------------------
function setLoading(loading) {
  refreshBtn.disabled = loading;
  refreshBtn.classList.toggle('spinning', loading);
  refreshLabel.textContent = loading ? 'Refreshing…' : 'Refresh';
  skeletonGrid.style.display = loading ? 'grid' : 'none';
  if (loading) entriesGrid.innerHTML = '';
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorBanner.hidden = false;
}
function hideError() {
  errorBanner.hidden = true;
}

// ---- Render ----------------------------------------------
function renderEntries(entries) {
  entriesGrid.innerHTML = '';

  if (!entries.length) {
    entriesGrid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4m0 4h.01"/>
        </svg>
        <p>No release notes found.</p>
      </div>`;
    return;
  }

  entries.forEach((entry, idx) => {
    const card = buildCard(entry, idx);
    entriesGrid.appendChild(card);
  });
}

function buildCard(entry, idx) {
  const card = document.createElement('article');
  card.className = 'entry-card';
  card.style.animationDelay = `${Math.min(idx * 35, 300)}ms`;
  card.dataset.id = entry.id;

  const isSelected = selectedIds.has(entry.id);
  if (isSelected) card.classList.add('selected');

  const dateStr = formatDate(entry.updated);
  const plainBody = stripHtml(entry.body);
  const shortBody = truncate(plainBody, 180);

  card.innerHTML = `
    <div class="card-header">
      <input
        type="checkbox"
        class="card-checkbox"
        id="chk-${idx}"
        aria-label="Select: ${escAttr(entry.title)}"
        ${isSelected ? 'checked' : ''}
      />
      <label for="chk-${idx}" class="card-title">${escHtml(entry.title)}</label>
    </div>
    ${dateStr ? `<span class="card-date">📅 ${escHtml(dateStr)}</span>` : ''}
    <div class="card-body">${shortBody ? escHtml(shortBody) : '<em>No description available.</em>'}</div>
    <div class="card-footer">
      ${entry.link && entry.link !== '#'
        ? `<a class="card-link" href="${escAttr(entry.link)}" target="_blank" rel="noopener noreferrer">
             View on Google Cloud ↗
           </a>`
        : '<span></span>'}
      <button class="card-tweet-btn" data-id="${escAttr(entry.id)}" title="Tweet this update">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
        Tweet
      </button>
    </div>`;

  // Checkbox toggle
  const chk = card.querySelector('.card-checkbox');
  chk.addEventListener('change', () => toggleSelection(entry.id, chk.checked, card));

  // Card-level single tweet button
  const tBtn = card.querySelector('.card-tweet-btn');
  tBtn.addEventListener('click', () => openTweetModal([entry]));

  return card;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escAttr(s) {
  return String(s).replace(/"/g, '&quot;');
}

// ---- Selection -------------------------------------------
function toggleSelection(id, checked, card) {
  if (checked) {
    selectedIds.add(id);
    card.classList.add('selected');
  } else {
    selectedIds.delete(id);
    card.classList.remove('selected');
  }
  updateTweetBar();
}

function clearSelection() {
  selectedIds.clear();
  document.querySelectorAll('.card-checkbox').forEach(cb => { cb.checked = false; });
  document.querySelectorAll('.entry-card.selected').forEach(c => c.classList.remove('selected'));
  updateTweetBar();
}

function updateTweetBar() {
  const count = selectedIds.size;
  tweetBar.classList.toggle('visible', count > 0);
  tweetBarCount.textContent = count === 1
    ? '1 update selected'
    : `${count} updates selected`;
}

// ---- Tweet Modal -----------------------------------------
function buildTweetText(entries) {
  if (entries.length === 1) {
    const e = entries[0];
    const plain = stripHtml(e.body);
    const snippet = truncate(plain, 120);
    const parts = [`📢 BigQuery Update: ${e.title}`];
    if (snippet) parts.push(snippet);
    if (e.link && e.link !== '#') parts.push(e.link);
    parts.push('#BigQuery #GoogleCloud');
    return parts.join('\n\n').slice(0, 280);
  }

  // Multiple entries
  const titles = entries.slice(0, 3).map(e => `• ${e.title}`).join('\n');
  const more = entries.length > 3 ? `\n+${entries.length - 3} more` : '';
  return `📢 BigQuery updates:\n${titles}${more}\n\n#BigQuery #GoogleCloud`.slice(0, 280);
}

function openTweetModal(entries) {
  const text = buildTweetText(entries);
  tweetText.value = text;
  updateCharCount();
  tweetModal.hidden = false;
  tweetText.focus();
}

function closeTweetModal() {
  tweetModal.hidden = true;
}

function updateCharCount() {
  const len = tweetText.value.length;
  charCount.textContent = len;
  charCounter.classList.toggle('warn',   len >= 230 && len < 260);
  charCounter.classList.toggle('danger', len >= 260);
}

function doTweet() {
  const text = tweetText.value.trim();
  if (!text) return;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=420');
  closeTweetModal();
}

// ---- Event Listeners -------------------------------------
refreshBtn.addEventListener('click', loadReleaseNotes);

clearSelBtn.addEventListener('click', clearSelection);

tweetBtn.addEventListener('click', () => {
  const entries = allEntries.filter(e => selectedIds.has(e.id));
  if (entries.length) openTweetModal(entries);
});

tweetText.addEventListener('input', updateCharCount);

modalClose.addEventListener('click', closeTweetModal);
modalCancel.addEventListener('click', closeTweetModal);
modalTweetBtn.addEventListener('click', doTweet);

tweetModal.addEventListener('click', (e) => {
  if (e.target === tweetModal) closeTweetModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !tweetModal.hidden) closeTweetModal();
});

// ---- Init ------------------------------------------------
loadReleaseNotes();
