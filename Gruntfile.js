module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
            '* <%= pkg.name %> v.<%= pkg.version %>\n' +
            '* (c) ' + new Date().getFullYear() + ', Obogo\n' +
            '* License: MIT.\n' +
            '*/\n',
        wrapStart: '(function (exports, global) {\nif (typeof define === "function" && define.amd) {\n  define(exports);\n} else if (typeof module !== "undefined" && module.exports) {\n  module.exports = exports;\n} else {\n  global.<%= pkg.packageName %> = exports;\n}\n\n',
        wrapEnd: '\n}(this.<%= pkg.packageName %> = this.<%= pkg.packageName %> || {}, function() {return this;}()));\n',
        compile: {
            maze: {
                banner: "<%= banner %>",
                wrap: 'mazegen',
                build: 'build',
                filename: 'mazegen',
                scripts: {
                    import: ['mazegen', 'findPath'],
                    src: ['src/**/*.js'],
                    report: 'verbose'
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('hbjs');

    // Default task(s).
    grunt.registerTask('default', ['compile:maze']);

};
