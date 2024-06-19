import validator from 'validator'

import { Validator, validateString, validateStringSpec } from '../specify-string'

describe('validateStringSpec', () => {
  test('passes valid core validations', () => {
    const spec = { 'min-length' : 1 }
    expect(validateStringSpec({ spec })).toBe(true)
  })

  test('passes auxiliary validations', () => {
    const spec = { trivial : true }
    const validators = { trivial : (result) => result }
    expect(validateStringSpec({ spec, validators })).toBe(true)
  })

  test('raises exception on invalid validation', () => {
    const spec = { 'bad-validation' : 'ignored' }
    expect(() => validateStringSpec({ spec })).toThrow(/^No such validation/)
  })
})

describe('validateString', () => {
  test.each([
    [{ 'min-count' : 1 }, ['hi']],
    [{ 'min-count' : 1 }, 'hi'],
    [{ 'max-count' : 1 }, ['hi']],
    [{ 'max-count' : 1 }, 'hi'],
    [{ 'exact-count' : 1 }, ['hi']],
    [{ 'exact-count' : 1 }, 'hi'],
    [{ 'min-length' : 1 }, 'hi'],
    [{ 'min-length' : 1 }, ['hi', 'bye']],
    [{ 'max-length' : 2 }, 'hi'],
    [{ 'exact-length' : 2 }, 'hi'],
    [{ 'one-of' : ['hi', 'bye'] }, 'hi'],
    [{ 'match-re' : 'foo' }, 'foo-bar'],
    [{ 'match-re' : /foo/ }, 'foo-bar']
  ])('passes valid %s with value %p', (spec, value) => expect(validateString({ spec, value })).toBe(true))

  test.each([
    [{ 'min-count' : 3 }, ['hi']],
    [{ 'min-count' : 3 }, 'hi'],
    [{ 'max-count' : 1 }, ['hi', 'bye']],
    [{ 'max-count' : 0 }, 'hi'],
    [{ 'exact-count' : 2 }, ['hi']],
    [{ 'exact-count' : 2 }, 'hi'],
    [{ 'min-length' : 3 }, 'hi'],
    [{ 'min-length' : 3 }, ['hi', 'bye']],
    [{ 'max-length' : 1 }, 'hi'],
    [{ 'exact-length' : 3 }, 'hi'],
    [{ 'one-of' : ['hi', 'bye'] }, 'foo'],
    [{ 'match-re' : 'foo$' }, 'foo-bar'],
    [{ 'match-re' : /foo$/ }, 'foo-bar']
  ])('fails invalid %s with value %p', (spec, value) => expect(typeof validateString({ spec, value })).toBe('string'))

  test("'one-of' test works with (string) comma separated list", () => {
    expect(validateString({ spec : { 'one-of' : 'one, two' }, value : 'one' })).toBe(true)
    expect(typeof validateString({ spec : { 'one-of' : 'one, two' }, value : 'three' })).toBe('string')
  })

  test("'match-re' throws an exception when given an invalid RE", () =>
    expect(() => validateString({ spec : { 'match-re' : '(a' }, value : 'foo' })).toThrow(/^'match-re' RE/))

  test('will use auxiliary validators', () =>
    expect(validateString({ spec : { isEmail : undefined }, validators: validator, value: 'foo@bar.com' })).toBe(true))

  test('will pass single argument to auxiliary validators', () =>
    expect(validateString({ spec : { isEmail : { allow_display_name: true } }, validators: validator, value: 'Foo <foo@bar.com>' })).toBe(true))

  test('will pass multiple arguments to the auxiliary validators', () => {
    let arg1, arg2, arg3
    validateString({ spec : { argTest : ['foo', 'bar'] }, validators: { argTest : (a, b, c) => { arg1 = a; arg2 = b; arg3 = c; return true }}, value: 'baz' })
    expect(arg1).toBe('baz')
    expect(arg2).toBe('foo')
    expect(arg3).toBe('bar')
  })

  test("'Validator' can validate strings", () => {
    const validator = new Validator({ spec : { 'min-length' : 3 } })
    expect(validator.validateString('bye')).toBe(true)
    expect(typeof validator.validateString('hi')).toBe('string')
  })

  test("'Validator' detects invalid spec on instantiation", () =>
    expect(() => new Validator({ spec : { foo : 1 } })).toThrow(/^No such validation/))
})
