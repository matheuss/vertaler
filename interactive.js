'use strict';

const vorpal = require('vorpal')();

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
 * @param program the commander.js program
 */
const interactive = program => {
    vorpal.command('clear', 'Clears the screen')
        .action((args, callback) => {
            clearScreen();
            callback();
        });

    vorpal
        .catch('[langs][text...]')
        .action((command, callback) => {
            vorpal.log(command);
            callback();
        });

    vorpal.on('keypress', onKeyPress);

    vorpal.delimiter('>').show();
};

module.exports = interactive;
