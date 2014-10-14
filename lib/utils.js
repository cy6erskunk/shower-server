var fs = require('fs'),
    iconv = require('iconv-lite'),
    crypto = require('crypto');

/**
 * returns read stream for given filepath
 */
exports.readFile = function (filepath, options) {
    return fs.createReadStream(filepath, options);
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
