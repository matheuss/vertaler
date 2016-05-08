#!/usr/bin/env node
var api = require('./api'),
    program = require('commander'),
    pkg = require('./package.json');

program
    .version(pkg.version)
    .usage('<options> <text>')
    .option('-f, --from <value>', 'Source language', 'en')
    .option('-t, --to <value>', 'Target language', 'nl')
    .parse(process.argv);

if (!program.args.length) {
    console.error('What do you want to translate? Try vertaler --help');
    process.exit();
}

if (program.args[0].indexOf(':')) {
    langs = program.args.shift().split(':');
    program.from = langs[0];
    program.to = langs[1];
}

api.translate(program.args.join(' '), program.from, program.to, console.log);