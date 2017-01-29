'use babel'

import getComposite from './core/subscribe'
import decorate, { applyModalBackdropBlur } from './panels'
import { flatten, namespace } from './utils'
import { setScale } from './scale'
import { fetchIconLists } from './core/icons'
// import { fetchFontLists } from './core/fonts'
import { applyConfig, applyFont, appendDependencyToVariablesStyle } from './core/configuration'
import { observeSettingsPanel } from './views/SettingsView'
const

// configuration = {
//   layout: applyConfig,
//   palette: applyConfig,
//   decor: applyConfig,
//   icons: decorate,
//   env: fetchFontLists },

commands = {
  'reduced-dark-ui:decorate': () => decorate(),
  // 'reduced-dark-ui:reset-config': () => createFile('styles/_styles/config-fallback.less'),
  'reduced-dark-ui:update-stylesheets': () => applyConfig({ config: theme.settings }),
  // 'reduced-dark-ui:update-fonts-listing': () => atom.devMode ? fetchFontLists() : null
},

deferredTasks = [
  applyModalBackdropBlur,
  decorate,
  observeSettingsPanel,
  curtainify,
  fetchIconLists,
  // fetchFontLists
]

function curtainify (hide=false) {
  let trans = hide === true ? 'none' : "opacity .5s, blur .29s"
  let body = document.body

  body.style.opacity = hide === true ? 0 : 1
  body.style.webkitFilter = hide === true ? "blur(1em)" : "blur(0em)"
  body.style.transition = trans
  if (!hide) {
    body.style.animationPlayState = "running";
    body.style.webkitAnimationPlayState = "running";
  }

}
curtainify(true)
class Theme {

  constructor (name) {
    this.name = name
    this.settings = {}
    this.subscriptions = null
    appendDependencyToVariablesStyle(this.name)
    atom.packages.onDidActivateInitialPackages(
      ()=>{
      curtainify()
      atom.packages.onDidActivatePackage(() => curtainify())})
    //this.configManager = new Manager({ packageName: this.name })

    this.activate = this.activate.bind(this)
    this.deactivate = this.deactivate.bind(this)
    this.serialize = this.serialize.bind(this)
    this.listen = this.listen.bind(this)
    this.applyConfiguration = this.applyConfiguration.bind(this)
    this.bindSettings = this.bindSettings.bind(this)
  }

  activate () {

    let schema = atom.config.getSchema('reduced-dark-ui')
    this.subscriptions = getComposite()
    this.settings = flatten(schema.properties)

    // Add commands to the command palette & get configuration settings
    let cmds = atom.commands.add('atom-workspace', commands)
    this.subscriptions.add(cmds)

    // Set up configuration change observers
    this.bindSettings()

    // Start the execution of the deferred tasks
    // TODO: Set up external async tasks for the deferred tasks id:14
    for (let task in deferredTasks) {
      this.runBackgroundTask(task) }

  }

  runBackgroundTask (task) {
    setTimeout(
    deferredTasks[task],
    500)
  }

  serialize (...args) {
    return {
      state: [args]
    }
  }

  deactivate () {
    this.subscriptions.dispose()
  }

  bindSettings () {

    // TODO: Move to the ConfigManager class! id:15
    for (let key in this.settings) {

      let callback,
          item = this.settings[key],
          is = (n) => key === n
      if (!item.branch)                   continue
      if (is('uiScale') || is('spacing')) callback = setScale
      else if (key == 'uiFont')           callback = applyFont
      else                                callback = applyConfig

      let path = item.path.concat([key])
      let value = item.value || false
      item = { ...item, path, value }

      let subscription = this.listen(item, callback)
      this.subscriptions.add(subscription)
    }
  }

  listen (item, callback) {

    let { value, type, path } = item
    let ns = namespace(path, true)

    return atom.config.observe(
      ns, val => this.applyConfiguration(path, val || value, type, callback)
    )
  }

  applyConfiguration (path, value, type, callback) {

    let key = path[path.length-1]
    let attrs = [ 'uiScale', 'spacing' ]
    let shouldWriteToDom = attrs.indexOf(key) !== -1
    let ns = namespace(key)

    this.settings[key].value = value
    let config = this.settings

    if (shouldWriteToDom)
      document.documentElement.setAttribute(ns, value)

    if (callback)
      callback({ value, key, config })
  }
}


let theme = new Theme('reduced-dark-ui')
export default theme
