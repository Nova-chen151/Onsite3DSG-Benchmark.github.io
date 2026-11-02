import assert from 'node:assert/strict';
import { translations } from '../src/locale.js';
for (const locale of ['en', 'zh']) {
  for (const key of ['navUpdates', 'sectionUpdates', 'updateTitle', 'updateDescription']) {
    assert.ok(translations[locale][key], `${locale} missing ${key}`);
  }
}
console.log('PASS: changelog translations exist in both languages.');
