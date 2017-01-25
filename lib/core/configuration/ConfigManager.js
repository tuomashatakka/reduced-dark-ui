'use babel'
import { Emitter, CompositeDisposable, File, Directory } from 'atom'
import SafeLessCompiler from './SafeLessCompiler'
import os from 'path'

export const OPERATION = {
  ON_CHANGE: 'on-did-rewrite-mutate',
  ON_DID_BEGIN: 'on-did-rewrite-start',
  ON_DID_END: 'on-did-rewrite-end',
  ON_STACK_EMPTIED: 'on-did-finish',
  REQUEST_REWRITE: 'on-did-rewrite-requested'
}

const DEFAULTS = {
  dirName: 'theme',
  packageName: 'reduced-dark-ui',
}


/**
 * @class ConfigManager
 * @extends Emitter
 */
export default class ConfigManager extends Emitter {

  constructor (args) {
    super(args)

    let store = atom.getStorageFolder()
    let { dirName, packageName } = args || DEFAULTS
    if (!dirName) dirName = packageName

    this.queue = []
    this.transaction = false
    this.transactionCount = 0
    this.storage = new Directory(store.pathForKey(dirName))
    this.compiler = new SafeLessCompiler({ packageName })
    this.subscriptions = new CompositeDisposable()

    let mutationEvent = this.on(OPERATION.ON_CHANGE, payload => {
      this.transaction = payload ? true : false
      if(this.transaction) this.emit(OPERATION.ON_DID_BEGIN, payload)
      else this.emit(OPERATION.ON_DID_END, payload)
    })

    let startEvent  = this.on(OPERATION.ON_DID_BEGIN, data => this.writeConfigurationToFile(data))
    let endEvent    = this.on(OPERATION.ON_DID_END, data => this.processQueue(data))
    let finishEvent = this.on(OPERATION.ON_STACK_EMPTIED, () => {
      let entries   = this.storage.getEntriesSync()
      for (let file of entries) {
        this.compiler.apply({file}) }})

    this.subscriptions.add(mutationEvent)
    this.subscriptions.add(startEvent)
    this.subscriptions.add(endEvent)
    this.subscriptions.add(finishEvent)
  }

  getFile ({ name }) {

    let type = 'less'
    name = `${name}.${type}`
    let file = new File()
    // let parent = file.getParent()
    let dir = this.storage.getRealPathSync()
    let path = os.join(dir, name)
    file.setPath(path)

    const exists = file.existsSync()
    return new Promise((resolve, reject) => {
      const accept = () => resolve({ status: true, file, path })
      const error = message => reject({ status: false, message })

      if (exists)
        accept()

      else file
          .create()
          .then(() => accept())
          .catch(message => error(message))
    })
  }

  getDirectory () {

    return new Promise((resolve, reject) => {

      const path = this.storage.getRealPathSync()
      const accept = () => resolve({ status: true, path })
      const error = (message) => reject({ status: false, message, path })

      const create = () => this.storage.create()
        .then(res => accept())
        .catch(error)

      const exec = () => this.storage.exists()
        .then(res => res ? accept(res) : create())
        .catch(error)

      exec()
    })
  }

  writeConfigurationToFile ({ content, file }) {
    if (file)
      file.writeSync(content)
    this.transactionCount ++
    this.emit(OPERATION.ON_CHANGE)
  }

  processQueue (payload) {

    let next = null

    if (payload) {
      this.queue = this.queue
      .filter(o => o.name !== payload.name)
      .concat([payload])
    }

    if (this.transaction)
      return

    if (this.queue.length) {
      next = this.queue.splice(0, 1)
      this.emit(OPERATION.ON_CHANGE, ...next)
    }
    else
      this.emit(OPERATION.ON_STACK_EMPTIED)
  }

  requestConfigurationRewrite ({ content, name }) {
    this.emit(OPERATION.REQUEST_REWRITE)

    const dir = () => this.getDirectory()
    const file = () => this.getFile({ name })

    dir().then(({path}) =>
    file().then(({file}) => {
      path = path || this.storage.getRealPathSync()
      let payload = { path, name, file, content }
      this.processQueue(payload)
    })
    /* eslint-disable */
    .catch(err => console.error(err)))
    .catch(err => console.error(err))
    /* eslint-enable */
  }
}