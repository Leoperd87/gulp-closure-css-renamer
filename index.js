/**
 * Created by fima on 16.01.15.
 */
var fs = require('fs');
var path = require('path');

var through2 = require('through2');
var applySourceMap = require('vinyl-sourcemaps-apply');

module.exports = function(options) {

  var merge = function(a, b) {
    for (var key in a) {
      if (a.hasOwnProperty(key)) {
        b[key] = a[key];
      }
    }
    return b;
  };

  options = merge(options || {}, {
    sourceMap: false,
    compress: true,
    parseType: 'any',
    wordSeparator: '-',
    renameFile: undefined,
    formatFunction: function(vocabularyAsArray, renameType) {
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
  });

  return through2.obj(function(file, enc, cb) {

    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError(
        'gulp-cssMinimizer',
        'Streaming not supported'
      ));
    }

    var str = file.contents.toString('utf8');

    var Optimizer = require('./lib/Optimizer');
    var optimizer = new Optimizer();


    var result = optimizer
      .setSourceMap(options.sourceMap)
      .setCompress(options.compress)
      .setParseType(options.parseType)
      .setWordSeparator(options.wordSeparator)
      .setInputFileName(file.path)

      .render(str);

    if (options.renameFile !== undefined) {
      fs.writeFile(
        options.renameFile,
        optimizer.getVocabularyFileContent(options.formatFunction),
        function(err) {
          if (err) {
            return console.log(err);
          }

          console.log('The vocabulary file was saved!');
        });
    }

    var css = result.css;

    file.contents = new Buffer(css);

    if (options.sourceMap) {
      var sourceMap = result.map;
      for (var i = 0; i < sourceMap.sources.length; i++) {
        sourceMap.sources[i] = path.relative(file.base, sourceMap.sources[i]);
      }
      sourceMap.file = file.relative;
      applySourceMap(file, sourceMap);
    }

    cb(null, file);
  });
};
