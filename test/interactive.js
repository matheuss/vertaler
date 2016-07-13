import test from 'ava';

const interactive = require('../interactive')({from: 'en', to: 'pt'});

test('translate some text from english to portuguese', async t => {
    await interactive.exec('en:pt');
    const translation = await interactive.exec('this is a text in english');
    t.is(translation, 'este é um texto em Inglês');
});

test('clear the screen with the \'clear\' command', async t => {
    await interactive.exec('clear');
    t.pass();
});

// no ideas on how to to this
// already tried: RobotJS
test.todo('clear the screen by pressing ctrl+l');
