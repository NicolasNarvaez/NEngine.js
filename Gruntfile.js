module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      main: {
        files: ['src/NEngine/*.js', 'src/browser.js'],
        tasks: ['import:main']
      }
    },
    import: {
      main: {
        src: 'src/browser.js',
        dest: 'dist/NEngine.js'
      }
    }
  })

  grunt.loadNpmTasks('grunt-import')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('default', ['import:main', 'watch:main'])

}
