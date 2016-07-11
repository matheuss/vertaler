#!/usr/bin/env node
'use strict';
const chalk = require('chalk');
const ora = require('ora');
const program = require('commander');
const styles = require('ansi-styles');
const translate = require('google-translate-api');
const updateNotifier = require('update-notifier');

const interactive = require('./interactive');

const pkg = require('./package.json');
const analytics = require('./analytics');
const languages = require('./languages');
const notifier = updateNotifier({pkg});

const spinner = ora('Translating...');

if (notifier.update) {
    const update = notifier.update;
    let message = `Update available! ${chalk.red(update.current)} → ${chalk.green(update.latest)} \n`;
    message += `Run ${chalk.magenta('npm i -g vertaler')} to update :)`;
    const boxenOpts = {
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
    };
    notifier.notify({message, boxenOpts});
}

analytics.init(() => {
    program
        .version(pkg.version)
        .usage('<options | <sourceLang>:targetLang> <text>')
        .option('-f, --from <value>', 'Source language', 'en')
        .option('-t, --to <value>', 'Target language', 'nl')
        .option('-i , --interactive', 'Interactive mode', false);

    program.on('--help', () => {
        console.log('  Examples:');
        console.log('');
        console.log('    $ vertaler en:nl Hi');
        console.log('    $ vertaler :en Hoi');
        console.log('               └── automatic source lang detection');
        console.log('    $ vertaler -f en -t nl Hi');
        console.log('    $ vertaler --from en --to nl Hi');
        console.log('');
    });

    program.parse(process.argv);

    if (!program.args.length && !program.interactive) { // called w/o any arguments
        program.help(); // process.exit() is implicit
    }

    if (program.args[0] && program.args[0].indexOf(':') !== -1) {
        if (program.args.length === 1 && !program.interactive) { // no text to translate
            program.help();
        }

        const langs = program.args.shift().split(':');

        if (langs[0] === '') { // ':en': translate from auto to english
            program.from = 'auto';
            program.to = langs[1];
        } else if (langs[1] === '') { // 'en:' translate from english to ?
            program.help();
        } else {
            program.from = langs[0];
            program.to = langs[1];
        }
    }

    if (program.interactive) {
        return interactive(program);
    }

    spinner.start();
    analytics.track('translate', program.from, program.to);
    translate(program.args.join(' '), {from: program.from, to: program.to}).then(res => {
        let msg = '';

        spinner.stop();

        if (res.from.language.didYouMean) {
            msg = `${chalk.bold('Did you mean to translate from ')}`;
            msg += `${chalk.green.bold(languages[res.from.language.iso])}${chalk.bold('?')}`;
        }

        let correctedSpelling = '';
        if (res.from.text.value !== '') {
            if (chalk.supportsColor) {
                correctedSpelling = res.from.text.value.replace(/\[/g, styles.bold.open + styles.green.open);
                correctedSpelling = correctedSpelling.replace(/]/g, styles.bold.close + styles.green.close);
            } else {
                correctedSpelling = res.from.text.value.replace(/\[/g, '');
                correctedSpelling = correctedSpelling.replace(/]/g, '');
            }
        }

        if (res.from.text.autoCorrected) {
            if (msg !== '') {
                msg += '\n';
            }
            msg += `${chalk.bold('Auto corrected to:')} ${correctedSpelling}`;
        } else if (res.from.text.didYouMean) {
            if (msg !== '') {
                msg += '\n';
            }
            msg += `${chalk.bold('Did you mean:')} ${correctedSpelling}`;
        }

        if (msg !== '') {
            msg += '\n';
        }

        msg += res.text;

        console.log(msg);
    }).catch(err => {
        let msg = '';
        if (err.code === 'BAD_REQUEST') {
            msg = chalk.red('Ops. Our code is no longer working – Google servers are rejecting our requests.\n' +
                'Feel free to open an issue @ https://git.io/g-trans-api');
        } else if (err.code === 'BAD_NETWORK') {
            msg = chalk.red('Please check your internet connection.');
        }

        console.error(msg);
        process.exit(1);
    });
});
