'use babel'
import CascadingStylesheet from './Stylesheet'
import { PACKAGE_NAME } from '../../constants'
import { RAW } from '../colors'
import Palette from '../colors/Palette'
import CF from '../colors'

let stylesheet    = null

const MIX_TINT_TEXT_AMOUNT          = 0.125
const STATE_MIX_TEXT_AMOUNT         = 0.5
const STATE_MIX_TINT_AMOUNT         = 0.15
const STATE_MIX_ACCENT_AMOUNT       = 0.15
const STATE_DIMMED_MIX_BASE_AMOUNT  = 0.75

const options = {
  priority: 5,
  context: 'color-definitions' }

const COLOR_PROCESSORS = {

  backgroundBase: function(color) {
    let col = CF.multiply(this.get('tint'), color, 0.95)
    return CF.dim(CF.desaturate(col, 0.5), 0.1) },

  backgroundSub: function(color) {
    let col = CF.multiply(color, this.get('tint'), 0.94)
    return CF.dim(CF.desaturate(col, 0.2), 0.6) },

  backgroundDark: function(color) {
    let col = CF.multiply(this.get('tint'), color, 0.94)
    return CF.dim(CF.desaturate(col, 0.2), 0.4) },

  backgroundLight: function(color) {
    let col = CF.multiply(color, this.get('tint'), 0.8)
    col = CF.dim(col, 0.2)
    return CF.saturate(col, 0.5) },

  backgroundNeutral: function(color) {
    let col = CF.multiply(color, this.get('tint'), 0.15)
    return CF.lighten(CF.desaturate(color, 0.5), 0.05) },

  backgroundMedium: function(color) {
    let col = CF.multiply(color, this.get('tint'), 0.85)
    col = CF.dim(col, 0.2)
    return CF.saturate(col, 0.15) },

  backgroundSelected: () =>
    CF.fade(CF.mix(palette.get('selected'), palette.get('backgroundBase'), 0.5), 0.05),

  backgroundHighlight: () =>
    CF.fade(CF.mix(palette.get('highlight'), palette.get('backgroundBase'), 0.75), 0.05),

  textBase: () => CF.mix(palette.get('lighter'), palette.get('tint'), MIX_TINT_TEXT_AMOUNT),
  dimmed: () => CF.fade(CF.mix(palette.get('light'), palette.get('tint'), MIX_TINT_TEXT_AMOUNT), 0.75),
  mixed: name => CF.mix(COLOR_PROCESSORS.state(palette.get(name)), palette.get('textBase'), 0.5),
  state: function(name) {
    let color = CF.mix(palette.get(name), palette.get('tint'), STATE_MIX_TINT_AMOUNT)
    return CF.mix(color, palette.get('accentColor'), STATE_MIX_ACCENT_AMOUNT) },
  text: function(name) {
    let color = COLOR_PROCESSORS.state(name)
    return CF.mix(color, palette.get('textBase'), STATE_MIX_TEXT_AMOUNT) },
  stateDimmed: function(name) {
    let color = COLOR_PROCESSORS.state(name)
    return CF.saturate(CF.mix(color, palette.get('backgroundBase'), STATE_DIMMED_MIX_BASE_AMOUNT)) },

  primary:        color => CF.mix(color, palette.get('tint'), MIX_TINT_TEXT_AMOUNT),
  accentColor:    color => CF.mix(color, palette.get('tint'), MIX_TINT_TEXT_AMOUNT),

  info:           () => COLOR_PROCESSORS.text('info'),
  success:        () => COLOR_PROCESSORS.text('success'),
  warning:        () => COLOR_PROCESSORS.text('warning'),
  annotation:     () => COLOR_PROCESSORS.text('annotation'),
  error:          () => COLOR_PROCESSORS.text('error'),

  infoMixed:       () => COLOR_PROCESSORS.mixed('info'),
  successMixed:    () => COLOR_PROCESSORS.mixed('success'),
  warningMixed:    () => COLOR_PROCESSORS.mixed('warning'),
  annotationMixed: () => COLOR_PROCESSORS.mixed('annotation'),
  errorMixed:      () => COLOR_PROCESSORS.mixed('error'),

  infoDimmed:       () => COLOR_PROCESSORS.stateDimmed('info'),
  successDimmed:    () => COLOR_PROCESSORS.stateDimmed('success'),
  warningDimmed:    () => COLOR_PROCESSORS.stateDimmed('warning'),
  annotationDimmed: () => COLOR_PROCESSORS.stateDimmed('annotation'),
  errorDimmed:      () => COLOR_PROCESSORS.stateDimmed('error'),

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

  console.warn("updating color", key, "->", value)
  stylesheet = stylesheet || new CascadingStylesheet({options})
  getColors()
  palette.set(key, value)

  let bg        = palette.get('bg')
  let dark      = palette.get('dark')
  let darker    = palette.get('darker')

  palette.set('backgroundBase',     bg)
  palette.set('backgroundSub',      bg)
  palette.set('backgroundDark',     bg)
  palette.set('backgroundMedium',   bg)
  palette.set('backgroundLight',    darker)
  palette.set('backgroundNeutral',  dark)
  palette.set('textBase',       palette.get('lighter'))
  palette.set('subtle',         palette.get('gray'))
  palette.set('selected',       palette.get('white'))
  palette.set('info',           CF.mix(palette.get('primary'), palette.get('success')))
  palette.set('highlight',      CF.mix(palette.get('primary'), palette.get('white'), 0.75))

  palette.set('primaryMixed',   CF.mix(palette.get('primary'), palette.get('textBase'), 0.5))
  palette.set('accentMixed',    CF.mix(palette.get('accentColor'), palette.get('textBase'), 0.5))

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
