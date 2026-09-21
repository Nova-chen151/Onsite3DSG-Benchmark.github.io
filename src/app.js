import { entries, sortEntries, csvFor, certificateSvgForLocale } from './results.js';
import { translations, detectLocale, localeFromBrowserLanguage, applyLocale } from './locale.js';

const picker = document.querySelector('#picker');
const result = document.querySelector('#result');
const search = picker.querySelector('input');
const list = picker.querySelector('.picker-list');
const notice = result.querySelector('.download-notice');
const pngButton = result.querySelector('[data-export="png"]');
const heroVideo = document.querySelector('.hero-video');
const scrollHeader = document.querySelector('[data-scroll-header]');
let selected;
let currentLocale = localeFromBrowserLanguage(globalThis.navigator?.language);
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
  result.querySelector('h2').textContent = `${selected.team} · ${currentLocale === 'en' ? 'Score record' : '成绩记录'}`;
  result.querySelector('.result-summary').textContent = copy().scoreSummary(selected);
  if (selected.valid && selected.rank !== null) result.querySelector('.certificate-preview').innerHTML = certificateSvgForLocale(selected, currentLocale);
  notice.textContent = copy().demoSnapshot;
}

function setLocale(locale) {
  currentLocale = applyLocale(locale);
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
  const matches = entries.filter(e => `${e.team} ${e.model}`.toLowerCase().includes(search.value.toLowerCase()));
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
    score.textContent = e.score.toFixed(2);
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
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  selected = entry;
  if (picker.open) picker.close();
  result.querySelector('h2').textContent = `${entry.team} · ${currentLocale === 'en' ? 'Score record' : '成绩记录'}`;
  result.querySelector('.result-summary').textContent = copy().scoreSummary(entry);
  const eligible = entry.valid && entry.rank !== null;
  const preview = result.querySelector('.certificate-preview');
  preview.hidden = !eligible;
  preview.innerHTML = eligible ? certificateSvgForLocale(entry, currentLocale) : '';
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
  const url = URL.createObjectURL(new Blob([certificateSvgForLocale(entry, currentLocale)], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1130;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    context.drawImage(img, 0, 0);
    const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('PNG encoding failed')), 'image/png'));
    saveFile(blob, `OnSite-2027-${entry.id}-${currentLocale === 'en' ? 'certificate' : '演示证书'}.png`);
    notice.textContent = copy().imageGenerated;
  } catch {
    notice.textContent = copy().imageFailed;
  } finally {
    URL.revokeObjectURL(url);
    pngButton.disabled = false;
    pngButton.textContent = copy().downloadPng;
  }
}
search.addEventListener('input', renderPicker);
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-picker')) showPicker();
  if (button.hasAttribute('data-close')) button.closest('dialog').close();
  if (button.dataset.entry) choose(button.dataset.entry);
  if (button.dataset.sort) {
    const key = button.dataset.sort;
    sortState = {
      key,
      direction: key === sortState.key ? (sortState.direction === 'desc' ? 'asc' : 'desc') : (key === 'team' ? 'asc' : 'desc'),
    };
    const ordered = sortEntries(entries, sortState.key, sortState.direction);
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
void detectLocale().then(setLocale);
