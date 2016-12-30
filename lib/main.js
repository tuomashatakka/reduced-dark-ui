'use babel'
import { setScale } from './scale'
import { setPanelIcons } from './panels'
import getComposite from './core/subscribe'

const pkg = require('../package.json')
const { configSchema: conf, name: rootNamespace } = pkg

const doc = document.documentElement
const htmlAttrName = rootNamespace + '-settings'

function namespace(name, delim=false) {
  // let processed = delim ? name : name.replace(
  //   /([A-Z _+]+)/g,
  //   needle => '-' + needle.toLowerCase())
  let ns = [rootNamespace, name].join(delim ? '.' : '-')
  console.log(rootNamespace, name, ns)
  return ns
}


class Theme {

  constructor (settings=[]) {
    this.settings = settings
    this.onConfigUpdate = this.onConfigUpdate.bind(this)
    this.listen = this.listen.bind(this)
  }

  activate (state) {
    let existing = atom.config.settings['reduced-dark-ui'] || {}
    let subscriptions = []

    // Initiate listeners for the settings defined in the package's configSchema
    doc.setAttribute(htmlAttrName, '')
    for (let key in this.settings) {

      let callback,
          subscription

      if (key == 'uiScale')
        callback = setScale

      else
        callback = (() => {})

      if (key in {})
        subscription = this.listen(
          key,
          existing[key],
          this.settings[key].type,
          callback)

      else
        subscription = this.listen(
          key,
          this.settings[key].default,
          this.settings[key].type,
          callback)

      subscriptions.push(subscription)
    }
    return subscriptions
    subscriptionManager = getComposite(...subscriptions)
  }

  deactivate () {
    return this.settings
  }

  listen (key, value, type, callback) {
    // console.log("Started listening to", namespace(key, true), "callback", callback)
    return atom.config.observe(
      namespace(key, true),
      val => this.onConfigUpdate(key, val, type, callback))
  }

  onConfigUpdate (name, value=null, type=null, callback=null) {

    //name = namespace(name)
    let bool = type == 'boolean'
    let current = doc.getAttribute(htmlAttrName) || ''
    let ns = namespace(name)
    let neu = current
        .split(' ')
        .filter(o => name !== o)

    if (value && bool) {
      neu.push(name)
      doc.removeAttribute(ns)
    }

    if (!bool)
      doc.setAttribute(ns, value)

    if (callback)
        callback()

    doc.setAttribute(htmlAttrName, neu.join(' '))
  }
}


let theme = null
let subscriptionManager

const activate = state => {
  console.log(state)
  atom.notifications.addInfo(
    JSON.stringify(state) )

  theme = new Theme(conf)
  let subs = theme.activate(state)
  console.log(subs);
  subscriptionManager = getComposite(...subs)
  console.log(subscriptionManager);

  setPanelIcons()
}

const deactivate = () => {
  subscriptionManager.dispose()
  theme.deactivate()
}

const serialize = (state) => {
  console.log(state)
}


export {
  activate,
  deactivate,
  serialize,

  rootNamespace,
  namespace,
  conf,
  doc,
  pkg,
}
