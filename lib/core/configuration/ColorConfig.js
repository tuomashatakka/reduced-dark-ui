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
      console.error(ch, out, out[ch])
    }
    return out
  },
  luminance: (a) => Math.round((a.red + a.blue + a.green) / 3),
  mix: (a, b, amount=0.5) => {
    return {
      ...a,
      ...CF.eachChannel(ch => Math.round((a[ch] + b[ch]) * amount), a, b)
    }
  },
  desaturate: (a, amount=0.5) => {
    let comp = CF.luminance(a)
    return { ...a, ...CF.eachChannel(ch =>
      Math.round( c[ch] + (comp - c[ch]) * amount )
    )}
  },
  dim: (a, amount=0.5) => {
    return CF.mix(a, COLOR.BLACK, amount)
  },
  lighten: (a, amount=0.5) => {
    return CF.mix(a, COLOR.WHITE, amount)
  },
}

const parseColor = (c={}) =>
  `rgba(${c.red || 0}, ${c.green || 0}, ${c.blue || 0}, ${c.alpha || 1})`

const COLOR = {
  WHITE: { red: 255, green: 255, blue: 255, alpha: 1 },
  BLACK: { red: 0, green: 0, blue: 0, alpha: 1 },
}

const COLOR_PROCESSORS = {
  backgroundTint: function(color) {
    return CF.dim(color, 0.6)
  },
  primary: function(color) {
    let tint = stylesheet.getColor('backgroundTint')
    return CF.mix(color, tint.color, 0.6)
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

    let scope = descriptor || root ? 'atom-workspace *' : 'body'
    this.props[scope] = this.props[scope] || {}
    this.vars[scope] = this.vars[scope] || {}
    return scope

  }

  define (scope, name, val=null) {

    this.set(scope, name, val, 'variable')

  }

  getColor (name, val) {

    this.colors = this.colors || {}
    let color = val ||
      atom.config.get(`${PACKAGE_NAME}.palette.${name}`) ||
      atom.config.get(`${PACKAGE_NAME}.palette.state.${name}`)

    let process = COLOR_PROCESSORS[name]
    let col = {
      color,
      scope: this.getScope({root: true}),
      variable: `color-${formatTitle(name, DASHED)}`
    }
    col.get = () => process ? process.call(col, color) : () => ({})
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

    const col = (force && this.colors[name]) || this.getColor(name, val)
    this.set(col.scope, col.variable, parseColor(col.get()), 'variable')

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
        let value = vars[property]
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
    console.log(this)
    return this
  }

}

let options = {
  priority: 5,
  context: 'color-definitions',
}

export default function apply ({key, value, selector}) {

  // let colors = atom.config.get(`${PACKAGE_NAME}.palette`)
  stylesheet = stylesheet || new CascadingStylesheet({options})

  console.warn("Processing color", key, '~', value)
  if (key === 'backgroundTint')
  if (key)
    stylesheet.globalColor(key, value)

  // for (let color in colors) {
  //   console.warn("Processing color", color, colors[color])
  // }

  return stylesheet.apply()

}
