var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')({
        rename: {
            'gulp-js-wrapper': 'wrap'
        }
    });
gulp.task('js:dev', function () {
    gulp.src("./js/**")
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('outstream.js'))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest('./dist'));
});
gulp.task('js', function () {
    gulp.src("./js/**")
        .pipe(plugins.concat('outstream.js'))
        .pipe(plugins.wrap({
            safeUndef: true,
            globals: {
                'window': 'root'
            }
        }))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('./dist'));
});

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