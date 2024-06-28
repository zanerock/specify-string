import { extractArgs } from './lib/extract-args'

const coreMultiValidators = {
  'min-count' : (value, length) => (Array.isArray(value) && value.length >= length) ||
    `You must provide no more than ${length} values; found ${value.length} values.`,
  'max-count' : (value, length) => (Array.isArray(value) && value.length <= length) ||
    `You must provide at least ${length} values; found ${value.length} values.`,
  'exact-count' : (value, length) => (Array.isArray(value) && value.length === length) ||
    `You must provide exactly ${length} values; found ${value.length} values.`
}

const coreValidators = {
  // single value validators
  'min-length' : (value, length) => value.length >= length ||
    `Value must be at least ${length} characters long; found ${value.length} characters.`,
  'max-length' : (value, length) => value.length <= length ||
    `Value must be at most ${length} characters long; found ${value.length} characters.`,
  'exact-length' : (value, length) => value.length === length ||
    `Value must be exactly ${length} characters long; found ${value.length} characters.`,
  'after' : (value, after) => { const sorted = [value, after].sort(); return (value !== after && sorted[1] === value) 
    || `Value must be lexicographically after '${after}'.` },
  'before' : (value, before) => { 
    const sorted = [before, value].sort()
    return (value !== before && sorted[0] === value)
      || `Value must be lexicographically before '${before}'.`
  },
  'between' : (value, before, after) => {
    const sorted = [before, value, after].sort()
    return (value !== before && value !== after && sorted[1] === value)
      || `Value must be lexicographically between '${before}' and '${after}'.`
  },
  'one-of' : (value, options) => {
    if ((typeof options) === 'string') {
      options = options.split(/\s*,\s*/)
    }
    return options.includes(value) ||
      `Value must be one of '${options.join("', '")}'; got '${value}'.`
  },
  'match-re' : (value, re) => {
    try { re = typeof re === 'string' ? new RegExp(re) : re } catch { // there's only one reason to throw, right?
      throw new Error(`'match-re' RE '${re}' is not a valid regular expression.`)
    }
    return re.test(value) ||
      `Value must match ${re.toString()}; got '${value}'.`
  }
}

const Validator = class {
  #spec
  #validators

  constructor ({ spec, validators }) {
    validateStringSpec({ spec, validators })

    this.#spec = spec
    this.#validators = validators
  }

  validateString (value) {
    return validateString({ value, spec : this.#spec, validators : this.#validators })
  }
}

const validateString = ({ skipTypeCheck, spec, validators, value }) => {
  if (spec === undefined) {
    throw new Error("Validation 'spec' is not defined.")
  }
  if (value === undefined) {
    throw new Error("Validation 'value' is not defined.")
  }
  const values = Array.isArray(value) ? value : [value]
  if (skipTypeCheck !== true && values.some((v) => typeof v !== 'string')) {
    throw new Error(`Validation 'value' must be a string or an array of strings; got: '${values.join("', '")}'.`)
  }

  for (const [validation, parameters] of Object.entries(spec)) {
    const args = extractArgs(parameters)

    if (coreMultiValidators[validation]) {
      const validationFunc = coreMultiValidators[validation]

      const result = validationFunc(values, args)

      if (result !== true) {
        return result
      }
    } else {
      const validationFunc = coreValidators[validation] || validators[validation]
      for (const v of values) {
        const result = validation === 'one-of'
          ? validationFunc(v, args)
          : Array.isArray(args)
            ? validationFunc(v, ...args)
            : validationFunc(v, args)
        if (result !== true) {
          if (typeof result !== 'string') {
            return `The value '${v}' failed the '${validation}' validation.`
          } else { // we've got a string; assume it's a description of the problem and just return it
            return result
          }
        }
      }
    }
  }

  return true
}

const validateStringSpec = ({ spec, validators }) => {
  for (const validation of Object.keys(spec)) {
    if (coreValidators[validation] === undefined &&
        coreMultiValidators[validation] === undefined &&
        validators?.[validation] === undefined) {
      throw new Error(`No such validation '${validation}' found in core validators${validators === undefined ? '' : ' or supplied validators'}.`)
    }
  }

  return true
}

export { Validator, validateString, validateStringSpec }
