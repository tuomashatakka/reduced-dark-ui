'use babel'
import { setScale } from './scale'
import { setPanelIcons } from './panels'

let pkg = require('../package.json')
let {configSchema: conf, name: rootNamespace} = pkg
const doc = document.documentElement
const htmlAttrName = rootNamespace + '-settings'
export { rootNamespace, conf, doc, pkg }

export function namespace(name, dot=false) {
  let processed = dot ? name : name.replace(
    /([A-Z _+]+)/g,
    needle => '-' + needle.toLowerCase())
  return ([rootNamespace, name].join(dot ? '.' : '-'))
}


class Theme {

  constructor (settings=[]) {
    this.settings = settings
    this.set = this.set.bind(this)
    this.listen = this.listen.bind(this)
  }

  activate (state) {
    let existing = atom.config.settings['reduced-dark-ui']
    // console.log(state)
    // atom.notifications.addInfo(JSON.stringify(["Activation state", state, this.settings]))

    // Initiate listeners for the settings defined in the package's configSchema
    doc.setAttribute(htmlAttrName, '')
    for (let key in this.settings) {
      // console.log("Key", key, this.settings[key].default, this.settings[key])

      let callback = false
      if (key == 'uiScale')
        callback = setScale

      if (existing && key in existing)
        this.listen(
          key,
          existing[key],
          this.settings[key].type,
          callback)

      else
        this.listen(
          key,
          this.settings[key].default,
          this.settings[key].type,
          callback)}}

  deactivate () {
    return this.settings
  }

  listen (key, value, type, callback) {
    // console.log("Started listening to", namespace(key, true), "callback", callback)
    return atom.config.observe(
      namespace(name, true),
      val => this.set(key, value, type, callback))
  }

  set (name, value=null, type=null, callback=null) {

    //name = namespace(name)
    let bool = type == 'boolean'
    let current = doc.getAttribute(htmlAttrName) || ''
    let neu = current
        .split(' ')
        .filter(o => name !== o)

    if (value && bool) {
      neu.push(name)
      doc.removeAttribute(namespace(name))
    }

    if (!bool)
      doc.setAttribute(namespace(name), value)

    if (callback)
        callback()

    doc.setAttribute(htmlAttrName, neu.join(' '))
  }
}


let theme = null

module.exports = {
  activate: state => {
    theme = new Theme(conf)
    window._theme = theme
    theme.activate(state)
    setPanelIcons()
    // console.log(getPanelIcon('.tool-bar'))
    // console.log(getPanelIcon('.tree-view'))
    // console.log(getPanelIcon('.tree-viewzz'))
  },

  deactivate: () => theme.deactivate(),
}
