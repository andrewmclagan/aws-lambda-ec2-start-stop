'use strict';

var gulp 				= require('gulp');
var babel 				= require('gulp-babel');
var fs 					= require('fs');
var path 				= require('path');
var install 			= require('gulp-install');
var zip 				= require('gulp-zip');
var strip 				= require('gulp-strip-comments');
var removeEmptyLines 	= require('gulp-remove-empty-lines');
var del 				= require('del');
var pkg 				= require('./package.json');



gulp.task('clean', ['zip'], function () {
	return del('.temp');
});

gulp.task('rmaws', ['copyAndInstall'], function () {
	return del('.temp/node_modules/aws-sdk');
});

gulp.task('copyAndInstall', ['translate'], function () {
	var files = ['package.json', '.temp/index.js'];

	if (pkg.files === undefined) {
		files = ['./**', '!./**/*.md', '!gulpfile.js', '!./{dist,dist/**}', '!./{test,test/**}', '!./{node_modules,node_modules/**}'];
	} else {
		files = files.map(function (file) {
			try {
				if (fs.statSync(path.join(__dirname, file)).isDirectory()) {
					return path.join(file, '**/*');
				}
			} catch (err) {
				// do nothing
			}

			return file;
		});
	}

	return gulp.src(files, {base: '.'})

		.pipe(strip())
		.pipe(removeEmptyLines())
		.pipe(gulp.dest('.temp'))
		.pipe(install({production: true}));
});

gulp.task('translate', () => {
	return gulp.src('src/index.js')
		.pipe(babel({
			presets: ["es2015","stage-0"],
			babelrc: false
		}))
		.pipe(gulp.dest('.temp'));
});

gulp.task('zip', ['copyAndInstall', 'rmaws'], function () {
	return gulp.src('.temp/**')
		.pipe(zip('build.zip'))
		.pipe(gulp.dest('dist'));
});

gulp.task('build', ['translate', 'copyAndInstall', 'rmaws', 'zip', 'clean']);

gulp.task('default', ['build']);

