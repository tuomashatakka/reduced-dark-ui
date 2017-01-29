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

const translateToLessVariables = ({config, key}) => {
  let stream = ''

  console.log(config);
  for (let attr in config) {
    let item = config[attr]
    let { type, value, branch } = item
    console.warn(attr, value, type);

    // Skip the cases where the variable has no value
    if (!branch ||
        value == 'undefined' ||
        typeof value === 'undefined')
        continue

    // Prepend the variable names with two underscores
    attr = `__${attr}`

    // Add hyphens to string variables
    if (type === 'string')
      stream += `@${attr}: "${value}";\n`

    // Echo hex codes for Color objects
    else if (type === 'color')
      stream += `@${attr}: ${value.toJSON()};\n`

    // Pass integers and booleans as-is
    else if (type === 'integer' ||
      type === 'boolean')
      stream += `@${attr}: ${value};\n`
  }
  console.log(stream);
  return stream
}

const updateConfig = (content) => getManager().updateConf(translateToLessVariables(content))
const updateFont = (content) => getManager().updateFont(content)
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
  try {      fs.statSync(configPath)}
  catch(e) { fs.mkdirSync(configPath)}
  try {      fs.readFileSync(configFilePath)}
  catch(e) { fs.writeFileSync(configFilePath, " ")}
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
