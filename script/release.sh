script/clean.sh
gulp css html
rm -f src/*.css
mv dist/index.html ./index.html
webpack --mode=production --progress
