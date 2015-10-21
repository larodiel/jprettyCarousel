var gulp         = require('gulp'),
    coffee       = require('gulp-coffee'),
    sourcemaps   = require('gulp-sourcemaps'),
    gutil        = require('gulp-util'),
    watch        = require('gulp-watch'),
    path         = require('path'),
    pkg          = require('./package.json');

//var coffee_compiler =

gulp.task("coffee", function(){

    gulp.src(pkg.paths.assets+'/coffee/**/*.coffee')
      .pipe(sourcemaps.init())
      .pipe(coffee({ bare: true })).on('error', gutil.log)
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(pkg.paths.dist+'/js'));

});


gulp.task('watch', function(){
    console.log(path.join(__dirname,'/assets/*.coffee'));
    gulp.watch(pkg.paths.assets+'/coffee/**/*.coffee', ['coffee']);
});