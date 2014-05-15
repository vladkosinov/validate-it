'use strict';

require('blanket');
require('should');
var srtValidator = require('validator');
var validateIt = require('./../src/validate-it.js');
var _ = require('lodash');

var baseOpts = {
  findAllErrors: {findFirst: false},
  outputWithValidatorName: {short: true},
  isNotRequired: {required: false}
};

var baseRules = {
  nickLenMoreThan10: {name: 'nick', len: 10},
  nickLenFrom4To9: {name: 'nick', len: [4, 9]},
  nickLenExactly24: {name: 'nick', len: [24, 24]},
  nickIsNotEmpty: {name: 'nick', empty: false},
  nickIsEmpty: {name: 'nick', empty: true},
  nickIsNotRequired: {name: 'nick', required: false},
  validInterval: {
    name: ['from', 'to'],
    custom: {
      validInterval: function (val) {
        return val[0] < val[1];
      }
    },
    msg: {
      validInterval: 'Invalid interval'
    }
  },
  emailIsValid: {name: 'email',
    custom: {
      isEmail: srtValidator.isEmail
    },
    msg: {
      isEmail: 'Invalid email'
    }
  }
};

var baseData = {
  nickLen0: {nick: ''},
  nickLen3: {nick: '3xt'},
  nickLen5: {nick: '5text'},
  nickLen24: {nick: '24xtTextTextTextTextText'},
  nickUndefined: {nick: undefined},
  email: {email: 'validate-it-mania@gmail.com'},
  emailIsInvalid: {email: 'aaa@'},
  emailLen10: {email: 'a@test.com'},
  intervalFrom0To100: {from: 0, to: 100},
  intervalFrom0WithoutTo: {from: 0},
  intervalFrom100To0: {from: 100, to: 0},
  empty: [ false, [], {} ]
};

describe('when rule is object', function () {

  it('should validate property defined in THAT rule', function () {
    var data = _.extend({}, baseData.empty, baseData.nickLen3);
    var rule = baseRules.nickLenFrom4To9;
    var expectedError = {
      nick: 'Expected [4,9] symbols. Given: 3'
    };

    (validateIt(data, rule)).should.eql(expectedError);
  });
});

describe('when rule is array', function () {

  it('should validate properties defined in ALL rules', function () {
    var data = _.extend({}, baseData.emailIsInvalid, baseData.nickLen24);
    var rules = [baseRules.nickLenFrom4To9, baseRules.emailIsValid];
    var expectedError = {
      nick: 'Expected [4,9] symbols. Given: 24',
      email: 'Invalid email'
    };
    (validateIt(data, rules)).should.eql(expectedError);
  });
});


describe('when rule is not a object or array', function () {

  it('should ALWAYS return empty object', function () {
    var data = baseData.nickLen5;
    var rules = ['String', 557, true, null, undefined, NaN];
    var expectedError = {};

    rules.forEach(function (rule) {
      (validateIt(data, rule)).should.eql(expectedError);
    });
  });
});

describe('when rule\'s property "name" is array', function () {

  var rule = baseRules.validInterval; // ..name: ['from', 'to'] ...

  describe('when one of objects to validate is not exist', function () {

    var data = baseData.intervalFrom0WithoutTo;

    it('should return arrayRequired error', function () {
      var shouldBe = {
        from: 'Is required [to]',
        to: 'Is required [to]'
      };
      (validateIt(data, rule)).should.eql(shouldBe);
    });

    describe('when both objects not exist', function () {
      it('should not return any errors', function () {
        var data = {};
        var shouldBe = {
          from: 'Is required [from,to]',
          to: 'Is required [from,to]'
        };
        (validateIt(data, rule)).should.eql(shouldBe);
      });
    });

    describe('when required option set to false', function () {
      it('should not return any errors', function () {
        var shouldBe = {};
        var opts = {required: false};
        (validateIt(data, rule, opts)).should.eql(shouldBe);
      });
    });
  });


  describe('when validation fails', function () {
    it('should return same error for object to validate', function () {

      var data = baseData.intervalFrom100To0;
      var shouldBe = {
        from: 'Invalid interval',
        to: 'Invalid interval'
      };

      (validateIt(data, rule)).should.eql(shouldBe);
    });
  });

});

describe('when using the default validators', function () {

  describe('empty validator', function () {
    var rule = baseRules.nickIsNotEmpty;

    it('should return default message', function () {
      var data = baseData.nickLen0;
      var shouldBe = {nick: 'Is empty'};

      for (var i = 0; i < baseData.empty.length; i++)
        data.nick = baseData.empty[i];

      (validateIt(data, rule)).should.eql(shouldBe);
    });

    it('should return default message', function () {
      var data = {x: ''};
      var rule = {name: 'x', empty: false};
      var opts = {short: false};

      (validateIt(data, [rule], opts)).should.eql({ x: {empty: 'Is empty'}});
    });
  });

  describe('len validator', function () {
    it('Expected min 10 symbols', function () {
      var data = baseData.nickLen5;
      var rule = baseRules.nickLenMoreThan10;
      var shouldBe = {nick: 'Expected min 10 symbols. Given: 5'};
      (validateIt(data, rule)).should.eql(shouldBe);
    });

    describe('constraint is array', function () {
      it('Expected [4,9] symbols', function () {
        var data = baseData.nickLen24;
        var rule = baseRules.nickLenFrom4To9;
        var shouldBe = {nick: 'Expected [4,9] symbols. Given: 24' };
        (validateIt(data, [rule])).should.eql(shouldBe);
      });

    });
  });
});

describe('when using custom validator', function () {
  describe('without custom message', function () {
    it('should return { name: "Error" }', function () {
      var data = {name: 'borya'};
      var rule = {name: 'name', custom: {
        isUpperCase: function (value) {
          return srtValidator.isUppercase(value);
        }
      }};
      (validateIt(data, [rule])).should.eql({ name: 'Error' });
    });

  });
  describe('with custom message', function () {
    it('should return {name: "Is not UpperCase"} }', function () {
      var data = {name: 'borya'};
      var rule = {name: 'name', custom: {
        isUpperCase: function (value) {
          return srtValidator.isUppercase(value);
        }
      }, msg: {isUpperCase: "Is not UpperCase"}};
      (validateIt(data, [rule])).should.eql({name: "Is not UpperCase"});
    });

  });
});

describe('when value in undefined', function () {
  it('should return {name: "Is not UpperCase"} }', function () {
    var data = baseData.nickUndefined;
    var rule = {name: 'nick'};
    (validateIt(data, rule)).should.eql({nick: 'Is required'});
  });
});

describe('when value in undefined', function () {
  it('should return err for field of this object', function () {
    var data = undefined;
    var rule = {name: 'Ahjhjds'};
    var shouldBe = {'Ahjhjds' : 'Is required'};
    (validateIt(data, rule)).should.eql(shouldBe);
  });
});




