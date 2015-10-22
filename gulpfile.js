var gulp         = require('gulp'),
    coffee       = require('gulp-coffee'),
    sourcemaps   = require('gulp-sourcemaps'),
    gutil        = require('gulp-util'),
    watch        = require('gulp-watch'),
    path         = require('path'),
    rename       = require('gulp-rename'),
    uglify       = require('gulp-uglify'),
    sass         = require('gulp-sass'),
    pkg          = require('./package.json');

//var coffee_compiler =

gulp.task("coffee", function(){

    gulp.src(pkg.paths.assets+'/coffee/**/*.coffee')
      .pipe(sourcemaps.init())
      .pipe(coffee({ bare: true })).on('error', gutil.log)
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(pkg.paths.dist+'/js'));
});

gulp.task("compress", function(){
  gulp.src(pkg.paths.dist+'/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(pkg.paths.dist+'/js'))
    .pipe(rename({suffix: '.min'}));
});



gulp.task("sass", function(){

  gulp.src(pkg.paths.assets+'/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(pkg.paths.dist+'/css'))
    .pipe(rename({suffix: '.min'}));

});

gulp.task('watch', function(){
    gulp.watch(pkg.paths.assets+'/coffee/**/*.coffee', ['coffee']);

    gulp.watch(pkg.paths.assets+'/sass/**/*.scss', ['sass']);
});