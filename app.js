'use strict';

(() => {
  // This is a convenience gate, not real access control: both values ship in
  // the public website. Use a private backend for data that must be protected.
  const LOGIN_USERNAME = 'admin';
  const LOGIN_PASSWORD = 'homejournal';
  const JOURNAL_KEY = 'our-home-journal.v1';
  const SESSION_KEY = 'our-home-journal.unlocked';
  const categories = [
    'Planning & design', 'Approvals & permits', 'Site preparation', 'Foundation',
    'Structure & masonry', 'Electrical', 'Plumbing', 'Waterproofing', 'Flooring & tiles',
    'Doors & windows', 'Painting & finishes', 'Interiors', 'Landscaping & exterior',
    'Materials & shopping', 'Payments & bills', 'Other'
  ];

  const $ = (selector) => document.querySelector(selector);
  const loginScreen = $('#login-screen');
  const appScreen = $('#app-screen');
  const loginForm = $('#login-form');
  const entryDialog = $('#entry-dialog');
  const entryForm = $('#entry-form');
  const monthFilter = $('#month-filter');
  const categoryFilter = $('#category-filter');
  const searchInput = $('#search-input');
  const journalList = $('#journal-list');
  const emptyState = $('#empty-state');
  const costSummary = $('#cost-summary');
  const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });
  const fullDateFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const currencyFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
  const statuses = ['In progress', 'Planned', 'Completed', 'On hold'];
  const formFields = {
    title: 'title', cost: 'cost', budget: 'budget', timeSpent: 'time',
    location: 'location', vendor: 'vendor', shop: 'shop', details: 'details',
    alternatives: 'alternatives', comments: 'comments', link: 'link'
  };
  let entries = loadEntries();
  let editingId = null;
  let costMode = false;

  function loadEntries() {
    try {
      const saved = localStorage.getItem(JOURNAL_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || !parsed.every(isEntry)) {
        throw new Error('The saved journal contains invalid entries.');
      }
      return parsed;
    } catch (error) {
      console.error('Could not read the saved journal.', error);
      window.setTimeout(() => window.alert('Your saved journal could not be read. The original data was not changed. If you have a JSON backup, use Import backup after signing in.'), 0);
      return [];
    }
  }

  function isValidDate(dateText) {
    if (typeof dateText !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return false;
    const [year, month, day] = dateText.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function isEntry(item) {
    return item && typeof item === 'object'
      && typeof item.id === 'string'
      && typeof item.title === 'string'
      && isValidDate(item.date)
      && categories.includes(item.category)
      && statuses.includes(item.status)
      && ['cost', 'budget'].every((field) => item[field] === '' || (typeof item[field] === 'number' && Number.isFinite(item[field]) && item[field] >= 0))
      && ['timeSpent', 'location', 'vendor', 'shop', 'details', 'alternatives', 'comments', 'link'].every((field) => item[field] === undefined || typeof item[field] === 'string');
  }

  function saveEntries(nextEntries) {
    try {
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(nextEntries));
      entries = nextEntries;
      return true;
    } catch (error) {
      console.error('Could not save the journal to this browser.', error);
      window.alert('Your changes could not be saved in this browser. Check available storage and try again. Your previous journal has been kept.');
      return false;
    }
  }

  function formatCurrency(amount) {
    return `₹${currencyFormatter.format(Number(amount) || 0)}`;
  }

  function formatDate(dateText) {
    const [year, month, day] = dateText.split('-').map(Number);
    return new Date(year, month - 1, day, 12);
  }

  function monthKey(dateText) {
    return dateText.slice(0, 7);
  }

  function monthName(dateText) {
    return monthFormatter.format(formatDate(dateText));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function safeLink(value) {
    if (!value) return '';
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }

  function updateMonthOptions() {
    const previous = monthFilter.value || monthKey(localDateString());
    const availableMonths = new Set(entries.map((entry) => monthKey(entry.date)));
    availableMonths.add(monthKey(localDateString()));
    const months = [...availableMonths].sort((a, b) => b.localeCompare(a));
    monthFilter.replaceChildren(new Option('All months', ''));
    for (const month of months) {
      const [year, number] = month.split('-').map(Number);
      monthFilter.add(new Option(monthFormatter.format(new Date(year, number - 1, 1)), month));
    }
    if (previous && availableMonths.has(previous)) monthFilter.value = previous;
    else monthFilter.value = months[0] || '';
  }

  function filteredEntries() {
    const selectedMonth = monthFilter.value;
    const selectedCategory = categoryFilter.value;
    const query = searchInput.value.trim().toLocaleLowerCase();
    return entries
      .filter((entry) => !selectedMonth || monthKey(entry.date) === selectedMonth)
      .filter((entry) => !selectedCategory || entry.category === selectedCategory)
      .filter((entry) => !query || [
        entry.title, entry.category, entry.status, entry.details, entry.vendor,
        entry.shop, entry.location, entry.alternatives, entry.comments, entry.timeSpent
      ].some((value) => String(value || '').toLocaleLowerCase().includes(query)))
      .sort((a, b) => b.date.localeCompare(a.date) || String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
  }

  function renderFacts(entry) {
    const facts = [];
    if (Number(entry.cost) > 0) facts.push(`<span class="entry-fact entry-cost"><span class="fact-icon" aria-hidden="true">₹</span><span class="fact-value">${escapeHtml(formatCurrency(entry.cost))} spent</span></span>`);
    if (Number(entry.budget) > 0) facts.push(`<span class="entry-fact"><span class="fact-icon" aria-hidden="true">◎</span><span class="fact-value">Budget ${escapeHtml(formatCurrency(entry.budget))}</span></span>`);
    if (entry.timeSpent) facts.push(`<span class="entry-fact"><span class="fact-icon" aria-hidden="true">◷</span><span class="fact-value">${escapeHtml(entry.timeSpent)}</span></span>`);
    if (entry.location) facts.push(`<span class="entry-fact"><span class="fact-icon" aria-hidden="true">⌖</span><span class="fact-value">${escapeHtml(entry.location)}</span></span>`);
    if (entry.vendor) facts.push(`<span class="entry-fact"><span class="fact-icon" aria-hidden="true">♙</span><span class="fact-value">Vendor: ${escapeHtml(entry.vendor)}</span></span>`);
    if (entry.shop) facts.push(`<span class="entry-fact"><span class="fact-icon" aria-hidden="true">⌂</span><span class="fact-value">Shop: ${escapeHtml(entry.shop)}</span></span>`);
    return facts.length ? `<div class="entry-facts">${facts.join('')}</div>` : '';
  }

  function renderEntry(entry) {
    const date = formatDate(entry.date);
    const day = new Intl.DateTimeFormat('en-IN', { day: '2-digit' }).format(date);
    const dayName = new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(date);
    const statusClass = entry.status.toLowerCase().replace(/\s+/g, '-');
    const safeHref = safeLink(entry.link);
    const notes = [];
    if (entry.alternatives) notes.push(`<span><strong>Alternatives:</strong> ${escapeHtml(entry.alternatives)}</span>`);
    if (entry.comments) notes.push(`<span><strong>Comments &amp; next:</strong> ${escapeHtml(entry.comments)}</span>`);
    if (safeHref) notes.push(`<a class="entry-link" href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer">Open reference ↗</a>`);
    return `<article class="day-entry">
      <div class="day-date"><span class="day-number">${day}</span><span class="day-name">${escapeHtml(dayName)}</span></div>
      <div class="entry-body">
        <div class="entry-head">
          <h3 class="entry-title">${escapeHtml(entry.title)}</h3>
          <span class="entry-category">${escapeHtml(entry.category)}</span>
          <span class="status-pill status-${statusClass}">${escapeHtml(entry.status)}</span>
          <div class="entry-actions">
            <button class="entry-action" type="button" data-edit="${escapeHtml(entry.id)}" aria-label="Edit ${escapeHtml(entry.title)}" title="Edit entry">✎</button>
            <button class="entry-action delete-entry" type="button" data-delete="${escapeHtml(entry.id)}" aria-label="Delete ${escapeHtml(entry.title)}" title="Delete entry">×</button>
          </div>
        </div>
        ${entry.details ? `<p class="entry-description">${escapeHtml(entry.details)}</p>` : ''}
        ${renderFacts(entry)}
        ${notes.length ? `<div class="entry-notes">${notes.join('')}</div>` : ''}
      </div>
    </article>`;
  }

  function renderJournal() {
    const visible = filteredEntries();
    const groups = new Map();
    for (const entry of visible) {
      const key = monthKey(entry.date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(entry);
    }
    journalList.innerHTML = [...groups.entries()].map(([key, group]) => {
      const [year, month] = key.split('-').map(Number);
      const title = monthFormatter.format(new Date(year, month - 1, 1)).toLocaleUpperCase();
      return `<section class="month-section"><h3 class="month-divider"><span>${escapeHtml(title)}</span></h3>${group.map(renderEntry).join('')}</section>`;
    }).join('');

    const hasEntries = visible.length > 0;
    journalList.hidden = !hasEntries;
    emptyState.hidden = hasEntries;
    $('#entry-count-badge').textContent = String(visible.length);
    const noEntriesAtAll = entries.length === 0;
    $('#empty-title').textContent = noEntriesAtAll ? 'Your story starts here.' : 'No entries found.';
    $('#empty-message').textContent = noEntriesAtAll
      ? 'From the first plan to the final paint stroke, save the little details that make this home yours.'
      : 'Try a different month or work type, or clear your search to see more of your journal.';
    $('#empty-add-button').hidden = !noEntriesAtAll;

    const selectedMonth = monthFilter.value;
    const monthEntries = selectedMonth
      ? entries.filter((entry) => monthKey(entry.date) === selectedMonth)
      : entries;
    const spent = monthEntries.reduce((total, entry) => total + (Number(entry.cost) || 0), 0);
    const inProgress = monthEntries.filter((entry) => entry.status === 'In progress').length;
    $('#summary-spent').textContent = formatCurrency(spent);
    $('#summary-spent-note').textContent = selectedMonth ? `Recorded in ${monthName(`${selectedMonth}-01`)}` : 'Across all recorded months';
    $('#summary-count').textContent = String(monthEntries.length);
    $('#summary-count-note').textContent = selectedMonth ? `Entries in ${monthName(`${selectedMonth}-01`)}` : 'Days captured, all time';
    $('#summary-progress').textContent = String(inProgress);
    $('#summary-month').textContent = selectedMonth ? monthName(`${selectedMonth}-01`) : 'All months';
    $('#summary-month-note').textContent = selectedMonth ? 'Your project journal' : 'Your complete story so far';

    costSummary.hidden = !costMode;
    if (costMode) {
      $('#cost-entry-count').textContent = String(visible.length);
      $('#cost-total').textContent = formatCurrency(visible.reduce((total, entry) => total + (Number(entry.cost) || 0), 0));
    }
  }

  function render() {
    updateMonthOptions();
    renderJournal();
  }

  function showApp() {
    loginScreen.hidden = true;
    appScreen.hidden = false;
    $('#today-date').textContent = fullDateFormatter.format(new Date());
    render();
  }

  function lockApp() {
    sessionStorage.removeItem(SESSION_KEY);
    appScreen.hidden = true;
    loginScreen.hidden = false;
    loginForm.reset();
    $('#login-error').hidden = true;
    $('#username').focus();
  }

  function openEntry(entry = null) {
    editingId = entry ? entry.id : null;
    entryForm.reset();
    $('#dialog-title').textContent = entry ? 'Edit journal entry' : 'Add a journal entry';
    $('#save-entry').innerHTML = entry ? 'Save changes <span aria-hidden="true">→</span>' : 'Save entry <span aria-hidden="true">→</span>';
    $('#entry-date').value = entry ? entry.date : localDateString();
    $('#entry-category').value = entry ? entry.category : '';
    $('#entry-status').value = entry ? entry.status : 'In progress';
    for (const [field, inputId] of Object.entries(formFields)) {
      $(`#entry-${inputId}`).value = entry ? (entry[field] ?? '') : '';
    }
    $('#entry-error').hidden = true;
    entryDialog.showModal();
    $('#entry-title').focus();
  }

  function formEntry() {
    const numberFrom = (id) => {
      const raw = $(`#entry-${id}`).value.trim();
      if (raw === '') return '';
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) throw new Error(`${id === 'cost' ? 'Cost' : 'Planned budget'} must be zero or a positive amount.`);
      return value;
    };
    const link = $('#entry-link').value.trim();
    if (link && !safeLink(link)) throw new Error('Please enter a valid link starting with https:// or http://.');
    const category = $('#entry-category').value;
    if (!categories.includes(category)) throw new Error('Please choose a type of work.');
    const title = $('#entry-title').value.trim();
    if (!title) throw new Error('Please add a title for this journal entry.');
    const date = $('#entry-date').value;
    if (!isValidDate(date)) throw new Error('Please choose a valid date.');
    return {
      id: editingId || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
      date,
      title,
      category,
      status: $('#entry-status').value,
      cost: numberFrom('cost'),
      budget: numberFrom('budget'),
      timeSpent: $('#entry-time').value.trim(),
      location: $('#entry-location').value.trim(),
      vendor: $('#entry-vendor').value.trim(),
      shop: $('#entry-shop').value.trim(),
      details: $('#entry-details').value.trim(),
      alternatives: $('#entry-alternatives').value.trim(),
      comments: $('#entry-comments').value.trim(),
      link,
      createdAt: entries.find((item) => item.id === editingId)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function downloadFile(filename, contents, type) {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportJson() {
    downloadFile(`our-home-journal-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(entries, null, 2), 'application/json');
  }

  function exportCsv() {
    const columns = ['Date', 'Title', 'Work type', 'Status', 'Cost (INR)', 'Planned budget (INR)', 'Time', 'Location', 'Vendor', 'Shop', 'Details & updates', 'Alternatives', 'Comments & next steps', 'Reference link'];
    const fields = ['date', 'title', 'category', 'status', 'cost', 'budget', 'timeSpent', 'location', 'vendor', 'shop', 'details', 'alternatives', 'comments', 'link'];
    const rows = filteredEntries().map((entry) => fields.map((field) => `"${String(entry[field] ?? '').replace(/"/g, '""')}"`).join(','));
    downloadFile(`our-home-journal-${new Date().toISOString().slice(0, 10)}.csv`, [columns.map((value) => `"${value}"`).join(','), ...rows].join('\r\n'), 'text/csv;charset=utf-8');
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = $('#username').value;
    const password = $('#password').value;
    if (username !== LOGIN_USERNAME || password !== LOGIN_PASSWORD) {
      $('#login-error').hidden = false;
      $('#password').select();
      return;
    }
    sessionStorage.setItem(SESSION_KEY, 'yes');
    $('#login-error').hidden = true;
    showApp();
  });

  $('#toggle-password').addEventListener('click', () => {
    const password = $('#password');
    const showing = password.type === 'text';
    password.type = showing ? 'password' : 'text';
    $('#toggle-password').textContent = showing ? 'Show' : 'Hide';
    $('#toggle-password').setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });

  for (const id of ['top-add-button', 'desktop-add-button', 'empty-add-button']) {
    $(`#${id}`).addEventListener('click', () => openEntry());
  }
  for (const id of ['logout-button', 'mobile-logout']) $(`#${id}`).addEventListener('click', lockApp);
  $('#close-dialog').addEventListener('click', () => entryDialog.close());
  $('#cancel-dialog').addEventListener('click', () => entryDialog.close());
  entryDialog.addEventListener('click', (event) => {
    if (event.target === entryDialog) entryDialog.close();
  });

  entryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const updated = formEntry();
      const next = editingId
        ? entries.map((entry) => entry.id === editingId ? updated : entry)
        : [...entries, updated];
      if (saveEntries(next)) {
        entryDialog.close();
        render();
      }
    } catch (error) {
      $('#entry-error').textContent = error.message;
      $('#entry-error').hidden = false;
    }
  });

  journalList.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit]');
    if (editButton) {
      const entry = entries.find((item) => item.id === editButton.dataset.edit);
      if (entry) openEntry(entry);
      return;
    }
    const deleteButton = event.target.closest('[data-delete]');
    if (deleteButton) {
      const entry = entries.find((item) => item.id === deleteButton.dataset.delete);
      if (!entry || !window.confirm(`Delete “${entry.title}” from your journal? This cannot be undone.`)) return;
      if (saveEntries(entries.filter((item) => item.id !== entry.id))) render();
    }
  });

  monthFilter.addEventListener('change', render);
  categoryFilter.addEventListener('change', render);
  searchInput.addEventListener('input', render);

  $('#export-button').addEventListener('click', () => {
    if (window.confirm('Download your journal as a spreadsheet-friendly CSV file?')) exportCsv();
  });
  $('#more-button').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', async (event) => {
    const [file] = event.target.files;
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed) || !parsed.every(isEntry)) {
        window.alert('This file is not a valid Our Home Journal backup. No changes were made.');
        return;
      }
      if (!window.confirm(`Replace this journal with the ${parsed.length} entries in the selected backup? Download a backup first if you want to keep your current entries.`)) return;
      if (saveEntries(parsed)) render();
    } catch (error) {
      console.error('Could not import the selected journal backup.', error);
      window.alert('Could not read this journal backup. Choose a valid JSON backup and try again.');
    }
  });

  for (const button of document.querySelectorAll('[data-nav]')) {
    button.addEventListener('click', () => {
      costMode = button.dataset.nav === 'costs';
      for (const navButton of document.querySelectorAll('[data-nav]')) navButton.classList.toggle('active', navButton === button);
      render();
      $('#summary-spent-note').textContent = costMode
        ? (monthFilter.value ? `Total in ${monthName(`${monthFilter.value}-01`)}` : 'Across all recorded months')
        : (monthFilter.value ? `Recorded in ${monthName(`${monthFilter.value}-01`)}` : 'Across all recorded months');
      if (costMode) costSummary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  if (sessionStorage.getItem(SESSION_KEY) === 'yes') showApp();
})();
