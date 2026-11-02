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
document.documentElement.style.scrollBehavior='auto';
check(document.documentElement.lang==='en','English is the default');
const today = new Date();
const expectedDate = [today.getFullYear(), String(today.getMonth()+1).padStart(2,'0'), String(today.getDate()).padStart(2,'0')].join('-');
check(document.querySelector('#current-date').dateTime===expectedDate && document.querySelector('#current-date').textContent.startsWith('Today '),'current date shown');
check(document.querySelector('[data-i18n="updated"]').textContent==='Snapshot: 2026.09.29','actual snapshot date preserved');
check(document.querySelector('[data-i18n="observationQuality"]').textContent==='Observation Quality','English evaluation heading');
check(!document.querySelector('.hero-english'),'no repeated hero subtitle');
check([...document.querySelectorAll('.section-body .lead')].every(e=>!e.querySelector('br')),'lead headings have no forced line breaks');
if (innerWidth===1440) check([...document.querySelectorAll('.section-body .lead')].every(e=>e.getClientRects().length===1 && e.scrollHeight < 60),'desktop lead headings fit on one line');
check([...document.querySelectorAll('.section-label')].every(label=>label.querySelectorAll('h2,p').length===1),'one language per section heading');
check(getComputedStyle(document.querySelector('.language-switch')).visibility==='hidden','language switch hidden on cover');
window.scrollTo(0, innerHeight);
await wait();
check(getComputedStyle(document.querySelector('.language-switch')).visibility==='visible','language switch visible after scroll');
check(document.querySelector('[data-locale="en"]').getAttribute('aria-pressed')==='true','English button selected');
document.querySelector('[data-locale="zh"]').click();
check(document.documentElement.lang==='zh-CN' && document.querySelector('[data-i18n="navOverview"]').textContent==='赛道介绍','switch to Chinese');
check(document.querySelector('#current-date').textContent.startsWith('今天 ') && document.querySelector('[data-i18n="updated"]').textContent==='数据快照：2026.09.29','localized dates');
check(document.querySelector('.hero h1').textContent==='面向自动驾驶测试的生成式世界模型挑战赛','Chinese hero title');
check(document.querySelector('.hero h1').scrollWidth <= document.querySelector('.hero h1').getBoundingClientRect().width,'Chinese hero title fits screen');
check(document.querySelector('[data-locale="zh"]').getAttribute('aria-pressed')==='true','Chinese button selected');
check(document.querySelector('[data-i18n="updateTitle"]').textContent==='网站更新','Chinese changelog');
check(document.querySelector('[data-i18n="observationQuality"]').textContent==='观测质量','Chinese evaluation heading');
check(document.querySelector('[data-i18n="tableObservation"]').textContent==='观测质量','Chinese leaderboard heading');
document.querySelector('[data-locale="en"]').click();
check(document.documentElement.lang==='en' && document.querySelector('[data-i18n="updateTitle"]').textContent==='Website update','switch back to English');
for (const key of ['demoRecords', 'sortable', 'tableExplanation', 'demoNote', 'baseline', 'footerNote']) {
  check(!document.querySelector(`[data-i18n="${key}"]`), 'removed copy cannot reappear after localization: ' + key);
}
check(!document.querySelector('.table-foot,.table-explanation'), 'removed explanation containers leave no empty blocks');

check(!document.querySelector('.site-header .header-action'),'header results action removed');
check(document.querySelector('.site-header').classList.contains('is-visible'),'header appears after scroll');
window.scrollTo(0, 0);
await wait();
check(!document.querySelector('.site-header').classList.contains('is-visible'),'header hidden at top');
check(getComputedStyle(document.querySelector('.language-switch')).visibility==='hidden','language switch hidden again at top');
check(!document.querySelector('.hero-meta'),'hero side labels removed');
check(!document.querySelector('.hero-link'),'hero leaderboard button removed');
check(document.querySelector('.hero-scroll-cue .scroll-arrow'),'single hero down arrow');
check(document.querySelector('.hero-scroll-cue .scroll-arrow path'),'arrow has a visible stroked path');
check(getComputedStyle(document.querySelector('.hero-scroll-cue')).animationName==='hero-scroll-bounce','hero arrow animates');
check(document.querySelector('.hero h1').textContent==='Generative World Simulation Challenge','new hero title');
const heroTitle = document.querySelector('.hero h1').getBoundingClientRect();
check(heroTitle.left >= 0 && heroTitle.right <= innerWidth && document.querySelector('.hero h1').scrollWidth <= heroTitle.width,'hero title fits screen');
check(document.querySelector('.hero-video source[type="video/mp4"]'),'hero video source');
check(!document.querySelector('.hero-fallback'),'hero GIF fallback removed');
check(document.querySelector('#overview .overview-figure img'),'framework overview graphic');
check(parseFloat(getComputedStyle(document.querySelector('#evaluation')).paddingBottom)>=70,'QTES leaves white space before footer');
check(document.querySelector('#submit .submission-figure:last-child img'),'Submission overview graphic is last');
check(getComputedStyle(document.querySelector('#submit .submission-figure')).backgroundColor==='rgba(0, 0, 0, 0)','Submission overview graphic has no fill background');
check(!document.querySelector('.evaluation-figure'),'evaluation images removed');
check(document.querySelectorAll('#evaluation .metrics').length===4,'four evaluation metric groups');
check(!document.querySelector('.references'),'reference links removed');
check(!document.querySelector('#certificate'),'visible results section removed');

