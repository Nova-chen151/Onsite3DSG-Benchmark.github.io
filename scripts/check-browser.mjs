import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const profile = await mkdtemp(join(tmpdir(), 'onsite-browser-'));
const chrome = spawn(process.env.CHROME_BIN || 'google-chrome', ['--headless', '--no-sandbox', '--disable-gpu', '--disable-extensions', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
let ws;
const timeout = setTimeout(() => { chrome.kill(); process.exitCode = 1; }, 45000);
try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = '';
    chrome.on('error', reject);
    chrome.once('exit', code => reject(new Error(`Chrome exited: ${code}`)));
    chrome.stderr.on('data', chunk => {
      output += chunk;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) resolve(match[1]);
    });
  });
  const origin = `http://${new URL(endpoint).host}`;
  const tab = (await (await fetch(`${origin}/json`)).json()).find(t => t.type === 'page');
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params);
    if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); }
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, m => m.error ? reject(m.error) : resolve(m.result));
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  await call('Page.enable');
  await call('Runtime.enable');
  for (const width of [1440, 375]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: pathToFileURL(resolve('index.html')).href });
    await new Promise(r => setTimeout(r, 1000));
    const checked = await call('Runtime.evaluate', { expression: `(${checkUI.toString()})()`, awaitPromise: true, returnByValue: true });
    assert.ok(!checked.exceptionDetails, JSON.stringify(checked.exceptionDetails));
    assert.equal(typeof checked.result.value, 'string');
    console.log(`${width}px: ${checked.result.value}`);
  }
  assert.deepEqual(errors, [], 'Browser JavaScript errors');
  await call('Runtime.evaluate', { expression: `document.querySelector('.row-action').click()` });
  const pdf = Buffer.from((await call('Page.printToPDF', { preferCSSPageSize: true, printBackground: true })).data, 'base64');
  assert.ok(pdf.toString('latin1').includes('/Count 1'), 'Certificate must print on one page');
  console.log('PASS: single-page certificate PDF.');
  await call('Browser.close');
} finally {
  clearTimeout(timeout);
  ws?.close();
  chrome.kill();
  await new Promise(r => setTimeout(r, 300));
  await rm(profile, { recursive: true, force: true });
}

async function checkUI() {
const wait=()=>new Promise(r=>setTimeout(r,300));
const check=(condition,label)=>{if(!condition)throw Error(label);};
const metricText=(key)=>document.querySelector(`[data-sort="${key}"]`)?.textContent||'';
check(document.documentElement.scrollWidth<=innerWidth,'page overflow');
check(!document.querySelector('.site-header .header-action'),'header results action removed');
check(!document.querySelector('.site-header').classList.contains('is-visible'),'header hidden at top');
window.scrollTo(0, innerHeight);
await wait();
check(document.querySelector('.site-header').classList.contains('is-visible'),'header appears after scroll');
window.scrollTo(0, 0);
await wait();
check(!document.querySelector('.hero-meta'),'hero side labels removed');
check(!document.querySelector('.hero-link'),'hero leaderboard button removed');
check(document.querySelector('.hero-scroll-cue .scroll-arrow'),'single hero down arrow');
check(document.querySelector('.hero-scroll-cue .scroll-arrow path'),'arrow has a visible stroked path');
check(getComputedStyle(document.querySelector('.hero-scroll-cue')).animationName==='hero-scroll-bounce','hero arrow animates');
check(getComputedStyle(document.querySelector('.hero h1')).whiteSpace==='nowrap','hero title stays on one line');
check(getComputedStyle(document.querySelector('.hero-english')).whiteSpace==='nowrap','hero English subtitle stays on one line');
check(document.querySelector('.hero-video source[type="video/mp4"]'),'hero video source');
check(document.querySelector('.hero-fallback'),'hero GIF fallback');
check(document.querySelector('#overview .overview-figure img'),'benchmark overview graphic');
check(!document.querySelector('.evaluation-figure'),'evaluation images removed');
check(document.querySelectorAll('#evaluation .metrics').length===4,'four evaluation metric groups');
check(!document.querySelector('.references'),'reference links removed');
check(!document.querySelector('#certificate'),'visible results section removed');

check([...document.querySelectorAll('a[href^="#"]')].every(a=>document.querySelector(a.getAttribute('href'))),'navigation targets');
check([...document.images].every(i=>i.complete&&i.naturalWidth),'image loading');
const activeSort=()=>document.querySelector('th[aria-sort]:not([aria-sort="none"])');
const activeArrows=()=>[...document.querySelectorAll('.sort-indicator')].filter(e=>e.textContent.trim());
const firstRank=()=>document.querySelector('tbody .rank-cell').textContent.trim();
check(document.querySelectorAll('tbody tr').length===6,'six leaderboard rows');
check(document.querySelectorAll('[data-sort]').length===11,'eleven sortable columns');
check(metricText('qtes').includes('QTES'),'QTES metric present');
check(activeSort()?.getAttribute('aria-sort')==='descending','default QTES descending');
check(activeSort().querySelector('.sorted')&&activeArrows().length===1&&activeArrows()[0].textContent==='↓','single default arrow');
check(getComputedStyle(activeSort()).backgroundColor==='rgb(20, 87, 158)','active header blue');
document.querySelector('[data-sort="fvd"]').click();await wait();
check(activeSort()?.textContent.includes('FVD')&&activeSort().getAttribute('aria-sort')==='descending'&&firstRank()==='06','FVD sort starts descending');
document.querySelector('[data-sort="fvd"]').click();await wait();
check(activeSort().getAttribute('aria-sort')==='ascending'&&firstRank()==='01'&&activeArrows()[0].textContent==='↑','FVD toggles ascending without changing official rank');
document.querySelector('[data-sort="team"]').click();await wait();
check((activeSort()?.textContent.includes('模型')||activeSort()?.textContent.includes('Model'))&&activeSort().getAttribute('aria-sort')==='ascending','model starts ascending');
check(document.querySelector('tbody .team-name').textContent.includes('DreamForge'),'model collation');
check(document.querySelectorAll('th[aria-sort]:not([aria-sort="none"])').length===1&&activeArrows().length===1,'one active sortable column');
check(!document.querySelector('tbody').textContent.includes('undefined'),'sorting never inserts undefined text');
document.querySelector('tbody tr[data-id="DEMO-002"] .row-action').click();await wait();
check(document.querySelector('.certificate-preview svg'),'certificate');
let download;
const original=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){download=fetch(this.href).then(r=>r.blob());};
try {
 const csvButton=document.querySelector('.certificate-actions button[data-export="csv"]');check(csvButton,'CSV button');csvButton.click(); await wait();
 check((await (await download).text()).includes('DEMO-002'),'CSV identity');
 const pngExport=document.querySelector('.certificate-actions button[data-export="png"]');pngExport.click();await wait();
 for(let i=0;i<30&&document.querySelector('.certificate-actions button:disabled');i++)await wait();
 const bytes=new Uint8Array(await (await download).arrayBuffer());
 check(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71,'PNG output');
} finally {HTMLAnchorElement.prototype.click=original;}
document.querySelector('.certificate-modal [data-close]').click();await wait();
document.querySelector('tbody tr:last-child .row-action').click();await wait();
check(document.querySelector('.ineligible').hidden&&document.querySelector('.certificate-preview svg'),'all records remain eligible');
document.querySelector('.certificate-modal [data-close]').click();await wait();
return 'PASS: layout, benchmark graphic, PDF main-table sorting, certificate, CSV and PNG records.';
}
