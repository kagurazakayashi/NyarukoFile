// 引入壓縮需要的外掛
const gulp = require('gulp');
const uglify = require('gulp-uglify'); // 壓縮 JS
const css = require('gulp-clean-css'); // 壓縮 CSS
const html = require('gulp-htmlmin'); // 壓縮 HTML

// 壓縮 JS
gulp.task('js', function () {
    return gulp.src('./src/*.js') // 輸入檔案
        .pipe(uglify()) // 執行壓縮
        .pipe(gulp.dest('dist/js')); // 輸出檔案
});

// 壓縮 CSS
gulp.task('css', async () => {
    await gulp.src(['./src/*.css']) // 輸入檔案
        .pipe(css()) // 執行壓縮
        .pipe(gulp.dest('./dist/')); // 輸出檔案
});

// 壓縮 HTML
gulp.task('html', async () => {
    await gulp.src(['./html/*.html']) // 輸入檔案
        .pipe(html({ collapseWhitespace: true, removeComments: true })) // 刪除空格和註釋
        .pipe(gulp.dest('./dist/')); // 輸出檔案
});