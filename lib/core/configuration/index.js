'use babel'


import Manager, { OPERATION } from './ConfigManager'
import {
  provideConfigToLess,
  provideIconStylesheets,
  stylesheetPath,
  applyFonts } from './consts'


export default provideConfigToLess
export {
  provideConfigToLess,
  provideIconStylesheets,
  stylesheetPath,
  applyFonts,

  Manager,
  OPERATION,
}
