'use babel'

'use babel';
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
    let handler = (...arg) => self.handle(name, ...args)

    return Object.assign(acc, {[key]: handler.bind(self)})
  }, {})
  return atom.commands.add('atom-workspace', commands)
}


class ReducedComposite extends CompositeDisposable {

  constructor (...commands) {
    super()
    this.registry = {}

    if(commands.length)
      this.subscribe(...commands)
  }

  subscribe(...commands) {
    // Create disposables for the provided commands
    // if they aren't of type Disposable but rather
    // a list of dot delimited scope descriptor strings
    let disp = addCommands(this, ...commands)

    // If a CompositeDisposable is returned, adapt
    // its disposables
    if (disp instanceof CompositeDisposable)
      this.disposables = disp.disposables

    // Otherwise add the provided commands in a regular fashion
    else
      this.add(...commands)
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
