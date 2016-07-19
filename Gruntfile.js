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
    },
    jsdoc : {
	dist : {
		src:['./dist/*.js'],
		jsdoc: './node_modules/.bin/jsdoc',
		options: {
			destination: 'doc',
	                configure: './jsdoc.json',
        	        template: './node_modules/ink-docstrap/template'
        	}
	}
    }
  })

  grunt.loadNpmTasks('grunt-import')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-jsdoc')

  grunt.registerTask('default', ['import:main', 'watch:main'])
  grunt.registerTask('doc', 'jsdoc')

}
