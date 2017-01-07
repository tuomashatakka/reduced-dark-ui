'use babel'
import dev from './tools'
import { setScale } from './scale'
import { provideConfigToLess, resetConfigStylesheet } from './core/configuration'
import { observeSettingsPanel } from './views/settings'
import { fetchIconLists } from './core/icons'
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
    }

    return subscriptions
  }

  deactivate () {
    return this.settings
  }

  listen (item, callback) {
    let { value, type, path } = item
    let ns = namespace(path, true)
    console.log(item)
    return atom.config.observe(
      ns, val => this.onConfigUpdate(path, val || value, type, callback))
  }

  onConfigUpdate (path, value, type, callback) {
    let bool = type == 'boolean'
    let key = path[path.length-1]
    let ns = namespace(key)

    console.log(path, key, callback)

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

const activate = options => {

  theme = new Theme(conf)
  let subs = theme.activate(options) || []
  let commands = {
    decorate: () => decorate(),
    'update-accents': () => provideConfigToLess(theme.settings),
  }

  applyModalBackdropBlur()
  subscriptionManager = getComposite()

  for (let disposable of subs) {
    subscriptionManager.add(disposable)
  }

  subscriptionManager.register({
    commands,
    options,
  })
  // console.log(fetchIconLists);
  // let itemCatalog = fetchIconLists();
  // itemCatalog.then(cat => {
  //   console.log(cat)
  // })
  console.log("IconPicker")
  console.log("show modal ...")
  let m = showModal()
  console.log(m);
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
