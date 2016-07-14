import test from 'ava';

import {parseLanguages} from '../common';

test('parse langs from \'en:nl\'', t => {
    const result = parseLanguages('en:nl');
    t.is(result.from, 'en');
    t.is(result.to, 'nl');
});

test('parse langs from \'zh-CN:en\'', t => {
    const result = parseLanguages('zh-CN:en');
    t.is(result.from, 'zh-CN');
    t.is(result.to, 'en');
});

test('parse langs from \'en:zh-TW\'', t => {
    const result = parseLanguages('en:zh-TW');
    t.is(result.from, 'en');
    t.is(result.to, 'zh-TW');
});

test('parse langs from \'en:nl some text here\'', t => {
    const result = parseLanguages('en:nl some text here');
    t.is(result.from, 'en');
    t.is(result.to, 'nl');
});

test('parse langs from \'en:nl :some:text:here:\'', t => {
    const result = parseLanguages('en:nl :some:text:here:');
    t.is(result.from, 'en');
    t.is(result.to, 'nl');
});

test('parse lang from \'en:\'', t => {
    const result = parseLanguages('en:');
    t.is(result.from, 'en');
    t.is(result.to, undefined);
});

test('parse lang from \'en: some text\'', t => {
    const result = parseLanguages('en: some text');
    t.is(result.from, 'en');
    t.is(result.to, undefined);
});

test('parse lang from \':nl\'', t => {
    const result = parseLanguages(':nl');
    t.is(result.from, undefined);
    t.is(result.to, 'nl');
});

test('parse lang from \':nl some text\'', t => {
    const result = parseLanguages(':nl some text');
    t.is(result.from, undefined);
    t.is(result.to, 'nl');
});
