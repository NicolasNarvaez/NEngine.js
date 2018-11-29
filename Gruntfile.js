module.exports = function(grunt) {
	var npm_tasks

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		watch: {
			main: {
				files: ['src/NEngine/**/*.js', '!src/NEngine/**/*.test.js',
					'src/browser.js'],
				tasks: ['compile']
			},
			less: {
				files: 'example/**/*.less',
				tasks: ['less:dev']
			}
		},

		nodemon: {
			dev: {
				script: 'example/dev.js'
			},
			expo: {
				script: 'example/dev.js'
			}
		},

		import: {
			main: {
				src: 'src/browser.js',
				dest: 'dist/NEngine.js'
			}
		},

		less: {
			dev: {
				options: {},
				files: [{
					expand: true,
					src: ['example/**/style.less'],
					ext: '.css',
					extDot: 'last',
				}]
			}
		},

		jsdoc : {
			dist : {
				src:['./dist/*.js'],
				jsdoc: './node_modules/.bin/jsdoc',
				options: {
					destination: './doc',
					configure: './jsdoc.json',
					template: './node_modules/minami'
				}
			}
		},

		focus: {
			dev: {
				include: ['main', 'less']
			},

		},

		karma: {
			dev: {
				configFile: 'karma.conf.js',
				client: {
					captureConsole: false,
				}
			}
		},

		concurrent: {
			dev: {
				tasks: ['focus:dev', 'nodemon:dev' , 'karma:dev'],
				options: {
					logConcurrentOutput: true
				}
			}
		}
	})

	npm_tasks = ['grunt-import', 'grunt-contrib-watch',
		'grunt-jsdoc', 'grunt-contrib-copy', 'grunt-focus',
		'grunt-nodemon', 'grunt-concurrent', 'grunt-karma',
		'grunt-contrib-less',]

	npm_tasks.forEach(function(e){grunt.loadNpmTasks(e)})

	grunt.registerTask('expo', ['jsdoc', 'less:dev', ''])
	grunt.registerTask('compile', ['import:main', 'jsdoc', 'less:dev'])

	grunt.registerTask('dev', ['compile:dev','concurrent:dev'])
	grunt.registerTask('default', 'dev')

}
