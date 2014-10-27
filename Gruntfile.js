module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    ignoredFiles: ['README.md', 'node_modules/**', '_shower-server.client.js']
                }
            }
        },
        open: {
            dist: {
                path: 'http://localhost:' + (grunt.file.readJSON('config.json')).port + '/'
            }
        },
        concurrent: {
            dev: ['nodemon:dev', 'open'],
            options: {
                logConcurrentOutput: true
            }
        }
    });

    grunt.registerTask('server', [
        'concurrent:dev'
    ]);

    grunt.registerTask('default', 'server');
};
