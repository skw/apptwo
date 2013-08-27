module.exports = function( grunt ) {

  // A very basic default task.
  grunt.registerTask('default', 'Log some stuff.', function() {
    grunt.log.write('Logging some stuff...').ok();
  });

  // config
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    stylus: {
      compile: {
        options: {
          paths: ['src/styles', 'bower_components/bootstrap-stylus/stylus'],
        },
        files: {
          'public/style.css': ['src/styles/style.styl'] // compile and concat into single file
        }
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-stylus');

  // Default task(s).
  grunt.registerTask('default', ['stylus']);

};