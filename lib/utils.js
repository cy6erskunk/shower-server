var fs = require('fs'),
    iconv = require('iconv-lite'),
    crypto = require('crypto');

// Read a file, return its contents.
exports.readFile = function (filepath, options) {
    if (!options) { options = {}; }

    var contents;

    try {
        contents = fs.readFileSync(String(filepath));
        // If encoding is not explicitly null, convert from encoded buffer to a
        // string. If no encoding was specified, use the default.
        if (options.encoding !== null) {
            contents = iconv.decode(contents, options.encoding || 'utf8');
            // Strip any BOM that might exist.
            if (contents.charCodeAt(0) === 0xFEFF) {
                contents = contents.substring(1);
            }
        }

        return contents;
    } catch(e) {
        console.error('Unable to read "' + filepath + '" file (Error code: ' + e.code + ').', e);
    }
};

exports.getRandomMasterKey = function () {
    var shasum = crypto.createHash('sha1'),
        secret = [Math.ceil(Math.random() * 1000),
            (new Date()).getTime(),
            Math.ceil(Math.random() * 1000)
        ].join('');

    shasum.update(secret);
    return shasum.digest('hex');
};
