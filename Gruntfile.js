module.exports = function (grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        nodemon: {
            dev: {
                options: {
                    ignoredFiles: ['README.md', 'node_modules/**']
                }
            }
        },
        open: {
            dist: {
                path: 'http://localhost:3000/'
            }
        },
        concurrent: {
            dev: ['nodemon', 'open'],
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
