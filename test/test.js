import execa from 'execa';
import test from 'ava';

test('show error when called w/o any arguments', async t => {
    t.throws(execa('../index.js'), /Missing arguments/);
});

test('translate from english to dutch using options', async t => {
    const ret = await execa('../index.js', ['-f', 'en', '-t', 'nl', 'translator']);

    t.is(ret.stdout, 'vertaler');
});

test('translate from auto to dutch using options', async t => {
    const ret = await execa('../index.js', ['-f', 'auto', '-t', 'nl', 'translator']);

    t.is(ret.stdout, 'vertaler');
});

test('translate from english to dutch using colon notation', async t => {
    const ret = await execa('../index.js', ['en:nl', 'translator']);

    t.is(ret.stdout, 'vertaler');
});

test('translate from auto to dutch using colon notation', async t => {
    const ret = await execa('../index.js', [':nl', 'translator']);

    t.is(ret.stdout, 'vertaler');
});

test('show help when trying to translate from english to ?', async t => {
    t.throws(execa('../index.js', ['en:', 'translator']), /Missing\/invalid target language/);
});
