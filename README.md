validate-it
===========

[![NPM version](https://badge.fury.io/js/validate-it.svg)](http://badge.fury.io/js/validate-it) [![Build Status](https://travis-ci.org/vlkosinov/validate-it.svg?branch=master)](https://travis-ci.org/vlkosinov/validate-it) [![Coverage Status](https://coveralls.io/repos/vlkosinov/validate-it/badge.png?branch=master)](https://coveralls.io/r/vlkosinov/validate-it?branch=master) [![Dependency Status](https://david-dm.org/vlkosinov/validate-it.svg)](https://david-dm.org/vlkosinov/validate-it) [![devDependency Status](https://david-dm.org/vlkosinov/validate-it/dev-status.svg)](https://david-dm.org/vlkosinov/validate-it#info=devDependencies)

Decalarative validator for JS

## Installation

    $ npm install validate-it


```js
var validateIt = require('validate-it');

var rule = {
    name: 'email',
    required: true,
    empty: false,
    len: [6, 100],
    custom: {
      invalidEmail: function (value) {
        return strValidator.isEmail(value);
      }
    },
    msg: {
      empty: 'Email is empty', //custom message, can be omitted
      len: function(val, rule) {
        var min = Array.isArray(rule.len) ? rule.len[0] : rule.len;
        return 'Must be at least ' + min + ' characters';
      },
      invalidEmail: 'My custom message for custom rule'
    }
};
```
validateIt(someObj, rule);

