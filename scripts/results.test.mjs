import assert from 'node:assert/strict';
import { entries, metricKeys, metricHighlightClass, sortEntries, csvFor, certificateSvg, certificateSvgForLocale } from '../src/results.js';
const expected = [["MagicDrive-V2", 217.146, 0.437, 0.744, 0.179, 0.447, 0.782, 0.718, 0.87, 39.509], ["OpenDWM", 93.383, 0.531, 0.73, 0.222, 0.543, 0.782, 0.724, 0.878, 44.079], ["Panacea", 280.866, 0.581, 0.728, 0.164, 0.374, 0.782, 0.717, 0.881, 39.146], ["DreamForge", 272.88, 0.573, 0.705, 0.168, 0.495, 0.782, 0.729, 0.881, 41.311], ["BaseDreamer", 630.836, 0.661, 0.677, 0.143, 0.41, 0.782, 0.721, 0.88, 38.522], ["HorizonDrive", 178.708, 0.593, 0.842, 0.116, 0.519, 0.782, 0.725, 0.88, 40.108], ["MagicDrive", 378.423, 0.53, 0.681, 0.132, 0.363, 0.782, 0.67, 0.855, 37.282]];
const expectedOrder = ['OpenDWM','DreamForge','HorizonDrive','MagicDrive-V2','Panacea','BaseDreamer','MagicDrive'];
assert.equal(entries.length, 7);
assert.equal(new Set(entries.map(e => e.id)).size, 7);
assert.deepEqual(entries.map(e => e.model), expectedOrder);
assert.deepEqual(entries.map(e => e.rank), [1,2,3,4,5,6,7]);
assert.deepEqual(metricKeys, ['fvd','clipIqa','dinoT','epi3','tvc','trs','rpdms','routeCompletion','qtes']);
for (const row of expected) {
    const e = entries.find(e => e.model === row[0]);
    assert.ok(e, row[0]);
    assert.deepEqual(metricKeys.map(key => e[key]), row.slice(1), row[0] + ': all nine Table 2 values');
    assert.equal(e.score, e.qtes);
    assert.equal(e.version, 'Generated trajectories + rendering');
    assert.equal(e.date, '2026-09-29');
    assert.equal(e.submittedAt, null, 'Do not invent submission timestamps');
    assert.equal(e.trs, 0.782);
    for (const key of metricKeys) {
        assert.ok(Number.isFinite(e[key]), key);
        if (key !== 'qtes' && key !== 'fvd') assert.ok(e[key] >= 0 && e[key] <= 1, key + ': preserve original scale');
    }
    for (const locale of ['zh','en']) {
        const csv = csvFor(e, locale);
        assert.ok(csv.startsWith('\uFEFF'));
        assert.ok(csv.includes(e.id));
        for (const key of metricKeys) assert.ok(csv.includes('"' + e[key].toFixed(3) + '"'), key + ': CSV retains three decimals');
        assert.ok(certificateSvgForLocale(e, locale).includes(e.qtes.toFixed(3)), 'record precision');
    }
}
assert.deepEqual(sortEntries(entries,'qtes','asc').map(e=>e.rank), [7,6,5,4,3,2,1]);
assert.deepEqual(sortEntries(entries,'score','desc').map(e=>e.model), expectedOrder);
assert.deepEqual(sortEntries(entries,'rank','asc').map(e=>e.rank), [1,2,3,4,5,6,7]);
assert.deepEqual(sortEntries(entries,'submittedAt','asc').map(e=>e.rank), [1,2,3,4,5,6,7]);
assert.equal(sortEntries(entries,'fvd','asc')[0].model, 'OpenDWM');
assert.equal(sortEntries(entries,'fvd','desc')[0].model, 'BaseDreamer');
assert.equal(sortEntries(entries,'team','asc')[0].model, 'BaseDreamer');
assert.deepEqual(entries.map(e=>e.model), expectedOrder, 'sorting is non-mutating');
assert.equal(metricHighlightClass('fvd',93.383),'metric-best');
assert.equal(metricHighlightClass('fvd',178.708),'metric-second');
assert.equal(metricHighlightClass('qtes',44.079),'metric-best');
assert.equal(metricHighlightClass('qtes',41.311),'metric-second');
assert.equal(metricHighlightClass('routeCompletion',0.881),'metric-best');
assert.equal(metricHighlightClass('routeCompletion',0.880),'metric-second');
assert.equal(metricHighlightClass('trs',0.782),'');
assert.ok(csvFor({...entries[0],team:'=FORMULA,"test"'}).includes("'=FORMULA,"));
const svg=certificateSvg({...entries[0],team:'<script>&"'});
assert.ok(svg.includes('&lt;script&gt;&amp;&quot;'));
assert.ok(svg.includes('GEN-opendwm') && svg.includes('2026-09-29') && svg.includes('不作为官方成绩'));
assert.ok(certificateSvg(entries[6]).includes('#7'));
assert.ok(certificateSvgForLocale(entries[0],'en').includes('Certificate of Achievement'));
assert.throws(()=>certificateSvg({...entries[0],valid:false}));
console.log('PASS: all 63 generated-trajectory values, QTES ranks, original scales, three-decimal exports, tied highlights, escaping and record eligibility.');
