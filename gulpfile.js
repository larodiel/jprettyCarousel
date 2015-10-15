var gulp         = require('gulp'),
    coffee       = require('gulp-coffee'),
    sourcemaps   = require('gulp-sourcemaps'),
    gutil        = require('gulp-util'),
    watch        = require('gulp-watch'),
    pkg          = require('./package.json');

//var coffee_compiler =

gulp.task("coffee-compiler", function(){

    gulp.src(pkg.paths.assets+'/coffee/**/*.coffee')
      .pipe(sourcemaps.init())
      .pipe(coffee({ bare: true })).on('error', gutil.log)
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(pkg.paths.dist+'/js'));

});


gulp.task('watch', function(){
    watch('assets/**/*.coffee', ['coffee-compiler']);
});