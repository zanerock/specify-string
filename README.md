[![coverage: 100%](./.readme-assets/coverage.svg)](https://github.com/liquid-labs/specify-string/pulls?q=is%3Apr+is%3Aclosed)

# specify-string

A simple string validation library that can be easily extended with other libraries.

## Installation

```
npm i specify-string
```

## Usage

```javascript
import isEmail from 'validator/es/lib/isEmail'
import { validateString } from 'specify-string'

const emailSpec = {
  'match-re': /@acme.com/, // a core validation
  isEmail: undefined // validation from the validator package 
}

const email = "john@acme.com"

const result = validateString({
  spec       : emailSpec,  // define the validations to run
  validators : { isEmail }, // optional validation extensions
  value      : email
})
// returns true
// email = 'john@foo.com' would return explaining the string must match the RE
// email = 'invalid@email@acme.com' would return 'false' because that's what 'isEmail' returns.
```

## API Reference

### `validateString({ skipTypeCheck, spec, validators, value })`

__Parameters__:
- `skipTypeCheck`: If true, skips initial check that the `value` option is a string or array of strings.
- `spec`: The validation spec. See [validation spec](#validation-spec) and [core validations](#core-validations) for details.
- `validators`: An object whose keys are validation names and values are validation functions. See [extending validations](#extending-validations) for more info.
- `value`: A string or array of strings to validate against the `spec`.

This function validates the `value` against the `spec`, which may make reference to built-in validations or validations defined on the optional `validators` object. A value of `true` means validation passed and any other return value indicates a failed validation. Validation stops at the first failure. Core validations will return a descriptive string on failure. The return value of validations defined on the `validators` extension parameter are defined by their implementation.

### `validateStringSpec({ spec, validators })`

__Parameters__:
- `spec`: The validation spec. See [validation spec](#validation-spec) and [core validations](#core-validations) for details.
- `validators`: An object whose keys are validation names and values are validation functions. See [extending validations](#extending-validations) for more info.

Verifies that the validations referenced in the [validation spec](#validation-spec) are valid references to either core validations or validations defined on the optional `validators` parameter.

### `Validator`

An alternate method of validation that creates a re-usable `Validator` object which can then be used to apply the same validation spec multiple times.

#### `new Validator({ spec, validators })`

__Parameters__:
- `spec`: The validation spec. See [validation spec](#validation-spec) and [core validations](#core-validations) for details.
- `validators`: An object whose keys are validation names and values are validation functions. See [extending validations](#extending-validations) for more info.

Creates a re-usable `Validator` instance.

#### `Validator.validateString(value)`

__Parameters__:
- `value`: A string or array of strings to validate against the `spec`.

Validates the `value` against the `spec` used to create the `Validator` instance.


## Validation spec

The validation spec consists of an object whose keys are references to a validator function. The values are arguments to pass to the validation spec and may be undefined.

Specifically, given a validation spec like:
```javascript
{
  'min-length': 5
}
```

The validator function will be called like: `validationFunc(value, 5)` where `value` is the parameter passed to the `validateString` function.

It is possible to pass in multiple arguments using an array. For example:
```javascript
{
  'someValidation': [10, { strict: true }]
}
```

Would result in a call like: `someValidation(value, 10, { strict: true })`.

The exception to this rule is the `one-of` core validator, which takes an array as an argument, which is passed into the validator as an array of valid options.

## Core validations

### Array validators

There are three array validators. These are useful when `value` is an array of strings and you want to specify the number of acceptable values in the array. Note, when `value` is a string, this is treated as an array with a single value.

- `exact-count`: Takes an integer value and requires there be exactly that many values in the `value` array.
- `max-count`: Takes an integer value and requires that there be at most that many values in the `value` array.
- `min-count`: Takes an integer value and requires that there be at least that many values in the `value` array.

### String validators

String validators are run against the single string `value` or, if `value` is an array of strings, each string in the `value` array. Recall that validation will cease at the first failure.

- `exact-length`: Takes an integer length value and requires each `value` string to be exactly the specified length.
- `max-length`: Takes an integer length value and requires each `value` string to be at most the specified length.
- `match-re`: Takes a regular expression or a string which will be used to create a regular expression. Each `value` must match the specified regular expression. An exception will be raised if the value is a string that is not a valid regular expression.
- `min-length`: Takes an integer length value and requires each `value` string to be at least the specified length.
- `one-of`: Takes an array of valid strings and requires each `value` string to be one of the valid strings.

## Extending validations

The `validateString` function or `Validator` constructor take an optional `validators` parameter. This is an object whose keys are validation names and values are validation functions.

A `validators` object can be manually built, like in the [usage example](#usage), directly use compatible objects such as `import validators from 'validator'`, or make use of a star import `import * as validators from 'some-validation-package'` depending on the nature of the validations.

A validation function must return `true` if a string is validated. Any other result should be treated as indicating the string is invalid according to that validator. It is recommended to return a string, as the core validators do, that provides an explanation for why the string failed to validate.