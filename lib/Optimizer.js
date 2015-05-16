/**
 * Created by fima on 17.01.15.
 */

module.exports = (function() {
  var Optimizer = function() {
    this.sm_ = false;
    this.compress_ = true;
    this.parserType_ = 'any';
    this.separator_ = '-';
    this.inputFileName_ = '';

    this.css_ = require('css');


    var CssSelectorParser = require('css-selector-parser').CssSelectorParser;

    this.parser_ = new CssSelectorParser();

    this.parser_.registerSelectorPseudos('has');
    this.parser_.registerNestingOperators('>', '+', '~');
    this.parser_.registerAttrEqualityMods('^', '$', '*', '~');
    this.parser_.enableSubstitutes();
  };
  Optimizer.prototype = {
    parseSelector: function(selector) {
      if (selector.classNames != undefined && selector.classNames.length) {
        for (var i = 0; i < selector.classNames.length; i++) {
          this.classNameStore_.addClass(selector.classNames[i]);
        }
      }
      if (selector.rule != undefined) {
        this.parseSelector(selector.rule);
      }
    },
    parseRule: function(rule) {
      if (rule.type == 'rule') {
        for (var i = 0; i < rule.selectors.length; i++) {
          this.parseSelector(this.parser_.parse(rule.selectors[i]));
        }
      } else {
        if (rule.type == 'media') {
          for (i = 0; i < rule.rules.length; i++) {
            this.parseRule(rule.rules[i]);
          }
        }
      }
    },
    minimizeSelector: function(selector) {
      if (selector.classNames != undefined && selector.classNames.length) {
        for (var i = 0; i < selector.classNames.length; i++) {
          selector.classNames[i] =
            this.classNameStore_.getNewClassName(selector.classNames[i]);
        }
      }
      if (selector.rule != undefined) {
        selector.rule = this.minimizeSelector(selector.rule);
      }
      return selector;
    },
    minimizeRule: function(rule) {
      if (rule.type == 'rule') {
        for (var i = 0; i < rule.selectors.length; i++) {
          rule.selectors[i] = this.parser_.render(
            this.minimizeSelector(this.parser_.parse(rule.selectors[i]))
          );
        }
      } else {
        if (rule.type == 'media') {
          for (i = 0; i < rule.rules.length; i++) {
            rule.rules[i] = this.minimizeRule(rule.rules[i]);
          }
        }
      }
      return rule;
    },
    render: function(str) {
      var ClassNamesStore = require('./ClassNamesStore');
      this.classNameStore_ = new ClassNamesStore(
        this.parserType_,
        this.separator_
      );

      var obj = this.css_.parse(str, {source: this.inputFileName_});

      for (var i = 0; i < obj.stylesheet.rules.length; i++) {
        this.parseRule(obj.stylesheet.rules[i]);
      }
      this.classNameStore_.calcVocabulary();

      for (i = 0; i < obj.stylesheet.rules.length; i++) {
        obj.stylesheet.rules[i] =
          this.minimizeRule(obj.stylesheet.rules[i]);
      }

      var result = this.css_.stringify(obj, {
        sourcemap: this.sm_,
        compress: this.compress_
      });

      var r = {
        css: (this.sm_ ? result.code : result)
      };
      if (this.sm_) {
        r.map = result.map;
      }
      return r;
    },
    setSourceMap: function(v) {
      this.sm_ = v;
      return this;
    },
    setCompress: function(v) {
      this.compress_ = v;
      return this;
    },
    setParseType: function(v) {
      this.parserType_ = v;
      return this;
    },
    setWordSeparator: function(v) {
      this.separator_ = v;
      return this;
    },
    getVocabularyFileContent: function(f) {
      return f(this.classNameStore_.getVocabulary());
    },
    setInputFileName: function(v) {
      this.inputFileName_ = v;
      return this;
    }
  };

  return Optimizer;
})();
