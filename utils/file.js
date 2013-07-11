var fs = require('fs'),
    iconv = require('iconv-lite'),
    file = {};

file.defaultEncoding = 'utf8';

// Read a file, return its contents.
file.read = function (filepath, options) {
    if (!options) { options = {}; }

    var contents;

    try {
        contents = fs.readFileSync(String(filepath));
        // If encoding is not explicitly null, convert from encoded buffer to a
        // string. If no encoding was specified, use the default.
        if (options.encoding !== null) {
            contents = iconv.decode(contents, options.encoding || file.defaultEncoding);
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

// Read a file, parse its contents, return an object.
file.readJSON = function (filepath, options) {
    var src = file.read(filepath, options),
        result;

    if (fs.existsSync(filepath)) {
        try {
            result = JSON.parse(src);
            return result;
        } catch(e) {
            console.error('Unable to parse "' + filepath + '" file (' + e.message + ').', e);
        }
    }
};

file.write = function (filename, data) {
    try {
        fs.writeFileSync(filename, data);
    } catch (err) {
        // @TODO: error handling
        throw err;
    }
};

module.exports = file;
