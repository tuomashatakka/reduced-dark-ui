'use babel'

const g = require('glob').sync

export default {
  log, info, warn, error,
  message,
}


export function extract () {
  let modules = g(arguments[0] + '/!(index.js)')
  return modules.map(o => require(o))
}


function log (...args) {

  if (!atom
   || !atom.devMode
   || !args.length)
   return

  let maxIter = 25
  let newline = '\n'
  let prefix = `[reduced-dark-ui.log]`

  let method = args.findIndex(o => o && o[0] === 'method')
  if (method !== -1) {
      method = args[method][1]
      delete args[method]
    }
  else
    method = 'log'

  let output = [
    newline,
    prefix,
    newline]


  while (args.length && maxIter--) {

    let input = args.pop()

    if (!input)
      continue

    let isObject = input.constructor && input.constructor.name === 'Object'

    if (isObject)
      for (let key in input) {
        let space = Array(32-key.length).fill(" ").join("")

        output.push(
          key,
          space,
          input[key],
          newline)
      }
    else
      output.push(
        input,
        newline)

    output.push(newline)
  }

  // eslint-disable-next-line
  console[method](...output)
  return output
}


function info (message, ...args) {
  return log(
    message,
    { method: 'info' },
    ...args)
}


function warn (message, ...args) {
  return log(
    message,
    { method: 'warn' },
    ...args)
}


function error (message, ...args) {
  return log(
    message,
    { method: 'info' },
    ...args)
}


function message (stream, opts={}) {
  if (!atom.devMode)
    return
  let dismissable = opts.persist || false
  let content = typeof stream === "string" ? stream : JSON.stringify(stream)
  let type = 'info'
  atom.notifications.add(type, content, { dismissable })
}
