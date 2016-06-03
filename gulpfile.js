var gulp = require('gulp'),
    merge = require('merge-stream'),
    plugins = require('gulp-load-plugins')({
        rename: {
            'gulp-js-wrapper': 'wrap'
        }
    });


var jsVendor = gulp.src(["./js/polifill.js", "./js/vendor/**/*.js"]),
    jsApp = gulp.src(["./js/**/*.js", "!./js/polifill.js", "!./js/autoinit.js", "!./js/vendor/**/*.js"]),
    runFile = gulp.src(["./js/autoinit.js"]),
    jsFiles = merge(jsVendor, jsApp, runFile);

gulp.task('js:dev', function () {
    jsFiles
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
    jsFiles
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