'use strict';
const test = require('tape');
const model = require('../lib/ngoose');

test('ngoose is a function', t => {
  t.equal(typeof model, 'function');
  t.end();
});

test('calling ngoose return a model factory', t => {
  t.equal(typeof model({}), 'function');
  t.end();
});


test('calling ngoose throws with undefined definition', t => {
  t.throws(() => model());
  t.end();
});

test('calling ngoose throws with null definition', t => {
  t.throws(() => model(null));
  t.end();
});

test('calling ngoose throws with numeric definition', t => {
  t.throws(() => model(12));
  t.end();
});

test('calling ngoose throws with string definition', t => {
  t.throws(() => model('test'));
  t.end();
});

test('calling ngoose throws with regexp definition', t => {
  t.throws(() => model(/test/));
  t.end();
});

test('calling ngoose throws with array definition', t => {
  t.throws(() => model([]));
  t.end();
});

test('calling ngoose throws with array definition', t => {
  t.throws(() => model([]));
  t.end();
});


function couldBe(def, value) {
  test('definition fields could be ' + def, t => {
    t.equal(model({field1: value}).definition.field1, value);
    t.end();
  });
}

function throwsWith(def, value) {
  test('definition fields throws with ' + def, t => {
    t.throws(() => model({field1: value}));
    t.end();
  });
}

couldBe('String', String);
couldBe('Date', Date);
couldBe('Number', Number);
couldBe('Array of types', [Number]);
couldBe('Object', {f: Number});
throwsWith('undefined', undefined);
throwsWith('null', null);
throwsWith('regexp', /aregexp/);
throwsWith('string', '/astring/');
throwsWith('number', 42);
throwsWith('Date instance', new Date());
throwsWith('function', function() {});

throwsWith('unvalid subobject', {f: ''});
throwsWith('unvalid array', ['']);
throwsWith('empty array', []);
couldBe('multielement array with default values', [Number, 12]);


test('model definition are saved on instances', t => {
  t.equal(model({a: Number}).definition.a, Number);
  t.end();
});

test('each model has its definition', t => {
  const model1 = model({a: String});
  const model2 = model({a: Number});
  t.equal(model1.definition.a, String);
  t.equal(model2.definition.a, Number);
  t.end();
});

const user = model({
  age: Number,
  name: String,
  cool: Boolean
});
const instance = user();

test('created model factory is defined', t => {
  t.equal(typeof user, 'function');
  t.end();
});

test('created model factory return model instance', t => {
  t.equal(typeof instance, 'object');
  t.end();
});

test('model instance has default properties', t => {
  const expectedValue = {
    age: 0,
    name: '',
    cool: false
  };
  t.deepEqual(instance, expectedValue);
  t.end();
});

test('supplied properties values are kept', t => {
  const u = user({age: 42});
  t.equal(u.age, 42);
  t.end();
});

test('undefined supplied properties values are removed', t => {
  const u = user({notDefined: 42});
  const expectedValue = {
    age: 0,
    name: '',
    cool: false
  };
  t.deepEqual(u, expectedValue);
  t.end();
});


const user2 = model({
  age: [Number, 42],
  name: [String, 'unknown'],
  born: [Date, new Date(1976, 1, 3)],
  cool: [Boolean, true],
  aField: [String, function() {return 'UNKNOWN';}]
});
const instance4 = user2();


test('use default for numbers', t => {
  t.equal(instance4.age, 42);
  t.end();
});

test('use default for strings', t => {

  t.equal(instance4.name, 'unknown');
  t.end();
});

test('use default for dates', t => {

  t.equal(instance4.born.getTime(), new Date(1976, 1, 3).getTime());
  t.end();
});

test('use default for boolean', t => {

  t.equal(instance4.cool, true);
  t.end();
});

test('use function as default', t => {

  t.equal(instance4.aField, 'UNKNOWN');
  t.end();
});

const user3 = model({
  name: [String, 'unknown'],
  cool: [Boolean, true]
});
const bill = model({
  customer: user3,
  payment: {
    terms: String,
    days: [Number, 30]
  }
});
const instance5 = bill();

test('model composition use data if provided', t => {
  const myBill = bill({
    customer: {
      name: 'Garibaldi'
    },
    payment: {
      terms: 'as usual'
    }
  });

  const expectedValue = {
    customer: {
      name: 'Garibaldi',
      cool: true
    },
    payment: {
      terms: 'as usual',
      days: 30
    }
  };

  t.deepEqual(myBill, expectedValue);
  t.end();
});

test('model composition create inlined objects', t => {
  const expectedValue = {
    terms: '',
    days: 30

  };

  t.deepEqual(instance5.payment, expectedValue);
  t.end();
});

test('model composition create other models', t => {
  const expectedValue = {
    name: 'unknown',
    cool: true

  };

  t.deepEqual(instance5.customer, expectedValue);
  t.end();
});

const delivery = model({
  address: String,
  to: [String, 'unknown'],
  _init: function() {
    this.to = this.to.toUpperCase();
    this.address = 'nowhere';
  }
});
const instance2 = delivery();

test('_init function is called if provided', t => {
  const expectedValue = {
    address: 'nowhere',
    to: 'UNKNOWN'
  };

  t.deepEqual(instance2, expectedValue);
  t.end();
});

test('_init function is not present on instances', t => {

  t.equal(instance2._init, undefined);
  t.end();
});

const delivery2 = model({
  address: String,
  to: [String, 'unknown']
});
const bill2 = model({
  rows: [{
    product: String,
    price: [Number, 30],
    quantity: [Number, 1]
  }],
  deliveries: [delivery2]

});
const instance3 = bill2({
  deliveries: [{
    address: 'somewhere'
  }, {
    address: 'some else where'
  }],
  rows: [{
    product: 'apples'
  }, {
    product: 'oranges'
  }]
});

test('create empty arrays', t => {
  const expectedValue = {
    rows: [],
    deliveries: []
  };

  t.deepEqual(bill2(), expectedValue);
  t.end();
});

test('create inlined objects', t => {
  const expectedValue = [{
    product: 'apples',
    price: 30,
    quantity: 1
  }, {
    product: 'oranges',
    price: 30,
    quantity: 1
  }];

  t.deepEqual(instance3.rows, expectedValue);
  t.end();
});

test('create other models', t => {
  const expectedValue = [{
    address: 'somewhere',
    to: 'unknown'
  }, {
    address: 'some else where',
    to: 'unknown'
  }];

  t.deepEqual(instance3.deliveries, expectedValue);
  t.end();
});
