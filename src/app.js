import { boardEntries, metricKeys, metricHighlightClass, sortEntries, csvFor, leaderboardRecordSvg } from './results.js';
import { translations, applyLocale } from './locale.js';

const picker = document.querySelector('#picker');
const result = document.querySelector('#result');
const search = picker.querySelector('input');
const list = picker.querySelector('.picker-list');
const notice = result.querySelector('.download-notice');
const pngButton = result.querySelector('[data-export="png"]');
const heroVideo = document.querySelector('.hero-video');
const recordCover = document.querySelector('#record-cover');
const recordLogo = document.querySelector('.hero-brand');
const recordSvg = entry => leaderboardRecordSvg(entry, currentLocale, recordCover.src, recordLogo.src, boardEntries[currentBoard]);
const scrollHeader = document.querySelector('[data-scroll-header]');
let selected;
let currentBoard = 'official';
let currentLocale = 'en';
let sortState = { key: 'qtes', direction: 'desc' };

function syncScrollHeader() {
  if (!scrollHeader) return;
  scrollHeader.classList.toggle('is-visible', window.scrollY > 32);
}

if (scrollHeader) {
  let scrollFrame;
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = undefined;
      syncScrollHeader();
    });
  }, { passive: true });
  syncScrollHeader();
}

if (heroVideo && globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) heroVideo.pause();

function copy() {
  return translations[currentLocale];
}

function updateSelectedCopy() {
  if (!selected) return;
  result.querySelector('h2').textContent = `${selected.model} · ${currentLocale === 'en' ? 'Score record' : '成绩记录'}`;
  result.querySelector('.result-summary').textContent = copy().scoreSummary(selected);
  if (selected.valid && selected.rank !== null) result.querySelector('.certificate-preview').innerHTML = recordSvg(selected);
  notice.textContent = copy().demoSnapshot;
}

function updateCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const date = document.querySelector('#current-date');
  date.dateTime = `${year}-${month}-${day}`;
  date.textContent = `${copy().today} ${year}.${month}.${day}`;
}

function scheduleDateUpdate() {
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  setTimeout(() => { updateCurrentDate(); scheduleDateUpdate(); }, tomorrow - new Date() + 50);
}

function setLocale(locale) {
  currentLocale = applyLocale(locale);
  updateCurrentDate();
  updateSelectedCopy();
  renderPicker();
}

