var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')({
        rename: {
            'gulp-js-wrapper': 'wrap'
        }
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

gulp.task('serve', function() {
    gulp.src('./')
        .pipe(plugins.webserver({
            port:'9090',
            open: true
        }));
});

gulp.task('default', ['clean', 'js']);