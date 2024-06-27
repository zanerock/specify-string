const extractArgs = (parameters) => {
  if (parameters === undefined || Array.isArray(parameters) || parameters.test !== undefined) {
    return parameters
  } else if (typeof parameters === 'object' && parameters.args !== undefined) {
    return parameters.args
  } else {
    return parameters
  }
}

export { extractArgs }
