'use babel';

// const spacing             = atom.config.getSchema('reduced-dark-ui.layout.spacing')
const baseSize            = 12
const scaling             = atom.config.getSchema('reduced-dark-ui.layout.uiScale')
const getScaleAttrValue   = () => atom.config.get('reduced-dark-ui.layout.uiScale')
const getSpacingAttrValue = () => atom.config.get('reduced-dark-ui.layout.spacing')

const getScale = () => {
  let val = getScaleAttrValue()
  return (val >= scaling.minimum && val <= scaling.maximum && parseInt(val))
  ? (parseInt(val) / 100 * getBaseSize()) : 1
}

const getSpace = () => {
  let val = getSpacingAttrValue()
  return (val >= scaling.minimum && val <= scaling.maximum && parseInt(val))
  ? (parseInt(val) / 100 * getBaseSize()) : 1
}

const getRatio = () => getScale() / getSpace()

const getBaseSize = () => {
  let editorSettings = atom.config.settings['editor'] || {}
  let fontSize = editorSettings.fontSize || baseSize * 1.2
  return baseSize * (fontSize / (baseSize * 1.2))
}

const updateLayoutScaling = () => {
  let value = +parseFloat(getScale()).toFixed(2)
  document.documentElement.style.fontSize = `${value}px`
  return value
}

const updateLayoutSpacing = (scale) => {
  // let ex = (getSpacingAttrValue() / 100)
  // let spacing = +parseFloat(
  //   1 / ex).toFixed(3)
  let ratio = getRatio()
  let value = +parseFloat(ratio * scale).toFixed(2)
  document.body.style.fontSize = `${value}px`
  return value
}

const setScale = ({value}) => {
  // TODO: This would be better handled in less environment. id:19
  let scale = updateLayoutScaling()
  updateLayoutSpacing(scale)
}


export default
  getScale

export {
  setScale,
  getScale,
  scaling,
}
