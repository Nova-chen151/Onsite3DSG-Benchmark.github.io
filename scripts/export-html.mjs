import { readFile, writeFile } from 'node:fs/promises';
import { entries } from '../src/results.js';

const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const rows = entries.map(e => `<tr data-id="${escapeHtml(e.id)}"${e.rank === 1 ? ' class="first-place"' : ''}>
  <td class="rank-cell">${e.rank ? String(e.rank).padStart(2, '0') : '—'}</td>
  <td><strong class="team-name">${escapeHtml(e.model)}</strong></td>
  <td class="numeric score">${e.qtes.toFixed(2)}</td><td class="numeric">${e.fvd.toFixed(2)}</td><td class="numeric">${e.clipIqa.toFixed(2)}</td>
  <td class="numeric">${e.dinoT.toFixed(2)}</td><td class="numeric">${e.epi3.toFixed(2)}</td><td class="numeric">${e.tvc.toFixed(2)}</td>
  <td class="numeric">${e.trs.toFixed(2)}</td><td class="numeric">${e.rpdms.toFixed(2)}</td><td class="numeric">${e.routeCompletion.toFixed(2)}</td>
  <td><button class="row-action" data-entry="${escapeHtml(e.id)}" data-i18n-attr="aria-label:recordAria" aria-label="成绩记录和证书"><span data-i18n="records">成绩记录</span> ↗</button></td>
</tr>`).join('\n');
const [template, sourceCss, data, locale, app] = await Promise.all(['src/page.html', 'src/styles.css', 'src/results.js', 'src/locale.js', 'src/app.js'].map(p => readFile(p, 'utf8')));
let css = sourceCss;
for (const name of new Set([...css.matchAll(/url\('\/([^']+)'\)/g)].map(m => m[1]))) {
  const font = (await readFile(`public/${name}`)).toString('base64');
  css = css.replaceAll(`url('/${name}')`, `url('data:font/woff2;base64,${font}')`);
}
let html = template.replace('/* STYLES */', () => css).replace('<!-- RESULTS -->', () => rows);
const script = `(()=>{\n${data.replace(/^export /gm, '')}\n${locale.replace(/^export /gm, '')}\n${app.replace(/^import .*;\n/gm, '')}\n})();`;
html = html.replace('/* SCRIPT */', () => script.replaceAll('</script', '<\\/script'));
for (const name of new Set([...html.matchAll(/(?:src|href)="\/([^"/]+)"/g)].map(m => m[1]))) {
  const mime = name.endsWith('.svg')
    ? 'image/svg+xml'
    : name.endsWith('.gif')
      ? 'image/gif'
      : name.endsWith('.mp4')
        ? 'video/mp4'
        : 'image/png';
  const image = (await readFile(`public/${name}`)).toString('base64');
  html = html.replaceAll(`"/${name}"`, `"data:${mime};base64,${image}"`);
}
await writeFile('index.html', html);
console.log(`Built standalone index.html (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB), no dependencies.`);
