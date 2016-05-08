#!/usr/bin/env node
var api = require('./api'),
    program = require('commander'),
    pkg = require('./package.json');

program
    .version(pkg.version)
    .usage('<options | sourceLang:targetLang> <text>')
    .option('-f, --from <value>', 'Source language', 'en')
    .option('-t, --to <value>', 'Target language', 'nl');

program.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ vertaler en:nl Hi');
    console.log('    $ vertaler -f en -t nl Hi');
    console.log('    $ vertaler --from en --to nl Hi');
    console.log('');
});

program.parse(process.argv);

if (!program.args.length) { // called w/o any arguments
    program.help(); // process.exit() is implicit
}

if (program.args[0].indexOf(':')) { // called with lang:lang
    if (program.args.length == 1) { // called only w/ lang:lang
        program.help();
    }

    langs = program.args.shift().split(':');
    program.from = langs[0];
    program.to = langs[1];
}

api.translate(program.args.join(' '), program.from, program.to, console.log);