'use babel'
import { PACKAGE_NAME } from '../../constants'
import { formatTitle, FORMAT_FLAGS } from '../../utils'

let stylesheet = null
const { DASHED } = FORMAT_FLAGS

const CF = {
  eachChannel: (fnc, ...args) => {
    let channels = ['red', 'green', 'blue'], out = {}
    for (let ch of channels) {
      out[ch] = fnc(ch, ...args)
    }
    return out
  },

  luminance: (c) => Math.round((c.red + c.blue + c.green) / 3),

  mix: (a, b, amount=0.5) => {
    return {
      ...a,
      ...CF.eachChannel(ch => Math.round((a[ch] + b[ch]) * amount))
    }
  },

  desaturate: (c, amount=0.5) => {
    let comp = CF.luminance(c)
    return { ...c, ...CF.eachChannel(ch =>
      Math.round( c[ch] + (comp - c[ch]) * amount )
    )}
  },

  dim: (a, amount=0.5) => {
    return CF.mix(a, color.BLACK, amount)
  },

  lighten: (a, amount=0.5) => {
    return CF.mix(a, color.WHITE, amount)
  },
}


const parseColor = (c={}) =>
  `rgba(${c.red || 0}, ${c.green || 0}, ${c.blue || 0}, ${c.alpha || 1})`


let color = {
  WHITE: { red: 255, green: 255, blue: 255, alpha: 1 },
  BLACK: { red: 0, green: 0, blue: 0, alpha: 1 },
}


const RAW = {
  BG:          '#201f23',
  DARKER:      '#252429',
  DARK:        '#29292e',
  GRAY:        '#4F4F59',
  LIGHT:       '#CBC9C9',
  LIGHTER:     '#DEDEDE',
  WHITE:       '#ECEEEF',

  ALTERNATIVE: '#3bb3f6',
  KEYWORD:     '#87B2CE',
  NUMBERS:     '#b17ebd',
  INCLUDE:     '#e969cd',

  ERROR:       '#f52847',
  ANNOTATION:  '#ed3945',
  WARNING:     '#f4e795',
  SUCCESS:     '#10faad', //'#2dffa0',
  HIGHLIGHT:   '#10faad',
  MAIN:        '#59edbc',
}


const hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']


const resolveHexString = (col) => {
  let arr = Array.from(RAW[col].substr(1))
  let red   = arr.splice(0, 2)
  let green = arr.splice(0, 2)
  let blue  = arr.splice(0, 2)
  let char  = x => { let i = hex.findIndex(o => o == x.toString()); return i === -1 ? 0 : i }
  let digest = d => {
    let x = 1, c = null, r = 1
    while((c = d.pop())) {
      r += char(c) * x
      x *= 16 } return r }

  return {
    red: digest(red),
    green: digest(green),
    blue: digest(blue),
    alpha: 1 }
}


const COLOR_PROCESSORS = {

  backgroundTint: function(color) {
    return CF.desaturate(CF.dim(color, 0.6), 0.5)
  },

  backgroundBase: function(color) {
    let tint = stylesheet.getColor('backgroundTint')
    let col = CF.mix(tint.color, color, 0.33)
    col = CF.dim(col, 0.75)
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

let options = {
  priority: 5,
  context: 'color-definitions',
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
    stylesheet.globalColor('darker', color.darker)
    stylesheet.globalColor('dark', color.dark)
    stylesheet.globalColor('gray', color.gray)
    stylesheet.globalColor('light', color.light)
    stylesheet.globalColor('lighter', color.lighter)
  }

  if (key)
    stylesheet.globalColor(key, value)
  return stylesheet.apply()

}
