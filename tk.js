/**
 * Created by matheus on 5/7/16.
 */
var errors = require('./errors'),
    request = require('request'),
    Configstore = require('configstore');

function sM(a) {
    var b;
    if (null !== rM)
        b = rM;
    else {
        b = pM(String.fromCharCode(84));
        var c = pM(String.fromCharCode(75));
        b = [b(), b()];
        b[1] = c();
        b = (rM = window[b.join(c())] || k) || k
    }
    var d = pM(String.fromCharCode(116))
        , c = pM(String.fromCharCode(107))
        , d = [d(), d()];
    d[1] = c();
    c = cb + d.join(k) +
        Ff;
    d = b.split(jd);
    b = Number(d[0]) || 0;
    for (var e = [], f = 0, g = 0; g < a.length; g++) {
        var m = a.charCodeAt(g);
        128 > m ? e[f++] = m : (2048 > m ? e[f++] = m >> 6 | 192 : (55296 == (m & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (m = 65536 + ((m & 1023) << 10) + (a.charCodeAt(++g) & 1023),
            e[f++] = m >> 18 | 240,
            e[f++] = m >> 12 & 63 | 128) : e[f++] = m >> 12 | 224,
            e[f++] = m >> 6 & 63 | 128),
            e[f++] = m & 63 | 128)
    }
    a = b;
    for (f = 0; f < e.length; f++)
        a += e[f],
            a = qM(a, $b);
    a = qM(a, Zb);
    a ^= Number(d[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    a %= 1E6;
    return c + (a.toString() + jd + (a ^ b))
}

var rM = null;
var pM = function (a) {
    return function () {
        return a
    }
};
var cb = '&';
var k = '';
var Ff = '=';
var jd = '.';
var t = 'a';
var Yb = '+';
var Zb = "+-3^+b+-f";
var $b = "+-a^+6";

var qM = function (a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2)
            , d = d >= t ? d.charCodeAt(0) - 87 : Number(d)
            , d = b.charAt(c + 1) == Yb ? a >>> d : a << d;
        a = b.charAt(c) == Yb ? a + d & 4294967295 : a ^ d
    }
    return a
};

var config = new Configstore('vertaler');

var window = {
    TKK: config.get('TKK') || '0'
};

function updateTKK(callback) {
    var now = Math.floor(Date.now() / 3600000);

    if (Number(window.TKK.split('.')[0]) == now) {
        callback(null);
    } else {
        request.get('https://translate.google.com', function (err, res, body) {
            if (err) {
                callback(errors.NETWORK);
            } else {
                var code = body.match(/TKK=(.*?)\(\)\)'\);/g);

                if (code) {
                    eval(code[0]);
                    if (typeof TKK != 'undefined') {
                        window.TKK = TKK;
                        config.set('TKK', TKK);
                        callback(null);
                    } else {
                        callback(errors.NO_TKK);
                    }
                } else {
                    callback(errors.REGEX_FAILED);
                }
            }
        });
    }
}

module.exports.get = function (text, callback) {
    updateTKK(function (err) {
        if (!err) {
            var tk = sM(text);
            tk = tk.replace('&tk=', '');
            callback(null, tk);
        } else {
            callback(err);
        }
    });
};