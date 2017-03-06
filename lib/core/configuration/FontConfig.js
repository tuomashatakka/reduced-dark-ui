'use babel'
import CascadingStylesheet from './Stylesheet'
import { Task } from 'atom'
import { PACKAGE_NAME } from '../../constants'

const options = {
  priority: 3,
  context: 'font-definitions' }

let stylesheet = null, fontFamilyBase = null, fontFace = null
export default function apply (conf, raw=null) {

  let { key, value } = conf, fontFamily
  fontFace = raw || fontFace
  stylesheet = stylesheet || new CascadingStylesheet({options})

  if (!fontFamilyBase)
    fontFamilyBase = getComputedStyle(document.documentElement)['font-family'].split(/,\s*/)

  if (key && key.search('Weight') > -1) {
    stylesheet.define('root', 'fontWeight', value || 400)
  }
  else {
    fontFamily = [(value || conf), ...fontFamilyBase].join(', ')
    stylesheet.define('root', 'font', fontFamily)
  }
  return stylesheet.apply(fontFace)
}


let exeq = (...a) => new Promise(resolve => {
  let task = Task.once(require.resolve('../../proc/provide-fonts.js'), ...a)
  task.on('load', data => resolve(data)) }
)

export function resolveFontFaceDefinition (font) {
  if (!font)
    font = atom.config.get(`${PACKAGE_NAME}.decor.uiFont`)
  exeq('font-face', font, 'google')
  .then(data => {
    apply(font, data)
  })
}
