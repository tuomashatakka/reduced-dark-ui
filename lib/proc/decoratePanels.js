

module.exports = ({ decorate }) => {
  let x = require.resolve('atom')
  decorate()
  //emit('panels:decorations-applied')
}
