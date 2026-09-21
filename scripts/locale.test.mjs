import assert from 'node:assert/strict';
import { localeFromBrowserLanguage, localeFromCountry } from '../src/locale.js';

assert.equal(localeFromCountry('CN'), 'zh');
assert.equal(localeFromCountry('cn'), 'zh');
assert.equal(localeFromCountry('US'), 'en');
assert.equal(localeFromCountry(undefined), 'en');
assert.equal(localeFromBrowserLanguage('zh-CN'), 'zh');
assert.equal(localeFromBrowserLanguage('en-US'), 'en');
assert.equal(localeFromBrowserLanguage(undefined), 'en');
console.log('PASS: locale selection uses China IP for Chinese and English everywhere else.');
