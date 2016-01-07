# ngoose

> javascript object factory with defaults.

ngoose does one thing well: it create new objects with default fields values based on a schema definition.


[![Travis Build Status](https://img.shields.io/travis/parro-it/ngoose.svg)](http://travis-ci.org/parro-it/ngoose)
[![NPM module](https://img.shields.io/npm/v/ngoose.svg)](https://npmjs.org/package/ngoose)
[![NPM downloads](https://img.shields.io/npm/dt/ngoose.svg)](https://npmjs.org/package/ngoose)

[![Test Coverage](https://codeclimate.com/github/parro-it/ngoose/badges/coverage.svg)](https://codeclimate.com/github/parro-it/ngoose/coverage)
[![Code Climate](https://codeclimate.com/github/parro-it/ngoose.png)](https://codeclimate.com/github/parro-it/ngoose)
[![Issue Count](https://codeclimate.com/github/parro-it/ngoose/badges/issue_count.svg)](https://codeclimate.com/github/parro-it/ngoose)

## Installation

```bash
npm install --save ngoose
```
## Usage

```js
const model = require('ngoose');

const user = model({
  age: Number,
  name: String
});

const instance = user();
console.log(instance);
```
> {
>   age: 0,
>   name: ""
> }

You can supply data to the factory method:

```js
const instance = user({
  name: 'Garibaldi'
});
console.log(instance);
```
> {
>   age: 0,
>   name: "Garibaldi"
> }

Supplied fields that are not defined in schema are not inserted in created instance:

```js
const instance = user({
  name: 'Garibaldi',
  address: 'somewhere'
});
console.log(instance);
```
> {
>   age: 0,
>   name: "Garibaldi"
> }



You can specify default values in schema:

```js
const user = model({
  address: [String, 'somewhere'],
  name: [String, 'Garibaldi']
});

const instance=user();
console.log(instance);
```
> {
>   address: "somewhere",
>   name: "Garibaldi"
> }


You can compose models with other models or with inlined objects:

```js
  const user = model({
     name: [String, 'unknown'],
     cool: [Boolean, true]
  });

  const bill = model({
     customer: user,
     payment: {
        terms: String,
        days: [Number, 30]
     }
  });

  const instance = bill();
  console.log(instance);
```
> {
>   customer: {
>     name: 'unknown',
>     cool: true
>   },
>   payment: { terms: '', days: 30 }
> }


## Examples

See [tests](test.js) for further usage examples.

## License

The MIT License (MIT)

Copyright (c) 2015 parro-it
