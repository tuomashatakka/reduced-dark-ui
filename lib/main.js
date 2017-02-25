'use babel'

import getComposite from './core/subscribe'
import panels from './core/panels'
import decorate, { applyModalBackdropBlur } from './panels'
import { flatten, namespace } from './utils'
import { setScale } from './scale'
import { curtainify } from './fx'
import { applyConfig, setupStorage } from './core/configuration'
import { PACKAGE_NAME } from './constants'
import observeThemeView from './views/SettingsView/register'

const
      commands = {
        'reduced-dark-ui:decorate':           () => decorate(),
        'reduced-dark-ui:update-stylesheets': () => applyConfig({ config: theme.settings }),
      },

      deferredTasks = [
        applyModalBackdropBlur,
        observeThemeView,
        curtainify,
      ]

const shouldInit = () =>
  (!atom.devMode || localStorage.getItem('reduced-dark-dev-init') !== 'live')

const removeInitKey = name =>
  name === PACKAGE_NAME && localStorage.removeItem('reduced-dark-dev-init')

class Theme {

  constructor () {

    curtainify(true)
    let schema = atom.config.getSchema(PACKAGE_NAME)
    this.name = PACKAGE_NAME
    this.settings = {}
    this.subscriptions = null
    this.panels = panels()

    setupStorage()
    this.subscriptions = getComposite()
    this.settings = flatten(schema.properties)

    this.activate = this.activate.bind(this)
    this.deactivate = this.deactivate.bind(this)
    this.serialize = this.serialize.bind(this)
    this.listen = this.listen.bind(this)
    this.applyConfiguration = this.applyConfiguration.bind(this)
    this.bindSettings = this.bindSettings.bind(this)
  }


  activate () {
    const apply = () => {


    // Add commands to the command palette & get configuration settings
    let cmds = atom.commands.add('atom-workspace', commands)
    setImmediate(() => this.subscriptions.add(cmds))

    // Set up configuration change observers
    setImmediate(() => this.bindSettings())

    // Start the execution of the deferred tasks
    this.runBackgroundTasks()
    setImmediate(() => curtainify())
    }

    apply()
    localStorage.setItem('reduced-dark-dev-init', 'live')
    atom.packages.onDidUnloadPackage(pkg => removeInitKey(pkg.name))
  }

  runBackgroundTasks () {
    for (let task in deferredTasks) {
      setImmediate(() => deferredTasks[task]())
    }
  }

  serialize () {
    return {}
  }

  deactivate () {
    if (shouldInit()) {
      this.subscriptions.dispose()
      localStorage.removeItem('reduced-dark-activated')
      localStorage.removeItem('reduced-dark-spinner')
    }
    document.body.removeAttribute('theme-active')
  }


  provideIconFonts (service) {
    console.warn("ICON FONTS HURRAY")
    console.warn("-> service", service)
  }

  bindSettings () {

    // TODO: Move to the ConfigManager class! id:15
    for (let key in this.settings) {
      let callback,
          item = this.settings[key],
          is = (n) => key === n
      if (!item.branch)                   continue
      if (is('uiScale') || is('spacing')) callback = setScale
      else                                callback = applyConfig

      let path          = item.path.concat([key])
      let value         = item.value || false
      let subscription  = this.listen({ ...item, path, value }, callback)
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

    this.settings[key].value = value
    let config = this.settings

    if (shouldWriteToDom)
      document.documentElement.setAttribute(key, value)
    if (callback)
      callback({ value, key, config })
  }
}

var theme = window.theme = new Theme(PACKAGE_NAME)
const _theme = () => window.theme = theme = theme ? theme : new Theme(PACKAGE_NAME)
export default {

  activate: (...args) =>
    _theme().activate(...args),

  deactivate: (...args) =>
    _theme().deactivate(...args),

  provideIconFonts: (service) =>
    _theme().provideIconFonts(service),
}
