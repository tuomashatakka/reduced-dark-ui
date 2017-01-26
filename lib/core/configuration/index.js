'use babel'

import Manager, { OPERATION } from './ConfigManager'
import { throttle } from 'underscore'
import {
  provideConfigToLess,
  provideIconStylesheets,
  stylesheetPath } from './consts'

let manager

const getManager = () =>
  manager || new Manager()

const updateConfig = (content) => {
  console.log(provideConfigToLess(content))
  return content ?
  getManager().updateConf(provideConfigToLess(content)) :
  ({ message: "Invalid data provided to configuration update interface"})
}

const updateFont = (content) => content ?
  getManager().updateFont(content) :
  ({ message: "Invalid data provided to configuration update interface"})

const applyFont = throttle(updateFont, 1000)
const applyConfig = throttle(updateConfig, 1000)

export {
  applyConfig,
  applyFont,
  provideIconStylesheets,
  stylesheetPath,

  Manager,
  OPERATION,
}
