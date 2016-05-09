/**
 * Created by matheus on 5/9/16.
 */

var Insight = require('insight');
var pkg = require('./package.json');

var insight = new Insight({
    trackingCode: 'UA-75832795-5',
    pkg: pkg
});
module.exports.init = function (callback) {
    if (insight.optOut === undefined) {
        insight.track('downloaded');
        insight.askPermission(null, callback);
    } else {
        callback();
    }
};

module.exports.track = function track() {
    insight.track(Array.from(arguments).join('/'));
};