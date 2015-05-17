/**
 * Created by fima on 17.01.15.
 */

module.exports = (function() {
  var ClassNamesStore = function(parserType, separator) {
    this.fullNameStore_ = {};
    this.wordStore_ = {};
    this.separator_ = separator;
    this.parserType_ = parserType;
    this.avaliableFirstSymbols_ = 'abcdefghijklmnopqrstuvwxyz';
    this.avaliableOtherSymbols_ = 'abcdefghijklmnopqrstuvwxyz' +
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  };
  ClassNamesStore.prototype = {
    addClass: function(className) {
      if (this.fullNameStore_[className] == undefined) {
        this.fullNameStore_[className] = {
          count: 1,
          name: className
        };
      } else {
        this.fullNameStore_[className].count++;
      }
      if (this.parserType_ == 'any' || this.parserType_ == 'word') {
        var words = className.split(this.separator_);
        for (var i = 0; i < words.length; i++) {
          this.addWord_(words[i]);
        }
      }
    },
    addWord_: function(word) {
      if (this.wordStore_[word] == undefined) {
        this.wordStore_[word] = {
          count: 1,
          name: word
        };
      } else {
        this.wordStore_[word].count++;
      }
    },
    numberToCode_: function(number) {
      var r = this
        .avaliableFirstSymbols_[number % this.avaliableFirstSymbols_.length];
      number = Math.floor(number / this.avaliableFirstSymbols_.length);

      while (number > 0) {
        r += this
          .avaliableOtherSymbols_[number % this.avaliableOtherSymbols_.length];
        number = Math.floor(number / this.avaliableOtherSymbols_.length);
      }

      return r;
    },
    calcVocabulary: function() {
      var fullNameStoreAsArray = [];
      var wordStoreAsArray = [];
      var fullNameProfitSum = 0;
      var wordProfitSum = 0;

      if (this.parserType_ == 'any' || this.parserType_ == 'word') {
        for (var key in this.wordStore_) {
          if (this.wordStore_.hasOwnProperty(key)) {
            wordStoreAsArray.push(this.wordStore_[key]);
          }
        }
        wordStoreAsArray.sort(function(a, b) {
          return b.count - a.count;
        });
        this.wordStore_ = {};
        for (var i = 0; i < wordStoreAsArray.length; i++) {
          wordStoreAsArray[i].wordAbbr = this.numberToCode_(i);
          this.wordStore_[wordStoreAsArray[i].name] = wordStoreAsArray[i];
        }
      }

      for (key in this.fullNameStore_) {
        if (this.fullNameStore_.hasOwnProperty(key)) {
          fullNameStoreAsArray.push(this.fullNameStore_[key]);
        }
      }
      fullNameStoreAsArray.sort(function(a, b) {
        return b.count - a.count;
      });
      this.fullNameStore_ = {};

      for (i = 0; i < fullNameStoreAsArray.length; i++) {

        if (this.parserType_ == 'any' || this.parserType_ == 'full') {
          var fullNameAbbr = this.numberToCode_(i);
          fullNameStoreAsArray[i].fullNameAbbr = fullNameAbbr;
          fullNameStoreAsArray[i].fullNameProffit =
            (fullNameStoreAsArray[i].name.length - fullNameAbbr.length) *
            fullNameStoreAsArray[i].count;
          fullNameProfitSum += fullNameStoreAsArray[i].fullNameProffit;
        }


        if (this.parserType_ == 'any' || this.parserType_ == 'word') {
          var words = fullNameStoreAsArray[i].name.split(this.separator_);
          for (var j = 0; j < words.length; j++) {
            words[j] = this.wordStore_[words[j]].wordAbbr;
          }
          fullNameStoreAsArray[i].wordAbbr = words.join(this.separator_);
          fullNameStoreAsArray[i].wordsProffit =
            (fullNameStoreAsArray[i].name.length -
            fullNameStoreAsArray[i].wordAbbr.length) *
            fullNameStoreAsArray[i].count;
          wordProfitSum += fullNameStoreAsArray[i].wordsProffit;
        }

        this.fullNameStore_[fullNameStoreAsArray[i].name] =
          fullNameStoreAsArray[i];
      }

      if (this.parserType_ == 'full' || this.parserType_ == 'any') {
        console.log('Full name optimization profit : ' + fullNameProfitSum);
      }
      if (this.parserType_ == 'word' || this.parserType_ == 'any') {
        console.log('Word-by-word optimization profit : ' + wordProfitSum);
      }
      var vocabulary = [];
      if (this.parserType_ == 'any') {
        if (fullNameProfitSum >= wordProfitSum) {
          this.parserType_ = 'full';
          console.log('Recommended method : \'full\'');
          //console.log(JSON.stringify(fullNameStoreAsArray));
        } else {
          this.parserType_ = 'word';
          console.log('Recommended method : \'word\'');
          console.log(JSON.stringify(wordStoreAsArray));
        }
      }
      if (this.parserType_ == 'full') {
        fullNameStoreAsArray.forEach(function(el) {
          vocabulary.push({name: el.name, abbr: el.fullNameAbbr});
        });
      }
      if (this.parserType_ == 'word') {
        fullNameStoreAsArray.forEach(function(el) {
          vocabulary.push({name: el.name, abbr: el.wordAbbr});
        });
      }
      this.renameVocabularu_ = vocabulary;
    },
    getVocabulary: function() {
      return this.renameVocabularu_;
    },
    getNewClassName: function(className) {
      if (this.parserType_ == 'full') {
        return this.fullNameStore_[className].fullNameAbbr;
      } else {
        return this.fullNameStore_[className].wordAbbr;
      }
    },
    getRenameType: function() {
      return this.parserType_;
    }
  };

  return ClassNamesStore;
})();
