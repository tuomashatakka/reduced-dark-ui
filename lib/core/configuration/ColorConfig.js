'use babel'
import { PACKAGE_NAME } from '../../constants'
import { formatTitle, FORMAT_FLAGS } from '../../utils'
import { hex, resolveHexString, RAW, color, parseColor } from '../colors'
import CF from '../colors'

let stylesheet    = null

const { DASHED }  = FORMAT_FLAGS

const options = {
  priority: 5,
  context: 'color-definitions' }

const COLOR_PROCESSORS = {

  backgroundTint: function(color) {
    return CF.desaturate(CF.dim(color, 0.6), 0.5)
  },

  backgroundBase: function(color) {
    let tint = stylesheet.getColor('backgroundTint')
    let col = CF.multiply(tint.color, color, 1)
    col = CF.dim(col, 0.25)
    return CF.desaturate(col, 0.5)
  },

  backgroundSub: function(color) {
    let tint = stylesheet.getColor('backgroundTint')
    let col = CF.mix(tint.color, color, 1)
    col = CF.dim(col, 0.5)
    return CF.desaturate(col, 0.5)
  },

  backgroundDark: function(color) {
    let tint = stylesheet.getColor('backgroundTint')
    let col = CF.mix(tint.color, color, 0.98)
    col = CF.dim(col, 0.25)
    return CF.desaturate(col, 0.5)
  },

  primary: function(color) {
    let tint = stylesheet.getColor('backgroundTint')
    return CF.mix(color, tint.color, 0.25)
  },

  accentColor: function(color) {
    let tint = stylesheet.getColor('backgroundTint')
    return CF.mix(color, tint.color, 0.25)
  },

  success: function(color) {
    let tint = stylesheet.getColor('backgroundTint')
    return CF.mix(color, tint.color, 0.25)
  },

  warning: function(color) {
    let tint = stylesheet.getColor('backgroundTint')
    return CF.mix(color, tint.color, 0.25)
  },

  error: function(color) {
    let tint = stylesheet.getColor('backgroundTint')
    return CF.mix(color, tint.color, 0.25)
  },

}


class CascadingStylesheet {

  constructor ({props={}, vars={}, options={}}) {

    this.props    = props
    this.vars     = vars
    this.options  = options
    this.colors   = {}
    this.element  = null
    this.subscription = null

    this.listenStyleElementAdditions()

  }

  getScope ({descriptor, root}) {

    let scope = descriptor || 'body'
    this.props[scope] = this.props[scope] || {}
    this.vars[scope] = this.vars[scope] || {}
    return scope

  }

  define (scope, name, val=null) {

    this.set(scope, name, val, 'variable')

  }

  getColor (name, val) {

    this.colors = this.colors || {}
    let colo = val ||
      atom.config.get(`${PACKAGE_NAME}.palette.${name}`) ||
      atom.config.get(`${PACKAGE_NAME}.palette.state.${name}`) ||
      color[name]

    let process = COLOR_PROCESSORS[name]
    let col = {
      color: colo,
      scope: this.getScope({root: true}),
      variable: `color-${formatTitle(name, DASHED)}`
    }
    col.get = () => process ? process.call(col, colo) : colo
    this.colors[name] = col
    return col

  }

  rebuildColors () {

    for (let name in this.colors) {
      let col = this.colors[name]
      this.set(col.scope, col.variable, parseColor(col.get()))
    }

  }

  globalColor (name, val=null, force=false) {

    if(name === 'backgroundTint')
      this.colors = {}
    const col = force ? this.colors[name] : this.colors[name] || this.getColor(name, val)
    this.set(col.scope, col.variable, () => parseColor(col.get()), 'variable')

  }

  set (descriptor, attr, val=null, ...flags) {

    const root = (flags.indexOf('variable') > -1)
    const type = root ? this.vars : this.props
    const scope = this.getScope({descriptor, root})
    const add = (property, value) => type[scope][formatTitle(property, DASHED)] = value

    if (typeof attr === 'string')
      add(attr, val || '')
    else
      Object.keys(attr).forEach(prop => add(prop, attr[prop]))

  }

  parse (scope=null) {

    if (!scope)
      scope = Object.keys(this.props || {}).filter(o => o !== 'root').concat('root')
    else
      scope = [ scope, ]
    let stream = []
    let indent = `  `

    for(let descriptor of scope) {
      let selector = descriptor === 'root' ? ':root' : descriptor
      let attrs = this.props[descriptor] || {}
      let vars = this.vars[descriptor] || {}
      stream.push(`${selector} {`)

      for (let property in vars) {
        let value = vars[property]()
        stream.push(`${indent}--${property}: ${value};`)
      }

      for (let property in attrs) {
        let value = attrs[property]
        stream.push(`${indent}${property}: ${value};`)
      }

      stream.push(`}`)
    }

    return stream.join(`\n`)

  }

  listenStyleElementAdditions () {

    let { context } = this.options
    let resolveElementSubscribtion = atom.styles.onDidAddStyleElement(
      ref => {
        if (!ref.context || ref.context !== context)
          return
        this.element = ref
        resolveElementSubscribtion.dispose()
      }
    )

  }

  apply () {

    let { priority, context } = this.options
    if (this.subscription)
      this.subscription.dispose()
    this.subscription = atom.styles.addStyleSheet(this.parse(), {priority, context})
    return this
  }

}

export default function apply ({key, value, selector}) {

  // let colors = atom.config.get(`${PACKAGE_NAME}.palette`)
  if (!stylesheet) {
    stylesheet = new CascadingStylesheet({options})
    for (let col in RAW) {
      color[col.toLowerCase()] = resolveHexString(col, RAW[col])
    }
    stylesheet.globalColor('black', color.black)
    stylesheet.globalColor('white', color.white)
    stylesheet.globalColor('backgroundBase', color.bg)
    stylesheet.globalColor('backgroundSub', color.bg)
    stylesheet.globalColor('backgroundDark', color.bg)
    stylesheet.globalColor('darker', color.darker)
    stylesheet.globalColor('dark', color.dark)
    stylesheet.globalColor('gray', color.gray)
    stylesheet.globalColor('light', color.light)
    stylesheet.globalColor('lighter', color.lighter)

    stylesheet.globalColor('textTab', stylesheet.getColor('primary'))
    stylesheet.globalColor('textTabHover', stylesheet.getColor('primary'))
    stylesheet.globalColor('textTabActive', stylesheet.getColor('primary'))
  }

  if (key)
    stylesheet.globalColor(key, value)
  return stylesheet.apply()

}
