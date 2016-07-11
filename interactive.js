'use strict';

const translate = require('google-translate-api');
const vorpal = require('vorpal')();

const languages = require('./languages');

/**
 * Clears the screen
 */
const clearScreen = () => {
    process.stdout.write('\u001B[2J\u001B[0;0f');
    vorpal.ui.refresh();
};

const onKeyPress = obj => {
    const key = obj.e.key;

    // If ctrl + l
    if (key.ctrl === true && key.shift === false && key.meta === false && ['l', 'L'].indexOf(key.name) > -1) {
        clearScreen();
    }
};

/**
 *
 * @param lang the ISO 639-1 code of the desired language
 * @returns {Vorpal}
 */
const setDelimiterLang = lang => vorpal.delimiter(`${languages[lang]}>`);

/**
 *
 * @param program the commander.js program
 */
const interactive = program => {
    vorpal.command('clear', 'Clears the screen')
        .action((args, callback) => {
            clearScreen();
            callback();
        });

    vorpal
        .catch('[text...]')
        .action((command, callback) => {
            let text = command.text.join(' ');
            if (text.charAt(2) === ':') { // 'en:pt' or 'en:pt test'
                let langs = text.substring(0, 5);
                langs = langs.split(':');

                program.from = langs[0];
                program.to = langs[1];

                setDelimiterLang(program.from);

                text = text.substring(6);
            }

            if (text) {
                return new Promise((resolve, reject) => {
                    translate(command.text.join(' '), {from: program.from, to: program.to}).then(res => {
                        vorpal.activeCommand.log(res.text);
                        resolve(res.text);
                    }).catch(err => {
                        if (err.code == 'BAD_NETWORK') {
                            vorpal.activeCommand.log('Please check your internet connection');
                            reject('Please check your internet connection');
                        } else { // TODO
                            vorpal.activeCommand.log('Unknown error');
                            reject('Unknown error');
                        }
                    });
                });
            } else {
                callback();
            }
        });

    vorpal.on('keypress', onKeyPress);
    setDelimiterLang(program.from);
    vorpal.show();

    return vorpal;
};

module.exports = interactive;
