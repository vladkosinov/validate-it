var should = require('should');
var validateIt = require('./../src/validate-it.js');

var rules = [
  {
    name: 'username',
    required: true,
    len: [3, 20],
    msg: {
      required: 'Ohooho user name required'
    }
  },
  {
    name: 'password',
    required: true,
    len: [3, 20]
  }
];

var validData = [
  {username: 'vladko', password: 'qqq'}
];

describe('validate-it tests', function() {
  it("should not find errors", function() {
    validData.forEach(function (key) {
      (validateIt(key, rules)).should.be.empty;
    });
  });
});