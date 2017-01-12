'use babel'
import dev from './tools'
import { CompositeDisposable } from 'atom'
import { setScale } from './scale'
import { provideConfigToLess, resetConfigStylesheet } from './core/configuration'
import { observeSettingsPanel } from './views/settings'
import { fetchIconLists } from './core/icons'
import fonts from './proc/refetchFontLists'
import { showModal } from './components/IconPicker'
import getComposite from './core/subscribe'
import decorate, { applyModalBackdropBlur } from './panels'
import { pkg, flatten, doc, conf, namespace } from './utils'


class Theme {

  constructor (settings=[]) {
    this.settings = flatten(settings)

    this.onConfigUpdate = this.onConfigUpdate.bind(this)
    this.listen = this.listen.bind(this)
  }

  activate (state) {
    let setting = observeSettingsPanel()
    let existing = atom.config.get('reduced-dark-ui') || {}
    let subscriptions = []

    // Remove the deprecated namespaced attributes from the html element
    // DEPRECATION: Remove this section
    let attrsToRemove = doc.attributes
    for (let key in attrsToRemove) {
      if (key.startsWith('reduced-dark-ui'))
        doc.removeAttribute(key)
    }
    // END DEPRECATION

    for (let key in this.settings) {
      let callback
      let subscription
      let item = this.settings[key]

      if (!item.branch)
        continue
      if (key == 'uiScale')
        callback = setScale
      else
        callback = (() => provideConfigToLess(this.settings))

      item = {
        ...item,
        path: item.path.concat([key]),
        value: item.value || false }
      subscription = this.listen(item, callback)
      subscriptions.push(subscription)
      atom.commands.register
    }

    return subscriptions
  }

  deactivate () {
    return this.settings
  }

  listen (item, callback) {
    let { value, type, path } = item
    let ns = namespace(path, true)

    return atom.config.observe(
      ns, val => this.onConfigUpdate(path, val || value, type, callback))
  }

  onConfigUpdate (path, value, type, callback) {
    let bool = type == 'boolean'
    let key = path[path.length-1]
    let ns = namespace(key)

    if (!bool)
      doc.setAttribute(ns, value)

    this.settings[key].value = value

    if (callback)
        callback()
  }
}


let theme,
    subscriptionManager,
    isLoaded = false

const commands = {
  'reduced-dark-ui:decorate': () => decorate(),
  'reduced-dark-ui:update-accents': () => provideConfigToLess(theme.settings),
  'reduced-dark-ui:update-fonts-listing': () => fonts(),
}
const deferredTasks = [
  () => applyModalBackdropBlur(),
]

const activate = options => {


  theme = new Theme(conf)
  subscriptionManager = getComposite()
  let subs = theme.activate(options) || []
  let cmds = atom.commands.add('atom-workspace', commands)

  for (let sub of subs) {
    subscriptionManager.add(sub)}
  subscriptionManager.add(cmds)

  // Miscellaneous tasks which can be deferred and executed
  // asynchronously in the background
  for (let task of deferredTasks) {
    setImmediate(() => task())}

  // console.log(fetchIconLists);
  // let itemCatalog = fetchIconLists();
  // itemCatalog.then(cat => {
  //   console.log(cat)
  // })
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
}
