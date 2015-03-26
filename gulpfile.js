var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');

function publish(b) {
  b.bundle().pipe(source('main.js')).pipe(gulp.dest('./bin'));
}

gulp.task('default', function() {
  publish(browserify({
    debug: true,
    entries: ['./src/main.coffee']
  }).transform('coffeeify'));
});

gulp.task('watch', function() {
  var b = browserify({
    cache: {},
    packageCache: {},
    fullPaths: true,
    debug: true,
    entries: ['./src/main.coffee']
  }).transform('coffeeify');
  b = watchify(b);
  b.on('update', function() {
    publish(b);
  });
  publish(b);
});
