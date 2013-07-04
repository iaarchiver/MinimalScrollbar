
module.exports = function(grunt) {

	grunt.initConfig({
		pkgs: grunt.file.readJSON('package.json'),
		less: {
			dev: {
				files: {
					"../src/style.css": "../src/less/style.less",
					"../src/hideWS.css": "../src/less/hideWS.less",
					"../src/customWS.css": "../src/less/customWS.less",
					"../pages/option.css": "../pages/option.less"
				}
			},
			build: {
				options: {
					yuicompress: true
				},
				files: {
					"../style.min.css": "../src/less/style.less",
					"../hideWS.min.css": "../src/less/hideWS.less",
					"../customWS.min.css": "../src/less/customWS.less",
					"../pages/option.css": "../pages/option.less"
				}
			}
		},
		concat: {
			all: {
				src: '../src/js/**/*.js',
				dest: '../src/script.js'
			}
		},
		uglify: {
			build: {
				src: ['../src/script.js'],
				dest: '../script.min.js'
			}
		},
		watch: {
			less : {
				files : ['../src/**/*.less', '../pages/**/*.less'],
				tasks : ['less']
			},
			js: {
				files: ['../src/**/*.js'],
				tasks: ['concat', 'uglify']
			}
		},
		compress: {
			build: {
				options: {
					archive: '../build.zip',
					mode: 'zip'
				},
				files: [
					{src: [
						'../manifest.json',
						'../pages/**/*',
						'../*.js',
						'../*.css',
						'../icons/*.png'
					], dest: '/'}
				]
			}
		}
	});

	// load grunt-* packages
	for(var task in grunt.config.data.pkgs.devDependencies){
		if( task.substring(0,6) == 'grunt-'){
			grunt.loadNpmTasks(task);
		}
	}

	// set default tasks
	grunt.registerTask('default', ['less', 'concat', 'uglify', 'watch']);
	grunt.registerTask('build', ['less', 'concat', 'uglify', 'compress']);
};
