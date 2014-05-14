validate-it
===========
Decalarative validator for JS

[![NPM version](https://badge.fury.io/js/validate-it.svg)](http://badge.fury.io/js/validate-it) [![Build Status](https://travis-ci.org/vlkosinov/validate-it.svg?branch=master)](https://travis-ci.org/vlkosinov/validate-it) [![Coverage Status](https://coveralls.io/repos/vlkosinov/validate-it/badge.png?branch=master)](https://coveralls.io/r/vlkosinov/validate-it?branch=master) [![Dependency Status](https://david-dm.org/vlkosinov/validate-it.svg)](https://david-dm.org/vlkosinov/validate-it) [![devDependency Status](https://david-dm.org/vlkosinov/validate-it/dev-status.svg)](https://david-dm.org/vlkosinov/validate-it#info=devDependencies)



## Installation
    $ npm install validate-it

## Usage

```js
var validateIt = require('validate-it');
```

**At least you must specify the *name* of the object to validate**

It's check that data's property *password* is not undefined:

```js
var rule = {name: 'password'};
var data = {password: 'qwerty'};

validateIt(data, rule); // => {}
```

Rules can be an array:

```js
var rules = [
    {name: 'password'}, 
    {name: 'login'}
];
var data = {password: 'qwerty'};

validateIt(data, rules); // => { login: 'Is required' }
```


**Built-in validators**

Will be used only if it is declared in the rule!

***empty***

```js
var data = {login: ''};
var rule = {name: 'login', empty: false};

validateIt(data, rule); // => { login: 'Is empty' }
```

***len***

```js
var data = {login: 'short'};
var rule = {
    name: 'login',
    len: [9, 20]
};
validateIt(data, rule); // => { login: 'Expected [9,20] symbols. Given: 5' }
```

```js
var data = {login: 'short'};
var rule = {name: 'login', len: 6};
validateIt(data, rule); // => { login: 'Expected min 6 symbols. Given: 5' }
```

License
----

MIT
