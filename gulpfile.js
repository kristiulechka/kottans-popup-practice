const gulp = require('gulp'),
  sass = require('gulp-sass'),
  csso = require('gulp-csso'),
  gutil = require('gulp-util'),
  clean = require('gulp-clean'),
  notify = require('gulp-notify'),
  uglify = require('gulp-uglify'),
  gcmq = require('gulp-group-css-media-queries'),
  imagemin = require('gulp-imagemin'),
  sourcemaps = require('gulp-sourcemaps'),
  minifyHTML = require('gulp-minify-html'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create();

// запуск сервера
gulp.task('server', function () {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    port: "3000"
  });

  gulp.watch(['./src/*.html']).on('change', browserSync.reload);
  gulp.watch('./src/style/**/*', ['sass']);
  gulp.watch('./src/**/**/*', ['html-transfer']);
  gulp.watch('./src/fonts/**/*', ['fonts-transfer']);
  gulp.watch('./src/img/**/*', ['img-transfer']);
});

// компиляция sass/scss в css
gulp.task('sass', function () {
  gulp.src(['./src/style/**/*.scss', './src/style/**/*.sass'])
    .pipe(sourcemaps.init())
    .pipe(
      sass({outputStyle: 'expanded'})
        .on('error', gutil.log)
    )
    .on('error', notify.onError())
    .pipe(gcmq())
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browserSync.stream());
});


// перемещение html в dist
gulp.task('html-transfer', function () {
  gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./dist'))
});

// перемещение images в dist
gulp.task('img-transfer', function () {
  gulp.src('./src/img/**/*')
    .pipe(gulp.dest('./dist/img'))
});

//перемещение шрифтов в dist
gulp.task('fonts-transfer', function () {
  gulp.src('./src/fonts/*.{eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest('./dist/fonts'));
});

//////BUILD//////

// сжатие картинок
gulp.task('minify:img', function () {
  return gulp.src(['./dist/img/**/*'])
    .pipe(imagemin().on('error', gutil.log))
    .pipe(gulp.dest('./build/img/'));
});

// сжатие css
gulp.task('minify:css', function () {
  gulp.src('./dist/css/**/*.css')
    .pipe(autoprefixer({
      browsers: ['last 5 versions'],
      cascade: false
    }))
    .pipe(csso())
    .pipe(gulp.dest('./build/css/'));
});

// сжатие html
gulp.task('minify:html', function () {
  var opts = {
    conditionals: true,
    spare: true
  };

  return gulp.src(['./dist/*.html'])
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('./build'));
});

//перемещение шрифтов в build
gulp.task('fonts-build', function () {
  gulp.src('./dist/fonts/**/*.{eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest('./build/fonts/'));
});

// удалить папку build
gulp.task('clean', function () {
  return gulp.src('./build', {read: false}).pipe(clean());
});

// запуск gulp
gulp.task('default', ['server', 'sass', 'html-transfer', 'fonts-transfer', 'img-transfer']);

// при вызове gulp build будут сжаты все ресурсы в build
gulp.task('build', ['minify:html', 'minify:css', 'minify:img', 'fonts-build']);
