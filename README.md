# gulp-closure-css-renamer

[gulp](http://gulpjs.com/) plugin to rename CSS for Google Closure Compiler or any other compiler. 

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install --save-dev gulp-closure-css-renamer
```

## API

```javascript
var gulpClosureCSSRenamer = require('gulp-closure-css-renamer');
```

### gulpClosureCSSRenamer([*options*])

*options*: `Object`  
Return: `Object` ([stream.Tansform](https://nodejs.org/docs/latest/api/stream.html#stream_class_stream_transform))

gulpClosureCSSRenamer constructor accepts a hash as a parameter, i.e.,
`new gulpClosureCSSRenamer(options)` with the following options available:

* `sourceMap` - `boolean`. Default value: `false`.
* `compress` - `boolean`. Default value: `true`.
* `parseType` - `string`. Default value: `'any'`. Available values: `'word'`, `'full'`, `'any'`.
* `wordSeparator` - `string`. Default value: `'-'`.
* `renameFile` - `string`. Default value: `undefined`. Path to rename vocabulary file.
* `formatFunction` - `function`. Default value: 
```javascript
function(vocabularyAsArray, renameType) {
  var vocabulary = {};
  vocabularyAsArray.forEach(function(el) {
    vocabulary[el.name] = el.abbr;
  });
  return ([
    'goog.provide(\'cssVocabulary\');',
    'goog.setCssNameMapping(',
    JSON.stringify(vocabulary),
    ',' + (renameType == 'full' ? '\'BY_WHOLE\'' : '\'BY_PART\'') + ');'
  ]).join('\n');
}
```
Format function for rename vocabulary file.

## Examples

```javascript
var gulp = require('gulp');
var gulpClosureCSSRenamer = require('gulp-closure-css-renamer');

gulp.task('default', function() {
  gulp.src('./src/buttons.css')
    .pipe(gulpClosureCSSRenamer({
      sourceMap: true,
      compress: true,
      renameFile: './target/rename.js'
    }))
    .pipe(gulp.dest('target'));
});
```

[Source Maps](http://www.html5rocks.com/tutorials/developertools/sourcemaps/) can be generated by using [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps).

```javascript
var gulp = require('gulp');
var gulpClosureCSSRenamer = require('gulp-closure-css-renamer');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function() {
  gulp.src('./src/buttons.css')
    .pipe(sourcemaps.init())
    .pipe(gulpClosureCSSRenamer({
      sourceMap: true
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('target'));
});
```

Usage  with [gulp-less](https://github.com/plus3network/gulp-less).

```javascript
var gulp = require('gulp');
var less = require('gulp-less');
var gulpClosureCSSRenamer = require('gulp-closure-css-renamer');

gulp.task('less', function() {
  gulp.src('./src/less/main.less')
    .pipe(less())
    .pipe(gulpClosureCSSRenamer({
      compress: true,
      renameFile: './tmp/rename.js'
    }))
    .pipe(gulp.dest('./target/'));
});
```
