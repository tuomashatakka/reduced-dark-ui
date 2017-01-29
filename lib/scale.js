'use babel';

let minimum, maximum
const scaling             = { minimum, maximum }
                          = atom.config.getSchema('reduced-dark-ui.layout.uiScale')
const baseSize            = 12

const getScaleAttrValue   = () => atom.config.get('reduced-dark-ui.layout.uiScale')

const getSpacingAttrValue = () => atom.config.get('reduced-dark-ui.layout.spacing')

const getScale = (scale=null) => {
  scale = scale || getScaleAttrValue()
  return (scale >= scaling.minimum && scale <= scaling.maximum &&
          parseInt(scale))
        ? parseInt(scale) / 100 : 1
}

const getRatio = () => {
  let scale = getScaleAttrValue()
  let space = getSpacingAttrValue()
  return scale / space
}

const getBaseSize = () => {
  let editorSettings = atom.config.settings['editor'] || {}
  let fontSize = editorSettings.fontSize || baseSize * 1.2
  return baseSize * (fontSize / (baseSize * 1.2))
}

const updateLayoutScaling = (value) => {
  value = +parseFloat(
    getScale(value)
  * getBaseSize()
  * getRatio())
   .toFixed(2)

  document.documentElement.style.fontSize = `${value}px`
}

const updateLayoutSpacing = () => {
  let spacing = parseFloat(1 / (getSpacingAttrValue() / 100)).toFixed(3)
  document.body.style.fontSize = `${spacing}em`
  return spacing
}

const setScale = ({value}) => {
  // TODO: This would be better handled in less environment. id:19
  updateLayoutSpacing()
  updateLayoutScaling(value)
}


export default
  getScale

export {
  setScale,
  getScale,
  scaling,
}