function showPicker() {
  search.value = '';
  renderPicker();
  picker.showModal();
  search.focus();
}
function renderPicker() {
  list.replaceChildren();
  const matches = boardEntries[currentBoard].filter(e => `${e.team} ${e.model}`.toLowerCase().includes(search.value.toLowerCase()));
  for (const e of matches) {
    const button = document.createElement('button');
    button.dataset.entry = e.id;
    const rank = document.createElement('span');
    rank.className = 'picker-rank';
    rank.textContent = e.rank ? `#${e.rank}` : '—';
    const label = document.createElement('span');
    const team = document.createElement('strong');
    team.textContent = e.team;
    const model = document.createElement('small');
    model.textContent = `${e.model} · ${e.version}`;
    label.append(team, model);
    const score = document.createElement('b');
    score.textContent = e.score.toFixed(3);
    button.append(rank, label, score);
    list.append(button);
  }
  if (!matches.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-search';
    empty.textContent = copy().noMatches;
    list.append(empty);
  }
}
function choose(id) {
  const entry = boardEntries[currentBoard].find(e => e.id === id);
  if (!entry) return;
  selected = entry;
  if (picker.open) picker.close();
  result.querySelector('h2').textContent = `${entry.model} · ${currentLocale === 'en' ? 'Score record' : '成绩记录'}`;
  result.querySelector('.result-summary').textContent = copy().scoreSummary(entry);
  const eligible = entry.valid && entry.rank !== null;
  const preview = result.querySelector('.certificate-preview');
  preview.hidden = !eligible;
  preview.innerHTML = eligible ? recordSvg(entry) : '';
  result.querySelector('.ineligible').hidden = eligible;
  result.querySelector('[data-export="pdf"]').hidden = !eligible;
  pngButton.hidden = !eligible;
  notice.textContent = copy().demoSnapshot;
  result.showModal();
}
function saveFile(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
async function downloadPNG(entry) {
  if (!entry.valid || entry.rank === null) return;
  pngButton.disabled = true;
  pngButton.textContent = copy().generating;
  notice.textContent = '';
  const url = URL.createObjectURL(new Blob([recordSvg(entry)], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 1180;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    context.drawImage(img, 0, 0);
    const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('PNG encoding failed')), 'image/png'));
    saveFile(blob, `OnSite-2027-${entry.id}-${currentLocale === 'en' ? 'leaderboard' : '排行榜记录'}.png`);
    notice.textContent = copy().imageGenerated;
  } catch {
    notice.textContent = copy().imageFailed;
  } finally {
    URL.revokeObjectURL(url);
    pngButton.disabled = false;
    pngButton.textContent = copy().downloadPng;
  }
}
function selectBoard(name) {
  currentBoard = name;
  sortState = { key: 'qtes', direction: 'desc' };
  document.querySelectorAll('[data-board]').forEach(tab => {
    const active = tab.dataset.board === name;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  document.querySelector('#leaderboard-panel').setAttribute('aria-labelledby', `${name}-tab`);
  const body = document.querySelector('tbody');
  body.replaceChildren();
  for (const entry of sortEntries(boardEntries[name], 'qtes', 'desc')) {
    const row = body.insertRow();
    row.dataset.id = entry.id;
    if (entry.rank === 1) row.className = 'first-place';
    const rank = row.insertCell();
    rank.className = 'rank-cell';
    rank.textContent = entry.rank ? String(entry.rank).padStart(2, '0') : '—';
    const model = document.createElement('strong');
    model.className = 'team-name';
    model.textContent = entry.model;
    row.insertCell().append(model);
    for (const key of metricKeys) {
      const cell = row.insertCell();
      cell.dataset.metric = key;
      cell.className = ['numeric', key === 'qtes' ? 'score' : '', metricHighlightClass(key, entry[key], boardEntries[name])].filter(Boolean).join(' ');
      cell.textContent = entry[key].toFixed(3);
    }
    const button = document.createElement('button');
    button.className = 'row-action';
    button.dataset.entry = entry.id;
    button.dataset.i18nAttr = 'aria-label:recordAria';
    button.setAttribute('aria-label', copy().recordAria);
    const label = document.createElement('span');
    label.dataset.i18n = 'records';
    label.textContent = copy().records;
    button.append(label, ' ↗');
    row.insertCell().append(button);
  }
  document.querySelectorAll('[data-sort]').forEach(button => {
    const active = button.dataset.sort === 'qtes';
    button.classList.toggle('sorted', active);
    button.querySelector('.sort-indicator').textContent = active ? '↓' : '';
    button.closest('th').setAttribute('aria-sort', active ? 'descending' : 'none');
  });
}
document.querySelector('.leaderboard-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const tabs = [...document.querySelectorAll('[data-board]')];
  const index = tabs.indexOf(document.activeElement);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  tabs[next].focus();
  selectBoard(tabs[next].dataset.board);
});
search.addEventListener('input', renderPicker);
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.locale) setLocale(button.dataset.locale);
  if (button.dataset.board) selectBoard(button.dataset.board);
  if (button.hasAttribute('data-picker')) showPicker();
  if (button.hasAttribute('data-close')) button.closest('dialog').close();
  if (button.dataset.entry) choose(button.dataset.entry);
  if (button.dataset.sort) {
    const key = button.dataset.sort;
    sortState = {
      key,
      direction: key === sortState.key ? (sortState.direction === 'desc' ? 'asc' : 'desc') : (['team', 'model', 'rank', 'fvd'].includes(key) ? 'asc' : 'desc'),
    };
    const ordered = sortEntries(boardEntries[currentBoard], sortState.key, sortState.direction);
    const body = document.querySelector('tbody');
    const rows = new Map([...body.rows].map(row => [row.dataset.id, row]));
    body.append(...ordered.map(e => rows.get(e.id)).filter(Boolean));
    document.querySelectorAll('[data-sort]').forEach(b => {
      b.classList.toggle('sorted', b === button);
      b.querySelector('.sort-indicator').textContent = b === button ? (sortState.direction === 'asc' ? '↑' : '↓') : '';
      b.closest('th').setAttribute('aria-sort', b === button ? `${sortState.direction}ending` : 'none');
    });
  }
  if (!selected) return;
  if (button.dataset.export === 'csv') {
    saveFile(new Blob([csvFor(selected, currentLocale)], { type: 'text/csv;charset=utf-8' }), `OnSite-2027-${selected.id}-${currentLocale === 'en' ? 'scores' : '成绩'}.csv`);
    notice.textContent = copy().exportGenerated;
  }
  if (button.dataset.export === 'pdf' && selected.valid && selected.rank !== null) window.print();
  if (button.dataset.export === 'png') void downloadPNG(selected);
});

applyLocale(currentLocale);
updateCurrentDate();
scheduleDateUpdate();
