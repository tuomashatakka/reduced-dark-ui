import dev from './tools'
import { setScale } from './scale'
import { Task } from 'atom'
import { applyStyles, resetStyles } from './core/configuration'
import getComposite from './core/subscribe'
import decorate from './panels'


const pkg = require('../package.json')
const doc = document.documentElement
const { configSchema: conf, name: rootNamespace } = pkg
const htmlAttrName = rootNamespace + '-settings'

const namespace = (name, delim=false) => {

  let pt = delim ? '.' : '-'
  let x = {}

  let y = {...x}
  if (name.constructor.name === 'Array')
    name = name.join(pt)

  return [rootNamespace, name].join(pt)
}


function flatten (o, path=[]) {
  let accumulated = {}
  for (let key in o) {
    let iter = o[key]
    let props = Object.keys(iter)
    console.log(iter, key, props)
    if (iter.properties) {
      accumulated = Object.assign({},
        accumulated,
        flatten(iter.properties, path.concat([key]))
      )
      props = props.filter(key => key !== 'properties')
    }
    props = props.reduce((a, k) => Object.assign({}, a, {[k]: iter[k]}), {})
    props.path = path
    props.branch = !iter.properties
    accumulated = Object.assign( {}, accumulated, {[key]: props} )
  }
  console.log(accumulated)
  return accumulated
}


class Theme {

  constructor (settings=[]) {
    this.settings = flatten(settings)
    this.onConfigUpdate = this.onConfigUpdate.bind(this)
    this.listen = this.listen.bind(this)
  }

  activate (state) {
    let existing = atom.config.get('reduced-dark-ui') || {}
    let subscriptions = []

    // Initiate listeners for the settings defined in the package's configSchema
    doc.setAttribute(htmlAttrName, '')

    let settings = Object.keys(
      this.settings)
      .filter(
      setting =>
      setting.branch === true)

    for (let key in this.settings) {

      let item = this.settings[key]

      if (!item.branch)
        continue

      let callback,
          subscription

      if (key == 'uiScale')
        callback = setScale

      else
        callback = (() => {})

      let original = atom.config.get(namespace(key, true))
      item.path = item.path.concat([key])
      item.value = item.value || original
      subscription = this.listen(item, callback)
      subscriptions.push(subscription)
    }
    return subscriptions
  }

  deactivate () {
    return this.settings
  }

  listen (item, callback) {
    let { default: defaultValue, type, path } = item
    let ns = namespace(path, true)
    return atom.config.observe(
      ns, val => {
        let original = atom.config.get(namespace(path, true))

        dev.log({item, ns, path, val, original, defaultValue, type})

        return this.onConfigUpdate(path, val || original, type, callback)
      })
  }

  onConfigUpdate (name, value=null, type=null, callback=null) {
    let bool = type == 'boolean'
    let current = doc.getAttribute(htmlAttrName) || ''
    let ns = namespace(name[name.length-1])
    let neu = current
        .split(' ')
        .filter(o => ns !== o)

    if (value && bool) {
      neu.push(ns)
      doc.removeAttribute(ns)
    }

    dev.log(name, value, type, callback)

    switch (type) {
      case 'color':
        dev.log(name, value, type, ns)
        if (typeof value !== 'string')
          value = value
        doc.setAttribute(ns, value)
        break

      default:
        if (!bool)
          doc.setAttribute(ns, value)
    }

    this.settings[name[name.length-1]].value = value
    console.log(this.settings)
    if (callback)
        callback()

    doc.setAttribute(htmlAttrName, neu.join(' '))
  }
}


let theme,
    subscriptionManager,
    isLoaded = false

const activate = options => {

  let styles = {
  }

  theme = new Theme(conf)
  let subs = theme.activate(options) || []
  let commands = {
    'decorate': () => decorate(),
    'update-accents': () => applyStyles(styles, theme),
  }
  subscriptionManager = getComposite()
  atom.notifications.addInfo(JSON.stringify([subscriptionManager]))
  atom.notifications.addInfo(JSON.stringify(["OPTIONS", options]))
  for (let disposable of subs) {
    subscriptionManager.add(disposable)
  }

  subscriptionManager.register({
    commands,
    options,
  })
}


const deactivate = state => {
  dev.log({state})
  if (state && state.update)
    return
  subscriptionManager.dispose()
  theme.deactivate()
  theme = null
}


const serialize = () => {
  let state = {

  }
  dev.log(state)
  return state
}


export {
  activate,
  deactivate,
  decorate,
  applyStyles,
  resetStyles,

  rootNamespace,
  namespace,
  conf,
  doc,
  pkg,
}