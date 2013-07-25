var showerServer = require('../lib/shower-server');

exports.singleMode_emptyPresentations = function (test) {
    var presentations = [
        undefined,
        [],
        [{}],
        [1]
    ];

    presentations.forEach(function (presentations) {
        var presentation;
        var moarInfo =  ' when presentations=' + JSON.stringify(presentations);

        test.doesNotThrow(function () {
            showerServer.initPresentations(presentations);
        }, Error, 'unexpected error' + moarInfo);

        presentations = showerServer.initPresentations(presentations);

        test.ok(Array.isArray(presentations), 'presentations is not Array' + moarInfo);
        test.strictEqual(presentations.length, 1, 'length is not 1' + moarInfo);

        presentation = presentations[0];

        test.strictEqual(presentation.folder, 'presentation', 'wrong default folder' + moarInfo);
        test.strictEqual(presentation.file, 'index.html', 'wrong default file' + moarInfo);
        test.strictEqual(presentation.url, '/', 'wrong default url' + moarInfo);
        test.ok(presentation.master, 'absent master' + moarInfo);
    });

    test.done();
};

exports.singleMode_singlePresentation = function (test) {
    var presentation = {
        folder: 'ddd/ddd',
        file: 'nyan.html',
        master: 'ololo'
    };
    var presentations = [presentation];

    var initedPresentations = showerServer.initPresentations(presentations);
    test.strictEqual(initedPresentations.length, 1, 'initialized presentations length is not 1');

    var initedPresentation = initedPresentations[0];
    test.strictEqual(initedPresentation.folder, presentation.folder, 'folder was changed');
    test.strictEqual(initedPresentation.file, presentation.file, 'file was changed');
    test.strictEqual(initedPresentation.master, presentation.master, 'master was changed');
    test.strictEqual(initedPresentation.url, '/', 'wrong default url');

    test.done();
};



