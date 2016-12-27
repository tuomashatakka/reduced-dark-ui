'use babel';
import { doc, conf, rootNamespace, namespace } from './main'

let { minimum, maximum } = atom.config.getSchema().properties['reduced-dark-ui'].properties.uiScale
const scaling = { minimum, maximum }

export const getScaleAttrName = () =>
  namespace('uiScale')

export const getScaleAttrValue = () =>
  parseInt(
  doc.getAttribute(
  getScaleAttrName()))

export default function getScale (scale=null) {

  if (!scale)
    scale = getScaleAttrValue()

  if (scale >= scaling.minimum &&
      scale <= scaling.maximum &&
      parseInt(scale))
      return parseInt(scale) / 100
    return 1
}

export const setScale = (value=null) => {

  let fontSize = atom.config.settings['editor'].fontSize
  value = getScale(value)

  let styleAttr = (el) => (
  (el.getAttribute('style') || '')
     .split(';'))
     .filter(att => {
        console.log(att, !att.startsWith('font-size'))
        return !att.trim().startsWith('font-size')
             && att.trim().length > 0
      }
  )

  let docinline = styleAttr(doc)
      docinline.push('font-size: ' + value * fontSize + 'px')

  let bodyinline = styleAttr(document.body)
      bodyinline.push('font-size: ' + fontSize + 'px')


  doc.setAttribute('style', docinline.join(';'))
  document.body.setAttribute('style', bodyinline.join(';'))
}