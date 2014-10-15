var fs = require('fs'),
    crypto = require('crypto'),
    stream = require('stream');

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

exports.getStringReplaceStream = function (regexp, replacement) {
    var newStream = new stream.Transform();

    newStream._transform = _transformGenerator(regexp, replacement);

    newStream._flush = function (done) {
        this._prevChunk && this.push(this._prevChunk);
        this._prevChunk = null;
        done();
    };

    return newStream;
};


function _transformGenerator(regexp, replacement) {
    return function (chunk, encoding, done) {
        var sChunk = chunk.toString(),
            data = sChunk,
            stateChanged = false;

        if (this._prevChunk) {
            data = this._prevChunk + data;
        }

        if (!this._replaced) {
            if (regexp.test(data)) {
                this._replaced = true;
                stateChanged = true;
                data = data.replace(regexp, replacement);
            }
        }

        if (stateChanged) {
            this.push(data);
            this._prevChunk = sChunk = null;
        } else if (this._prevChunk) {
            this.push(this._prevChunk);
        }
        this._prevChunk = sChunk;

        done();
    };
}
