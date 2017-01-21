'use babel'

import { info } from '../tools'
import { CompositeDisposable } from 'atom'
import { rootNamespace } from '../main'

// /**
//  * Sets up commands for given strings in the package's
//  * namespace and starts listening to the given object's
//  * respectively named method as a handle for each action
//  * provided.
//  * @method addCommands
//  * @param  {object}    obj Object into which the handlers are bound
//  * @param  {[type]}    cmd A list of strings without the preceeding
//  *                         package name. If the <obj> object has
//  *                         similarly named method, it is registered
//  *                         as a handler for the respective command
//  */
// function addCommands (self, ...cmd) {
//   let commands = cmd.reduce( (acc, iter, key) => {
//     let isDisposable = iter instanceof Disposable
//
//     if (isDisposable)
//       return acc
//
//     key = rootNamespace + ':' + iter
//     let handler = (...arg) => self.handle(name, ...arg)
//
//     return {
//       ...acc,
//       [key]: handler.bind(self)
//     }
//   }, {})
//   return atom.commands.add('atom-workspace', commands)
// }
//
//
// function registerCommand(cmd, handler) {
//   let key = rootNamespace + ':' + cmd
//   return atom.commands.add(
//     'atom-workspace',
//     key,
//     (...args) => handler(...args))
// }


class ReducedComposite extends CompositeDisposable {

  constructor () {
    super()
    this.registry = []
    this.pack = atom.packages.getLoadedPackage(rootNamespace)
  }

  subscribe(command, callback, opts={type: 'cmd', initial: false}) {
    // Create disposables for the provided commands
    // if they aren't of type Disposable but rather
    // a list of dot delimited scope descriptor strings

    // o       let cmdName = rootNamespace + ':' + command
    let workspace = document.querySelector('atom-workspace')
    let disposable = atom.commands.add(workspace, command, callback)
    this.register(command, disposable)

    if (opts.initial) {
      if (command.constructor.name === 'Array')
      for (let c of command) {
        atom.commands.dispatch(workspace, c) }
      else
        atom.commands.dispatch(workspace, command)
    }
  }

  register(cmd, disposable) {
    this.add(cmd)
    this.registry.push([cmd, disposable])
    this.pack.onDidDeactivatePackage(o => info(o, cmd))
  }

  registered(command) {
    return (
      Object
      .keys(this.registry)
      .findIndex(o => command === o[0])
      !== -1)
  }

  // handle(action, ...args) {
  //   // Dispatcher for disposables' callbacks.
  //   // Simply calls instance's own method named
  //   // <action> if one exists.
  //   let method = this[action]
  //   if (method)
  //     return method(...args)
  //   return false
  // }

  descriptors () {
    return this.registry.map(o => o[0])
    // Object
    //   .keys(this.registry)
    //   .map(o => [rootNamespace, o].join(':'))
  }
}


let composite = null
export default () => {

  if (composite)
    return composite

  return composite = new ReducedComposite()
}
