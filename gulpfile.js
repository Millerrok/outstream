var gulp = require('gulp'),
    merge = require('merge-stream'),
    plugins = require('gulp-load-plugins')({
        rename: {
            'gulp-js-wrapper': 'wrap'
        }
    });


var jsFiles = [
    "./js/polifill.js",
    "./js/vendor/**/*.js",
    "./js/event.manager.js",
    "./js/flash-client/wrapper.js",
    "./js/flash-client/flash.client.js",
    "./js/js-client/js.client.js",
    "./js/main.js",
    "./js/autoinit.js"
];

gulp.task('js:dev', function () {
    gulp.src(jsFiles)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('outstream.js'))
        .pipe(plugins.wrap({
            safeUndef: true,
            globals: {
                'window': 'root'
            }
        }))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest('./dist'));
});
gulp.task('js:prod', function () {
    gulp.src(jsFiles)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('outstream.min.js'))
        .pipe(plugins.wrap({
            safeUndef: true,
            globals: {
                'window': 'root'
            }
        }))
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest('./dist'));
});

gulp.task('js', ['js:dev', 'js:prod']);

gulp.task('clean', function () {
    return gulp.src('./dist/', {read: false})
        .pipe(plugins.clean());
});

gulp.task('serve', function () {
    gulp.src('./')
        .pipe(plugins.webserver({
            livereload: true,
            port: '9090',
            open: true
        }));
});
gulp.task('watch', ['js:dev'], function () {
    gulp.watch('./js/**/*.js', ['js:dev']);
});

gulp.task('default', ['clean', 'watch', 'serve']);
gulp.task('build', ['clean', 'js']);