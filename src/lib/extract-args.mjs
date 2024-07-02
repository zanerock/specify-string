const extractArgs = (parameters) => {
  if (parameters?.args !== undefined) {
    return parameters.args
  } else { // it's something else
    return parameters
  }
}

export { extractArgs }
