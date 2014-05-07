"use strict";

var strValidator = require('validator');
var _ = require('lodash');

var defaultValidators = {
  len: function (value, rule) {
    var result = false;
    if (strValidator.isInt(rule.len)) {
      result = strValidator.isLength(value, rule.len);
    } else if (isArrayOfLength(rule.len, 2)) {
      result = strValidator.isLength(value, rule.len[0], rule.len[1]);
    }
    return result;
  },
  empty: function (value, rule) {
    var shouldBeEmpty = !!rule.empty;
    return shouldBeEmpty ? _.isEmpty(value) : !_.isEmpty(value);
  }
};

var defaultMessages = {
  len: function (value, rule) {
    var msg = 'Invalid len';

    if (strValidator.isInt(rule.len)) {
      msg = 'Expected min ' + rule.len + ' symbols';
    } else if (isArrayOfLength(rule.len, 2)) {
      msg = 'Expected [' + rule.len[0] + ',' + rule.len[1] + ']  symbols.';
    }

    msg += ' Given: ' + value.length;

    return msg;
  },
  required: 'Is undefined',
  empty: 'Is empty',
  arrayMiss: 'Some filed is not exist',
  default: 'Error'
};

var defaultOptions = {
  required: true,
  findFirst: true,
  short: true
};

function validate(value, rule, options) {
  var isRequired = _.isUndefined(rule.required) ? options.required : rule.required;
  var isFindFirst = _.isUndefined(rule.findFirst) ? options.findFirst : rule.findFirst;
  var isShort = _.isUndefined(rule.short) ? options.short : rule.short;
  var errors = {};
  var validators = [];

  if (_.isUndefined(value))
    return isRequired ? {isRequired: createMessage('required', value, rule)} : {};

  if (_.isArray(rule.name) && _.isArray(value))
    if (isRequired && _.some(value, function (val) {
      return _.isUndefined(val);
    })) return {isRequired: createMessage('arrayMiss', value, rule)};

  _.forOwn(defaultValidators, function (validatorFunc, validatorName) {
    if (!_.isUndefined(rule[validatorName])) {
      validators.push([validatorName, validatorFunc]);
    }
  });

  _.forOwn(rule.custom, function (validatorFunc, validatorName) {
    if (_.isFunction(validatorFunc)) {
      validators.push([validatorName, validatorFunc]);
    }
  });

  for (var i = 0; i < validators.length; i++) {
    var validatorName = validators[i][0];
    var validatorFunc = validators[i][1];
    var result = validatorFunc(value, rule);
    if (!result) {
      if (isShort) return createMessage(validatorName, value, rule);
      errors[validatorName] = createMessage(validatorName, value, rule);
    }
    if (_.size(errors) && isFindFirst) break;
  }

  return errors;
}

function createMessage(validatorName, value, rule) {
  var message;
  if (_.isObject(rule.msg) && !_.isUndefined(rule.msg[validatorName])) {
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

function isArrayOfLength(obj, len) {
  return _.isArray(obj) && obj.length === len;
}

function arrayFromKeysOf(keys, of) {
  var value = [];
  for (var i = 0; i < keys.length; i++) {
    var keyName = keys[i];
    value.push(of[keyName]);
  }
  return value;
}

function validateRule(toCheck, rule, options) {
  var value;

  if (_.isArray(rule.name)) {
    value = arrayFromKeysOf(rule.name, toCheck);
  } else {
    value = toCheck[rule.name];
  }
  var errors = validate(value, rule, options);
  return _.isEmpty(errors) ? null : errors;
}

function fillOptions(opt) {
  var result = {};
  _.forOwn(defaultOptions, function(value, name) {
    result[name] = _.isUndefined(opt[name]) ? value : opt[name];
  });
  return result;
}

module.exports = function (objectToCheck, rules, opt) {
  var errors = {};
  var options = _.isUndefined(opt)
    ? defaultOptions
    : fillOptions(opt);

  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    var error = validateRule(objectToCheck, rule, options);
    if (error === null) continue;

    if (_.isArray(rule.name)) {
      for (var j = 0; j < rule.name.length; j++) {
        errors[rule.name[j]] = error;
      }
    } else {
      errors[rule.name] = error;
    }
  }

  return errors;
};