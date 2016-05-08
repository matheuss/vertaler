var request = require("request"),
    querystring = require("querystring"),
    tk = require('./tk');

module.exports.translate = function(text, from, to, callback) {
    tk.get(text, function (err, result) {
        if (!err) {
            var url = 'https://translate.google.com/translate_a/single';
            var data = {
                client: 't',
                sl: from,
                tl: to,
                hl: from,
                dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
                ie: 'UTF-8',
                oe: 'UTF-8',
                otf: 1,
                ssel: 0,
                tsel: 0,
                kc: 7,
                tk: result,
                q: text
            };

            url += '?' + querystring.stringify(data);

            request.get({
                url: url
            }, function (err, res, body) {
                var result = '';

                eval(body)[0].forEach(function (obj) {
                    if(obj[0] != undefined) {
                        result += obj[0];
                    }
                });

                callback(result);
            });
        }
    });
};