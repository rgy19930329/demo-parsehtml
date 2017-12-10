var gulp = require('gulp');
var electron = require('electron-connect').server.create();
var less = require('gulp-less');

gulp.task('watch:electron', function () {
  electron.start();
  gulp.watch(['./app/*.less'], () => {
    return gulp.src('./app/*.less')
    .pipe(less())
    .pipe(gulp.dest('./app'));
  });
  gulp.watch(['./*.js'], electron.restart);
  gulp.watch(['./app/*.{html,js,css}'], electron.restart);
});