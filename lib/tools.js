'use babel'

export default {
  log,
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
      method = (method !== -1) ? args[method][1] : 'log'

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

    output.push(newline)
  }

  console[method](...output)
}
