#!/usr/bin/env node
var translate = require('google-translate-api'),
    program = require('commander'),
    pkg = require('./package.json'),
    analytics = require('./analytics'),
    updateNotifier = require('update-notifier')({pkg: pkg}),
    boxen = require('boxen'),
    chalk = require('chalk');

if (updateNotifier.update) {
    var update = updateNotifier.update;
    var message = boxen('Update available! ' + chalk.red(update.current) + ' → '
        + chalk.green(update.latest) + ' \nRun ' + chalk.magenta('npm i -g vertaler') + ' to update :)', {
        padding: 1,
        margin: 1,
        borderColor: 'green',
        borderStyle: {
            topLeft: '.',
            topRight: '.',
            bottomLeft: '\'',
            bottomRight: '\'',
            horizontal: '-',
            vertical: '|'
        }
    });
    process.on('exit', function () {
        console.error(message);
    });

    process.on('SIGINT', function () {
        console.error('\n' + message);
    });
}

analytics.init(function () {
    program
        .version(pkg.version)
        .usage('<options | <sourceLang>:targetLang> <text>')
        .option('-f, --from <value>', 'Source language', 'en')
        .option('-t, --to <value>', 'Target language', 'nl');

    program.on('--help', function () {
        console.log('  Examples:');
        console.log('');
        console.log('    $ vertaler en:nl Hi');
        console.log('    $ vertaler :en Hoi (automatic source lang detection)');
        console.log('    $ vertaler -f en -t nl Hi');
        console.log('    $ vertaler --from en --to nl Hi');
        console.log('');
    });

    program.parse(process.argv);

    if (!program.args.length) { // called w/o any arguments
        program.help(); // process.exit() is implicit
    }

    if (program.args[0].indexOf(':') != -1) {
        if (program.args.length == 1) { // no text to translate
            program.help();
        }

        var langs = program.args.shift().split(':');

        if (langs[0] == '') { // ':en': translate from auto to english
            program.from = 'auto';
            program.to = langs[1];
        } else if (langs[1] == '') { // 'en:' translate from english to ?
            program.help();
        } else {
            program.from = langs[0];
            program.to = langs[1];
        }

    }

    analytics.track('translate', program.from, program.to);
    translate(program.from, program.to, program.args.join(' '), function (err, text) {
        if (err) {
            var msg = '';
            if (err.code == 'BAD_REQUEST') {
                msg = chalk.red('Ops. Our code is no longer working – Google servers are rejecting our requests.\n' +
                    'Feel free to open an issue @ https://git.io/g-trans-api');
            } else if (err.code == 'BAD_NETWORK') {
                msg = chalk.red('Please check your internet connection.')
            }

            console.error(msg);
            process.exit(1);
        }

        console.log(text);
    });
});