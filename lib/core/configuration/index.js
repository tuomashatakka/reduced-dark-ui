'use babel'

import Manager, { OPERATION } from './ConfigManager'
import { throttle } from 'underscore'
import fs from 'fs'
import os from 'path'
import {
  provideConfigToLess,
  provideIconStylesheets,
  stylesheetPath } from './consts'

let manager

const getManager = () => {
  manager = manager || new Manager()
  if (!manager.compiler.compiled)
    manager.compiler.compileDeferred()
  return manager
}

const updateConfig = (content) => {
  return content ?
  getManager().updateConf(provideConfigToLess(content)) :
  ({ message: "Invalid data provided to configuration update interface"})}

const updateFont = (content) => content ?
  getManager().updateFont(content) :
  ({ message: "Invalid data provided to configuration update interface"})

const applyFont = throttle(updateFont, 1000)
const applyConfig = throttle(updateConfig, 1000)

const appendDependencyToVariablesStyle = (n) => {

  let pkg = atom.packages.getLoadedPackage(n)
  let store = atom.getStorageFolder()
  let stylesPath = os.join(pkg.path, 'styles')
  let configPath = store.pathForKey(pkg.name)
  let configFilePath = os.join(configPath, 'config.less')
  let variablesFilePath = os.join(stylesPath, 'ui-variables.less')
  let importFallbackVars = "@import '_styles/config-fallback';\n"
  let importUIVars = "@import '_styles/ui-variables';\n"
  let importUserVars = `@import '${configFilePath}';\n`

  // Write config storage file if it doesn't exist
  const buildDependencies = () => {
    try {      fs.statSync(configPath)}
    catch(e) { fs.mkdirSync(configPath)}
    try {      fs.readFileSync(configFilePath)}
    catch(e) { fs.writeFileSync(configFilePath, " ")}
  }
  buildDependencies()

  try {
    let contents = fs.readFileSync(variablesFilePath, 'utf8')
    let importCount = 0
    contents.replace(/\@import/g, () => importCount++)
    if (importCount < 3)
      fs.writeFileSync(variablesFilePath,
      `${importFallbackVars}${importUserVars}${importUIVars}`)
    return true
  }

  catch(e) {
    fs.writeFileSync(variablesFilePath, `${importFallbackVars}${importUIVars}`)
    return false }}

export {
  applyConfig,
  applyFont,
  provideIconStylesheets,
  appendDependencyToVariablesStyle,
  stylesheetPath,

  Manager,
  OPERATION,
}
