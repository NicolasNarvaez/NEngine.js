module.exports = function(grunt) {
	var npm_tasks

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		watch: {
			main: {
				files: ['src/NEngine/**', 'src/browser.js'],
				tasks: ['compile']
			},
		},

		nodemon: {
			dev: {
				script: 'example/dev.js'
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
					template: './node_modules/minami'
				}
			}
		},

		focus: {
			dev: {
				include: ['main']
			}
		},

		karma: {
			dev: {
				configFile: 'karma.conf.js'
			}
		},

		concurrent: {
			dev: {
				tasks: ['focus:dev', 'nodemon:dev' ],
				options: {
					logConcurrentOutput: true
				}
			},
			devall: {
				tasks: ['focus:dev', 'nodemon:dev' , 'karma:dev'],
				options: {
					logConcurrentOutput: true
				}
			}
		}
	})

	npm_tasks = ['grunt-import', 'grunt-contrib-watch',
		'grunt-jsdoc', 'grunt-contrib-copy', 'grunt-focus',
		'grunt-nodemon', 'grunt-concurrent', 'grunt-karma']

	npm_tasks.forEach(function(e){grunt.loadNpmTasks(e)})

	grunt.registerTask('compile', ['import:main', 'jsdoc'])

	grunt.registerTask('dev', ['compile:dev','concurrent:dev'])
	grunt.registerTask('devall', ['compile:dev','concurrent:devall'])
	grunt.registerTask('default', 'dev')

}
