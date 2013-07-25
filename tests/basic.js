var showerServer = require('../lib/shower-server');
var presentations = [
    undefined,
    [],
    [{}],
    [1]
];

exports.testInitPresentations_singleMode_emptyPresentations = function(test){
    presentations.forEach(function (presentations) {
        var presentation;

        test.doesNotThrow(function () {
            showerServer.initPresentations(presentations);
        }, Error, 'unexpected error when presentations=' + JSON.stringify(presentations));

        presentations = showerServer.initPresentations(presentations);

        test.ok(Array.isArray(presentations), 'presentations is not Array when presentations=' + JSON.stringify(presentations));
        test.strictEqual(presentations.length, 1, 'length is not 1 when presentations=' + JSON.stringify(presentations));

        presentation = presentations[0];

        test.strictEqual(presentation.folder, 'presentation', 'wrong default folder when presentations=' + JSON.stringify(presentations));
        test.strictEqual(presentation.file, 'index.html', 'wrong default file when presentations=' + JSON.stringify(presentations));
        test.strictEqual(presentation.url, '/', 'wrong default url when presentations=' + JSON.stringify(presentations));
    });

    test.done();
};

