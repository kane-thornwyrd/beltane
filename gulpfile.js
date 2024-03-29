const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('build', () =>
  gulp.src('src/**/*.js')
    .pipe(babel({
      babelrc: true
    }))
    .pipe(gulp.dest('lib'))
);


gulp.task('default', [ 'build' ]);
