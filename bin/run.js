const proc = require('process')

const args = () => {
  let { execArgv } = proc
  return execArgv.splice(2)
}

let a = args()
console.log(a)
console.log(proc)

module.exports = a
