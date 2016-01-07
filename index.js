'use strict';

const isFunction = fn => typeof fn === 'function';
const isObject = o => typeof o === 'object';
const isRegExp = re => re instanceof RegExp;
const isDate = d => d instanceof Date;
const forEach = (fn, list) => Object.keys(list).forEach(k => fn(list[k], k));

function isNgoose(value) {
  return isFunction(value) && value.name === 'ngooseModel';
}

function errField(value, key) {
  const type = isFunction(value) ? value.name : value;
  throw new Error('Invalid field ' + key + ':' + type + '. Fields must be type constructors, array or objects.');
}


function checkSupportedTypes(value, key) {
  if (value !== String &&
    value !== Number &&
    value !== Boolean &&
    value !== Date &&
    !isNgoose(value) &&
    key !== '_init'

    ) {

    errField(value, key);
  }
}


function checkSupportedObjectTypes(value, key) {
  /* eslint-disable no-use-before-define */

  if (Array.isArray(value)) {

    if (value.length < 1) {
      errField(value, key);
    }


    checkField(value[0], key);
  } else {
    checkFields(value);
  }
}

function checkField(value, key) {


  if (!value) {
    errField();
  }

  if (isFunction(value)) {

    checkSupportedTypes(value, key);
  } else {
    if (!isObject(value) || isRegExp(value) || isDate(value)) {
      errField(value, key);
    }

    if (isObject(value)) {
      checkSupportedObjectTypes(value, key);

    }
  }
}


function checkFields(definition) {
  forEach(checkField, definition);
}

function buildFieldWithDefault(FieldDefinition, instance, fieldName) {
  const defaultValue = FieldDefinition[1];
  const FieldType = FieldDefinition[0];

  if (isFunction(defaultValue)) {

    instance[fieldName] = defaultValue.apply(this);

  } else  if (FieldType === Date) {
    instance[fieldName] = new FieldType(defaultValue);
  }  else if (isObject(FieldType) && !Array.isArray(FieldType) && !isFunction(FieldType)) {
    /* eslint-disable no-use-before-define */
    instance[fieldName] = buildInstance(FieldType, defaultValue);

  } else {
    const nativeFieldType = FieldType;
    instance[fieldName] = nativeFieldType(defaultValue);
  }

}

function buildInstance(definition, data) {
  const instance = {};

  forEach(function(FieldType, key) {
    if (data && key in data) {

      if (Array.isArray(FieldType) && FieldType.length === 1) {
        buildArrayField(FieldType, instance, key, data[key]);
      } else if (isObject(data[key]) && isObject(FieldType) || isNgoose(FieldType)) {
        let fieldType = FieldType;

        if (isNgoose(fieldType)) {
          fieldType = fieldType.definition;
        }
        instance[key] = buildInstance(fieldType, data[key]);
      } else {
        instance[key] = data[key];
      }
    } else {

      if (Array.isArray(FieldType) && FieldType.length > 1) {
        buildFieldWithDefault(FieldType, instance, key);
      } else {
        buildField(FieldType, instance, key);
      }


    }
  }, definition);

  if (definition._init) {
    definition._init.call(instance);
  }

  return  instance;
}

function buildArrayField(FieldType, instance, fieldName, arrayData) {
  const values = [];

  arrayData.forEach(function(item) {

    let fieldType = FieldType[0];

    if (isNgoose(fieldType)) {
      fieldType = fieldType.definition;
    }
    values.push(buildInstance(fieldType, item));
  });
  instance[fieldName] = values;
}
function buildField(FieldType, instance, fieldName) {
  if (isObject(FieldType) && !Array.isArray(FieldType) && !isFunction(FieldType)) {
    instance[fieldName] = buildInstance(FieldType);
  } else if (Array.isArray(FieldType) && FieldType.length === 1) {
    buildArrayField(FieldType, instance, fieldName, []);
  } else if (fieldName !== '_init') {
    const nativeFieldType = FieldType;
    instance[fieldName] = nativeFieldType();
  }
}

function model(definition) {
  function errArgument() {
    throw new Error('You must provide a definition of model as first argument');
  }

  if (!definition) {
    errArgument();
  }

  if (!isObject(definition) || Array.isArray(definition) || isRegExp(definition)) {
    errArgument();
  }

  checkFields(definition);

  const factory = function ngooseModel(data) {
    return buildInstance(definition, data);
  };
  factory.definition = definition;
  return  factory;
}

module.exports = model;
