'use babel';
import { doc, conf, rootNamespace, namespace } from './main'

const scaling = { minimum, maximum } = atom.config.getSchema('reduced-dark-ui.layout.uiScale')
const baseSize = 10

const getScaleAttrName = () =>
  namespace('uiScale')


const getScaleAttrValue = () =>
  parseInt(
  doc.getAttribute(
  getScaleAttrName()))


function getScale (scale=null) {

  if (!scale)
    scale = getScaleAttrValue()

  if (scale >= scaling.minimum &&
      scale <= scaling.maximum &&
      parseInt(scale))
      return parseInt(scale) / 100
    return 1
}


const setScale = (value=null) => {

  let fontSize = atom.config.settings['editor'].fontSize || baseSize * 1.2
  fontSize = baseSize * (fontSize / (baseSize * 1.2))
  value = getScale(value)

  let styleAttr = (el) => (
    (el.getAttribute('style') || '')
     .split(';'))
     .filter(att => {
        return !att.trim().startsWith('font-size')
             && att.trim().length > 0 })

  let docinline = styleAttr(doc)
      docinline.push('font-size: ' + value * fontSize + 'px')

  let bodyinline = styleAttr(document.body)
      bodyinline.push('font-size: ' + value * fontSize + 'px')

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
