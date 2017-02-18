'use babel'

// import Manager, { OPERATION } from './ConfigManager'
import Manager from './Config'
import { debounce } from 'underscore'

let manager

const getManager = () => {
  manager = manager || new Manager()
  // if (!manager.compiler.compiled)
  //   manager.compiler.compileDeferred()
  return manager
}

const setupStorage  = ()        => getManager().initStorage()
const updateConfig  = (content) => getManager().updateConf(content)
const updateFont    = (content) => getManager().updateFont(content)
const applyFont     = debounce(updateFont,    1000)
const applyConfig   = debounce(updateConfig,  1000)

export {
  applyConfig,
  applyFont,
  setupStorage,
  Manager,
  // OPERATION,
}
