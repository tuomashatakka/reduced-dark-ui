'use babel';
import { namespace } from './utils'

const scaling             = { minimum, maximum }
                          = atom.config.getSchema('reduced-dark-ui.layout.uiScale')
const baseSize            = 12

const getScaleAttrValue   = () => atom.config.get('reduced-dark-ui.layout.uiScale')

const getSpacingAttrValue = () => atom.config.get('reduced-dark-ui.layout.spacing')
const setSpacingAttrValue = sz => atom.config.set('reduced-dark-ui.layout.spacing', sz)

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

const updateLayoutScaling = (value, spacing) => {
  value = +parseFloat(
    getScale(value)
     * getBaseSize()
     * getScale())
      .toFixed(2)
  document.documentElement.style.fontSize = `${value}px`
}

const updateLayoutSpacing = () => {
  let spacing = parseFloat(1 / (getSpacingAttrValue() / 100)).toFixed(3)
  document.body.style.fontSize = `${spacing}em`
  return spacing
}

const setScale = ({value}) => {
  let spacing = updateLayoutSpacing()
  updateLayoutScaling(value, spacing)
}


export default
  getScale

export {
  setScale,
  getScale,
  scaling,
}
