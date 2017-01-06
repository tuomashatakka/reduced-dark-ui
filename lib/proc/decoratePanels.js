

module.exports = ({ decorate }) => {
  let x = require.resolve('atom')
  console.log(decorate)
  decorate()
  //emit('panels:decorations-applied')
}
