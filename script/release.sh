script/clean.sh
python3 src/nyalib/Tools/nyacss.py css src -z
gulp css html
rm -f src/*.css
mv dist/index.html ./index.html
webpack --mode=production --progress
