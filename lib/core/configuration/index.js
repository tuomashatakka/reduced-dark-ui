'use babel'

import Manager, { OPERATION } from './ConfigManager'
import { throttle } from 'underscore'

let manager

const getManager = () => {
  manager = manager || new Manager()
  if (!manager.compiler.compiled)
    manager.compiler.compileDeferred()
  return manager
}

const appendDependencyToVariablesStyle = () => getManager().initStorage()
const updateConfig = (content) => getManager().updateConf(content, 'less')
const updateFont = (content) => getManager().updateFont(content)
const applyFont = throttle(updateFont, 1000)
const applyConfig = throttle(updateConfig, 1000)

export {
  applyConfig,
  applyFont,
  appendDependencyToVariablesStyle,
  Manager,
  OPERATION,
}
