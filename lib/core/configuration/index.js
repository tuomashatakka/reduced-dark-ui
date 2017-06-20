'use babel'

// import Manager, { OPERATION } from './ConfigManager'
import Manager from './Config'
import { debounce } from 'underscore'
import tab from './TabBarConfig'
import color from './ColorConfig'
import panel from './PanelConfig'
import font, { resolveFontFaceDefinition } from './FontConfig'

let manager

const getManager = () => (manager = manager || new Manager())

const setProp = (sel, attrs={}) =>
  Object.keys(attrs).map(
    o => document.querySelectorAll(sel).forEach(
      el => el.setAttribute(`data-${o}`, attrs[o])))

const toggleProp = (sel, attr, cond) =>
  document.querySelectorAll(sel).forEach(el => {
    return cond ? el.setAttribute(attr, true) : el.removeAttribute(attr)})

const setupStorage    = () => getManager()//.initStorage()
const updateIconfont  = (name, content) => getManager().updateIconfont(name, content)
const updateConfig    = (content) => getManager().updateConf(content)
const applyIconfont   = debounce(updateIconfont, 1000)
const applyConfig     = debounce(updateConfig,   1000)
const applyFont       = (...args) => font(...args)
const apply           = { tab, color, panel, font, }

export {
  applyConfig,
  applyIconfont,
  applyFont,
  resolveFontFaceDefinition,
  setupStorage,
  Manager,
  apply,
  setProp,
  toggleProp,
}
