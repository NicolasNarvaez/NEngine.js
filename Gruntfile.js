module.exports = function(grunt) {
  var npm_tasks

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      main: {
        files: ['src/NEngine/*.js', 'src/browser.js'],
        tasks: ['import:main', 'jsdoc']
      },
      project: {
        files: ['**'],
        tasks: ['copy:project']
      }
    },

    copy: {
      project: {
        src: '**',
        dest: '/var/www/NEngine/'
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

  npm_tasks = ['grunt-import', 'grunt-contrib-watch',
    'grunt-jsdoc', 'grunt-contrib-copy']

  npm_tasks.forEach(function(e){grunt.loadNpmTasks(e)})

  grunt.registerTask('default', ['import:main', 'watch:main'])
  grunt.registerTask('testing', ['copy:project', 'watch:project'])
  grunt.registerTask('doc', 'jsdoc')

}
