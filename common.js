
/**
 * The parsed languages
 * @typedef ParsedLanguages
 * @property {string|undefined} from – the 'from' language
 * @property {string|undefined} to – the 'to' language
 */

/**
 * parseLanguages - parses languages from a
 *
 * @param  {string} str – the string that will be parsed
 * @return {ParsedLanguages}
 */
function parseLanguages(str) {
    const langColonLang = /([a-z]{2,})?(-)?([a-z]{2})?:([a-z]{2,})?(-)?([a-z]{2})?/i;
    const result = {};

    const match = langColonLang.exec(str);
    if (match && match.index === 0) { // index == 0 is needed to avoid a match on, e.g., 'testing this: regex'
        result.from = match[1];
        if (match[2]) { // e.g. 'zh-cn'
            result.from += match[2] + match[3];
        }

        result.to = match[4];
        if (match[5]) {
            result.to += match[5] + match[6];
        }
    }

    return result;
}

module.exports.parseLanguages = parseLanguages;