check([...document.querySelectorAll('a[href^="#"]')].every(a=>document.querySelector(a.getAttribute('href'))),'navigation targets');
check([...document.images].every(i=>i.complete&&i.naturalWidth),'image loading');
const activeSort=()=>document.querySelector('th[aria-sort]:not([aria-sort="none"])');
const activeArrows=()=>[...document.querySelectorAll('.sort-indicator')].filter(e=>e.textContent.trim());
const firstRank=()=>document.querySelector('tbody .rank-cell').textContent.trim();
check(document.querySelector('#official-tab').getAttribute('aria-selected')==='true' && document.querySelector('#leaderboard-panel').getAttribute('aria-labelledby')==='official-tab','official leaderboard default');
const rowValues = () => [...document.querySelectorAll('tbody tr')].map(row => [...row.cells].map(cell => cell.textContent.trim()));
const officialRows = rowValues();
document.querySelector('#teaching-tab').click();
check(document.querySelector('#leaderboard-panel').getAttribute('aria-labelledby')==='teaching-tab' && document.querySelector('#teaching-tab').getAttribute('aria-selected')==='true','teaching leaderboard switch');
check(JSON.stringify(rowValues())===JSON.stringify(officialRows),'teaching starts with the same records');
document.querySelector('#teaching-tab').focus();
document.querySelector('#teaching-tab').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
check(document.querySelector('#leaderboard-panel').getAttribute('aria-labelledby')==='official-tab' && document.activeElement.id==='official-tab','keyboard tab switch');
check(document.querySelectorAll('tbody tr').length===7,'seven leaderboard rows');
check(document.querySelectorAll('[data-sort]').length===11,'eleven sortable columns');
check(metricText('qtes').includes('QTES'),'QTES metric present');
check(activeSort()?.getAttribute('aria-sort')==='descending','default QTES descending');
check(activeSort().querySelector('.sorted')&&activeArrows().length===1&&activeArrows()[0].textContent==='↓','single default arrow');
const checkPlainTable=()=>{
  for(const element of document.querySelectorAll('.leaderboard-table, .leaderboard-table *')) {
    const style=getComputedStyle(element);
    check(['rgba(0, 0, 0, 0)','rgb(255, 255, 255)'].includes(style.backgroundColor),'table has no background fill: '+element.tagName+'.'+element.className);
    check(style.backgroundImage==='none','table has no background image');
    check(style.fontWeight==='400','table text is not bold: '+element.tagName+'.'+element.className);
  }
  check(getComputedStyle(activeSort()).color!=='rgb(255, 255, 255)','active sort text remains readable');
};
checkPlainTable();
document.querySelector('[data-sort="fvd"]').click();await wait();
check(activeSort()?.textContent.includes('FVD')&&activeSort().getAttribute('aria-sort')==='ascending'&&firstRank()==='01','FVD starts with the lowest value');
document.querySelector('[data-sort="fvd"]').click();await wait();
check(activeSort().getAttribute('aria-sort')==='descending'&&firstRank()==='06'&&activeArrows()[0].textContent==='↓','FVD toggles descending without changing QTES rank');
document.querySelector('[data-sort="team"]').click();await wait();
check((activeSort()?.textContent.includes('模型')||activeSort()?.textContent.includes('Model'))&&activeSort().getAttribute('aria-sort')==='ascending','model starts ascending');
check(document.querySelector('tbody .team-name').textContent.includes('BaseDreamer'),'model collation');
check(document.querySelectorAll('th[aria-sort]:not([aria-sort="none"])').length===1&&activeArrows().length===1,'one active sortable column');
check(!document.querySelector('tbody').textContent.includes('undefined'),'sorting never inserts undefined text');
document.querySelector('tbody tr[data-id="GEN-opendwm"] .row-action').click();await wait();
check(document.querySelector('.certificate-preview svg'),'certificate');
let download;
const original=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){download=fetch(this.href).then(r=>r.blob());};
try {
 const csvButton=document.querySelector('.certificate-actions button[data-export="csv"]');check(csvButton,'CSV button');csvButton.click(); await wait();
 check((await (await download).text()).includes('GEN-opendwm'),'CSV identity');
 const pngExport=document.querySelector('.certificate-actions button[data-export="png"]');pngExport.click();await wait();
 for(let i=0;i<30&&document.querySelector('.certificate-actions button:disabled');i++)await wait();
 const bytes=new Uint8Array(await (await download).arrayBuffer());
 check(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71,'PNG output');
} finally {HTMLAnchorElement.prototype.click=original;}
document.querySelector('.certificate-modal [data-close]').click();await wait();
document.querySelector('tbody tr:last-child .row-action').click();await wait();
check(document.querySelector('.ineligible').hidden&&document.querySelector('.certificate-preview svg'),'all records remain eligible');
document.querySelector('.certificate-modal [data-close]').click();await wait();
document.querySelector('[data-sort="qtes"]').click();await wait();
check([...document.querySelectorAll('tbody .team-name')].map(e=>e.textContent).join('|')==='OpenDWM|DreamForge|HorizonDrive|MagicDrive-V2|Panacea|BaseDreamer|MagicDrive','QTES final ordering');
check(document.querySelectorAll('thead [scope="colgroup"]').length===4,'four grouped headers');
check([...document.querySelectorAll('tbody [data-metric]')].every(e=>/^\d+\.\d{3}$/.test(e.textContent)),'three decimal cells');
check(document.querySelectorAll('[data-metric="trs"].metric-best,[data-metric="trs"].metric-second').length===0,'identical TRS is unhighlighted');
check(document.querySelectorAll('[data-metric="routeCompletion"].metric-best').length===2,'tied best route completion');
check(document.querySelectorAll('[data-metric="routeCompletion"].metric-second').length===2,'tied second route completion');
checkPlainTable();
document.querySelector('.table-scroll').scrollLeft=0;
return 'PASS: layout, benchmark graphic, PDF main-table sorting, certificate, CSV and PNG records.';
}
