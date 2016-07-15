#!/usr/bin/env node
'use strict';
const chalk = require('chalk');
const ora = require('ora');
const program = require('commander');
const styles = require('ansi-styles');
const translate = require('google-translate-api');
const updateNotifier = require('update-notifier');

const common = require('./common');
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
        .option('-f, --from <value>', 'Source language', 'auto')
        .option('-t, --to <value>', 'Target language', undefined)
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

    if (program.interactive) {
        return interactive(program);
    }
    if (!program.args.length) { // called w/o any arguments
        console.log(chalk.red('Missing arguments. See \'vertaler --help\''));
        process.exit(1);
    }
    if (!program.to) { // program.from is 'auto' by default, so does not need to be checked
        Object.assign(program, common.parseLanguages(program.args.shift()));
        if (!program.to) {
            console.log(chalk.red('Missing/invalid target language. See \'vertaler --help\''));
            process.exit(1);
        }
    }
    if (!program.args.length) {
        console.log(chalk.red('There\'s nothing to translate. See \'vertaler --help\''));
        process.exit(1);
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

        spinner.stop();
        console.error(msg);
        process.exit(1);
    });
});
