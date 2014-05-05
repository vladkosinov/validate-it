"use strict";

var strValidator = require('validator');
var _ = require('lodash');

var defaultValidators = {
  notEmpty: function (value) {
    return !_.isEmpty(value);
  },
  len: function (value, rule) {
    var result = false;
    if (strValidator.isInt(rule.len)) {
      result = strValidator.isLength(value, rule.len);
    } else if (isArrayOfTwoLength(rule.len)) {
      result = strValidator.isLength(value, rule.len[0], rule.len[1]);
    }
    return result;
  }
};

var defaultMessages = {
  len: function (value, rule) {
    var msg = 'Invalid len';

    if (strValidator.isInt(rule.len)) {
      msg = 'Expected min ' + rule.len + ' symbols';
    } else if (isArrayOfTwoLength(rule.len)) {
      msg = 'Expected [' + rule.len[0] + ',' + rule.len[1] + ']  symbols.';
    }

    msg += ' Given: ' + value.length;

    return msg;
  },
  notEmpty: 'Is empty',
  isUndefined: 'Is undefined',
  default: 'Error'
};

var defaultOptions = {
  required: true,
  findFirst: true
};

function validate(value, rule) {
  var isRequired = _.isUndefined(rule.required) ? defaultOptions.required : rule.required;
  var isFindFirst = _.isUndefined(rule.findFirst) ? defaultOptions.findFirst : rule.findFirst;
  var ruleErrors = {};
  var validators = [];

  if (_.isUndefined(value) && isRequired)
    return isRequired ? {isRequired: prepareMessage('isRequired', value, rule)} : {};

  _.forOwn(defaultValidators, function (value, key) {
    if (!_.isUndefined(rule[key])) {
      validators.push([key, value]);
    }
  });

  _.forOwn(rule.custom, function (value, key) {
    if (_.isFunction(value)) {
      validators.push([key, value]);
    }
  });

  for (var i = 0; i < validators.length; i++) {
    var validatorName = validators[i][0];
    var validatorFunc = validators[i][1];
    var result = validatorFunc(value, rule);
    if (!result) {
      ruleErrors[validatorName] = prepareMessage(validatorName, value, rule);
    }
    if (_.size(ruleErrors) && isFindFirst) break;
  }

  return ruleErrors;
}

function prepareMessage(validatorName, value, rule) {
  var message;
  if (!_.isUndefined(rule.msg[validatorName])) {
    message = rule.msg[validatorName];
  } else if (!_.isUndefined(defaultMessages[validatorName])) {
    message = defaultMessages[validatorName];
  } else {
    message = defaultMessages['default'];
  }

  if (_.isFunction(message))
    return message(value, rule);
  else if (_.isString(message))
    return message;
}

function isArrayOfTwoLength(obj) {
  return _.isArray(obj) && obj.length === 2;
}

var validateIt = function (objectToCheck, rules) {
  var errors = {};
  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    errors[rule.name] = validate(objectToCheck[rule.name], rule);
  }
  return errors;
};

module.exports = validateIt;