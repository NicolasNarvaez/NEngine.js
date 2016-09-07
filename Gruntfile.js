module.exports = function(grunt) {
  var npm_tasks

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      main: {
        files: ['src/NEngine/**', 'src/browser.js'],
        tasks: ['import:main', 'jsdoc']
      },
      dist: {
        files: ['dist/**'],
        tasks: ['copy:dist']
      },
      doc: {
        files: ['doc/**'],
        tasks: ['copy:doc']
      }
    },

    copy: {
      doc: {
        src: 'doc/**',
        dest: '/var/www/NEngine/doc/'
      },
      dist: {
        src: 'dist/**',
        dest: '/var/www/NEngine/dist/'
      },
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

  npm_tasks = ['grunt-import', 'grunt-contrib-watch',
    'grunt-jsdoc', 'grunt-contrib-copy']

  npm_tasks.forEach(function(e){grunt.loadNpmTasks(e)})

  grunt.registerTask('default', ['import:main', 'watch:main'])
  grunt.registerTask('wdoc', ['copy:doc', 'watch:doc'])
  grunt.registerTask('wdist', ['copy:dist', 'watch:dist'])
  grunt.registerTask('doc', 'jsdoc')

}
