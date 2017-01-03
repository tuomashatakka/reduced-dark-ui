'use babel'

import { Disposable, CompositeDisposable } from 'atom'
import { rootNamespace } from '../main'

/**
 * Sets up commands for given strings in the package's
 * namespace and starts listening to the given object's
 * respectively named method as a handle for each action
 * provided.
 * @method addCommands
 * @param  {object}    obj Object into which the handlers are bound
 * @param  {[type]}    cmd A list of strings without the preceeding
 *                         package name. If the <obj> object has
 *                         similarly named method, it is registered
 *                         as a handler for the respective command
 */
function addCommands (self, ...cmd) {
  let commands = cmd.reduce( (acc, iter, key) => {
    let isDisposable = iter instanceof Disposable

    if (isDisposable)
      return acc

    key = rootNamespace + ':' + iter
    let handler = (...arg) => self.handle(name, ...arg)

    return Object.assign(acc, {[key]: handler.bind(self)})
  }, {})
  return atom.commands.add('atom-workspace', commands)
}


function registerCommand(cmd, handler) {
  let key = rootNamespace + ':' + cmd
  return atom.commands.add('atom-workspace', {
    [key]: (...args) => handler(...args)
  })
}


class ReducedComposite extends CompositeDisposable {

  constructor (...commands) {
    super()
    this.registry = {}
  }

  subscribe(command, callback, options={}) {
    // Create disposables for the provided commands
    // if they aren't of type Disposable but rather
    // a list of dot delimited scope descriptor strings
    if (Object.keys(this.registry).findIndex(o => command === o) !== -1)
      return

    let disp = registerCommand(command, callback)
    console.log(disp)
    this.add(disp)
    this.registry[command] = callback

    //if (options.initial) {
      let workspace = document.querySelector('atom-workspace')
      let cmdName = rootNamespace + ':' + command
      atom.commands.dispatch(workspace, cmdName)
    }
  //}

  register({ commands, options={} }) {

    if (!commands)
      return

    options = {
      initial: true,
      ...options }

    if (!options.update)
    for (let cmd in commands) {
      console.log(commands, cmd)
      this.subscribe(cmd, commands[cmd], options) }
  }

  insert(name, disposable) {
    let obj = this.add(disposable)
    console.log(obj)
    this.registry[name] = obj
  }

  handle(action, ...args) {
    // Dispatcher for disposables' callbacks.
    // Simply calls instance's own method named
    // <action> if one exists.
    let method = this[action]
    if (method)
      return method(...args)
    return false
  }

  descriptors () {
    return Object
      .keys(this.registry)
      .map(o => [rootNamespace, o].join(':'))
  }

  destroy () {
    this.dispose()
  }
}


let composite = null
export default (...commands) => {

  if (composite)
    return composite

  return composite = new ReducedComposite(...commands)
}
