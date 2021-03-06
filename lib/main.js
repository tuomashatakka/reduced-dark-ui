'use babel'

import panels from './core/panels'
import decorate, { applyModalBackdropBlur } from './panels'
import { apply, resolveFontFaceDefinition } from './core/configuration'
import { observeThemeView } from './views/SettingsView'
import { CompositeDisposable } from 'atom'
import { provideIconfonts } from './core/icons'
import { flatten, namespace } from './utils'
import { setScale } from './scale'
import { curtainify } from './fx'
import { PACKAGE_NAME } from './constants'

const
      commands = {
        'reduced-dark-ui:decorate':           () => decorate(),
        'reduced-dark-ui:iconfonts':          () => provideIconfonts(),
      },

      deferredTasks = [
        applyModalBackdropBlur,
        resolveFontFaceDefinition,
        observeThemeView,
        decorate,
        curtainify,
      ]

class Theme {

  constructor () {

    curtainify(true)
    let schema = atom.config.getSchema(PACKAGE_NAME)
    this.name = PACKAGE_NAME
    this.settings = {}
    this.panels = panels()

    // setupStorage()
    this.subscriptions = new CompositeDisposable()
    this.settings = flatten(schema.properties)

    this.activate = this.activate.bind(this)
    this.deactivate = this.deactivate.bind(this)
    this.listen = this.listen.bind(this)
    this.applyConfiguration = this.applyConfiguration.bind(this)
    this.bindSettings = this.bindSettings.bind(this)
  }


  activate () {

    // Add commands to the command palette & get configuration settings
    let cmds = atom.commands.add('atom-workspace', commands)
    setImmediate(() => this.subscriptions.add(cmds))

    // Set up configuration change observers
    this.bindSettings()

    // Start the execution of the deferred tasks
    this.runBackgroundTasks()
  }

  runBackgroundTasks () {
    for (let task in deferredTasks) {
      setImmediate(() => deferredTasks[task]())
    }
  }

  deactivate () {
    this.subscriptions.dispose()
    document.body.removeAttribute('theme-active')
  }

  provideIconFonts () {
  }

  bindSettings () {

    // TODO: Move to the ConfigManager class! id:15
    for (let key in this.settings) {

      let callback,
          item = this.settings[key],
          is = (n) => key === n,
          has = (term) => key.toLowerCase().search(term) > -1,
          derived = (parent) => item.path.indexOf(parent) > -1

      if (!item.branch)
        continue

      if (is('uiScale') || is('spacing'))
        callback = setScale

      else if (has('tab'))
        callback = apply.tab

      else if (derived('palette') || derived('state'))
        callback = apply.color

      else if(is('collapsing') || is('fixedProjectRoot') || is('overrideEditorBackground'))
        callback = apply.panel

      else if(has('font'))
        callback = apply.font

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
