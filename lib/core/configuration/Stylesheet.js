'use babel'
import { formatTitle, FORMAT_FLAGS } from '../../utils'
const { DASHED }  = FORMAT_FLAGS

export default class CascadingStylesheet {

  constructor ({props={}, vars={}, options={}}) {
    this.props    = props
    this.vars     = vars
    this.options  = options
    this.colors   = {}
    this.element  = null
    this.subscription = null
    this.listenStyleElementAdditions()
  }

  getScope (descriptor) {
    let scope = descriptor || 'body'
    this.props[scope] = this.props[scope] || {}
    this.vars[scope] = this.vars[scope] || {}
    return scope
  }

  define (scope, name, val=null) {
    this.set(scope, name, val, 'variable')
  }

  set (descriptor, attr, val=null, ...flags) {
    const type = (flags.indexOf('variable') > -1) ? this.vars : this.props
    const scope = this.getScope(descriptor)
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
      selector = descriptor === 'font' ? '@font-face' : selector
      stream.push(`${selector} {`)

      let attrs = this.props[descriptor] || {}
      let vars = this.vars[descriptor] || {}

      for (let property in vars) {
        let value = vars[property]
        value = typeof value === 'function' ? value() : value
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

  apply (raw=null) {
    let { priority, context } = this.options
    let content = this.parse()

    if (raw)
      content += `\n${raw}`
    if (this.subscription)
      this.subscription.dispose()

    this.subscription = atom.styles.addStyleSheet(content, {priority, context})
    return this
  }
}
