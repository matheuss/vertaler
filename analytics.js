/**
 * Created by matheus on 5/9/16.
 */

const Insight = require('insight');
const pkg = require('./package.json');

const insight = new Insight({
    trackingCode: 'UA-75832795-5',
    pkg
});
module.exports.init = callback => {
    if (insight.optOut === undefined) {
        insight.track('downloaded');
        insight.askPermission(null, callback);
    } else {
        callback();
    }
};

module.exports.track = () => {
    insight.track(Array.from(arguments).join('/'));
};
