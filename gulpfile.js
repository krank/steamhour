var gulp = require("gulp");

var sass = require("gulp-sass")(require('sass'));
var cleanCSS = require("gulp-clean-css");
sass.compiler = require("sass");

var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var tsify = require("tsify");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");

gulp.task("sass", function () {
  return gulp
    .src("src/scss/*.scss")
    .pipe(sass()) /* Compile scss to css */
    .pipe(cleanCSS()) /* Minify css */
    .pipe(gulp.dest("css"));
});

gulp.task("typescript", function () {
  return browserify({
    entries: ["src/ts/script.ts"],
  })
    .plugin(tsify) /* Compile to js */
    .bundle()
    .pipe(source("bundle.js")) /* Create source (filename is temporary & actually unused) */
    .pipe(buffer()) /* Connect source to buffer */
    .pipe(sourcemaps.init({ loadMaps: true })) /* Prepare sourcemap generation */
    .pipe(uglify()) /* Minify the js - also generates sourcemaps */
    .pipe(sourcemaps.write("./")) /* Write sourcemaps */
    .pipe(gulp.dest("js")); /* Output result to folder 'dist' */
});

gulp.task("watch", function () {
  gulp.watch("src/**/*.scss", gulp.series("sass"));
  gulp.watch("src/**/*.ts", gulp.series("typescript"));
});

gulp.task("default", gulp.series("sass", "typescript", "watch"));
