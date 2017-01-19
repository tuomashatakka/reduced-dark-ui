'use babel';
import { doc, conf, rootNamespace, namespace } from './utils'

const scaling = { minimum, maximum } = atom.config.getSchema('reduced-dark-ui.layout.uiScale')
const baseSize = 12

const getScaleAttrName = () =>
  namespace('uiScale')

const getSpacingAttrName = () =>
  namespace('spacing')

const getScaleAttrValue = () =>
  atom.config.get('reduced-dark-ui.layout.uiScale')

const getSpacingAttrValue = () =>
  atom.config.get('reduced-dark-ui.layout.spacing')


const getScale = (scale=null) => {

  if (!scale)
    scale = getScaleAttrValue()

  if (scale >= scaling.minimum &&
      scale <= scaling.maximum &&
      parseInt(scale))
      return parseInt(scale) / 100
    return 1
}

const setScale = (value=null) => {

  let editorSettings = atom.config.settings['editor'] || {}
  let fontSize = editorSettings.fontSize || baseSize * 1.2
  let spacing = getSpacingAttrValue()
  fontSize = baseSize * (fontSize / (baseSize * 1.2))
  value = +parseFloat(getScale(value) * fontSize).toFixed(2)

  let styleAttr = (el) => (
    (el.getAttribute('style') || '')
     .split(';'))
     .filter(att => {
        return !att.trim().startsWith('font-size')
             && att.trim().length > 0 })

  let docinline = styleAttr(doc)
      docinline.push('font-size: ' + value + 'px')

  let bodyinline = styleAttr(document.body)
      bodyinline.push('font-size: ' + value * spacing/100 + 'px')

  doc.setAttribute('style', docinline.join(';'))
  document.body.setAttribute('style', bodyinline.join(';'))
}


export default
  getScale

export {
  setScale,
  getScale,
  scaling,
}
