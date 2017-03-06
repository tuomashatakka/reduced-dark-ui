'use babel'
import CascadingStylesheet from './Stylesheet'
import { PACKAGE_NAME } from '../../constants'
import { RAW } from '../colors'
import Palette from '../colors/Palette'
import CF from '../colors'

let stylesheet    = null

const MIX_TINT_TEXT_AMOUNT          = 0.125
const STATE_MIX_TEXT_AMOUNT         = 0.5
const STATE_MIX_TINT_AMOUNT         = 0.335
const STATE_MIX_ACCENT_AMOUNT       = 0.335
const STATE_DIMMED_MIX_TINT_AMOUNT  = 0.5
const STATE_DIMMED_MIX_BASE_AMOUNT  = 0.75

const options = {
  priority: 5,
  context: 'color-definitions' }

const COLOR_PROCESSORS = {

  backgroundBase: function(color) {
    let col = CF.multiply(this.get('tint'), color, 0.95)
    col = CF.dim(col, 0.1)
    return CF.desaturate(col, 0.5) },

  backgroundSub: function(color) {
    let col = CF.multiply(this.get('tint'), color, 0.94)
    col = CF.dim(col, 0.6)
    return CF.desaturate(col, 0.6) },

  backgroundDark: function(color) {
    let col = CF.multiply(this.get('tint'), color, 0.94)
    col = CF.dim(col, 0.4)
    return CF.desaturate(col, 0.5) },

  backgroundSelected: () =>
    CF.fade(CF.mix(palette.get('selected'), palette.get('backgroundBase'), 0.25), 0.25),

  backgroundHighlight: () =>
    CF.fade(CF.mix(palette.get('highlight'), palette.get('backgroundBase'), 0.25), 0.25),

  textBase: () => CF.mix(palette.get('lighter'), palette.get('tint'), MIX_TINT_TEXT_AMOUNT),
  dimmed: () => CF.fade(CF.mix(palette.get('light'), palette.get('tint'), MIX_TINT_TEXT_AMOUNT), 0.75),
  mixed: name => CF.mix(COLOR_PROCESSORS.state(palette.get(name)), palette.get('textBase'), 0.5),
  state: function(color) {
    color = CF.mix(color, palette.get('tint'), STATE_MIX_TINT_AMOUNT)
    color = CF.mix(color, palette.get('accentColor'), STATE_MIX_ACCENT_AMOUNT)
    return CF.mix(color, palette.get('textBase'), STATE_MIX_TEXT_AMOUNT) },
  stateDimmed: function(color) {
    color = CF.mix(color, palette.get('tint'), STATE_DIMMED_MIX_TINT_AMOUNT)
    return CF.mix(color, palette.get('backgroundBase'), STATE_DIMMED_MIX_BASE_AMOUNT) },

  primary: color => CF.mix(color, palette.get('tint'), MIX_TINT_TEXT_AMOUNT),
  accentColor: color => CF.mix(color, palette.get('tint'), MIX_TINT_TEXT_AMOUNT),
  info: c => COLOR_PROCESSORS.state(c),
  success: c => COLOR_PROCESSORS.state(c),
  warning: c => COLOR_PROCESSORS.state(c),
  annotation: c => COLOR_PROCESSORS.state(c),
  error: c => COLOR_PROCESSORS.state(c),

  infoMixed:       () => COLOR_PROCESSORS.mixed('info'),
  successMixed:    () => COLOR_PROCESSORS.mixed('success'),
  warningMixed:    () => COLOR_PROCESSORS.mixed('warning'),
  annotationMixed: () => COLOR_PROCESSORS.mixed('annotation'),
  errorMixed:      () => COLOR_PROCESSORS.mixed('error'),

  infoDimmed:       c => COLOR_PROCESSORS.stateDimmed(c),
  successDimmed:    c => COLOR_PROCESSORS.stateDimmed(c),
  warningDimmed:    c => COLOR_PROCESSORS.stateDimmed(c),
  annotationDimmed: c => COLOR_PROCESSORS.stateDimmed(c),
  errorDimmed:      c => COLOR_PROCESSORS.stateDimmed(c),

}


let palette
function getColors () {
  let userColors = atom.config.get(`${PACKAGE_NAME}.palette`)
  palette = palette || new Palette()

  const iter = (obj) => {
    for (let name in obj) {
      if (name === 'state') {

        iter(obj.state)
        continue
      }
      let hex = obj[name]
      palette.set(name, hex)
    }
  }
  iter(userColors)
  iter(RAW)
  window.palette = palette

}

function setColors (colors) {
  for (let name in colors) {
    let color = colors[name]
    stylesheet.define(
      'root',
      `color-${name}`,
      color.toString()
    )
  }
}

function applyColorProcessors () {

  let colors = {}
  for (let name in palette.colors) {
    let method = COLOR_PROCESSORS[name]
    colors[name] = palette.process({ method, name, }) || palette.get(name)
  }
  return colors
}

export default function apply ({key, value}) {

  stylesheet = stylesheet || new CascadingStylesheet({options})
  getColors()

  let bg        = palette.get('bg')

  palette.set('backgroundBase', bg)
  palette.set('backgroundSub',  bg)
  palette.set('backgroundDark', bg)

  palette.set('textBase',       palette.get('lighter'))
  palette.set('primaryMixed',   CF.mix(palette.get('primary'), palette.get('textBase'), 0.5))
  palette.set('accentMixed',    CF.mix(palette.get('accentColor'), palette.get('textBase'), 0.5))
  palette.set('selected',       palette.get('primaryMixed'))
  palette.set('highlight',      palette.get('primaryMixed'))
  palette.set('info',           palette.get('white'))
  palette.set('subtle',         palette.get('gray'))
  palette.set('highlight',      palette.get('white'))
  palette.set('selected',       palette.get('white'))
  palette.format('dimmed')
  palette.format('hover')
  palette.format('backgroundSelected')
  palette.format('backgroundHighlight')

  palette.set('infoMixed',       palette.get('info'))
  palette.set('successMixed',    palette.get('success'))
  palette.set('warningMixed',    palette.get('warning'))
  palette.set('annotationMixed', palette.get('annotation'))
  palette.set('errorMixed',      palette.get('error'))
  palette.set('infoDimmed',       palette.get('info'))
  palette.set('successDimmed',    palette.get('success'))
  palette.set('warningDimmed',    palette.get('warning'))
  palette.set('annotationDimmed', palette.get('annotation'))
  palette.set('errorDimmed',      palette.get('error'))

  setColors(applyColorProcessors())

  return stylesheet.apply()
  // // Text colors
}
