'use babel'

// import Manager, { OPERATION } from './ConfigManager'
import Manager from './Config'
import { debounce } from 'underscore'
import tab from './TabBarConfig'
import color from './ColorConfig'
import panel from './PanelConfig'

let manager

const getManager = () => {
  manager = manager || new Manager()
  // if (!manager.compiler.compiled)
  //   manager.compiler.compileDeferred()
  return manager
}

const addClass = (sel, ...cls) =>
  el = document.querySelector(sel) && cls.map(o => el.classList.add(o))

const setProp = (sel, attrs={}) =>
  Object.keys(attrs).map(
    o => document.querySelectorAll(sel).forEach(
      el => el.setAttribute(`data-${o}`, attrs[o])
    )
  )

const toggleProp = (sel, attr, cond) =>
  document.querySelectorAll(sel).forEach(el => {
    console.log(el, cond)
    return cond ? el.setAttribute(attr, true) : el.removeAttribute(attr)
  })

const setupStorage    = ()        => getManager().initStorage()
const updateIconfont  = (name, content) => getManager().updateIconfont(name, content)
const updateConfig    = (content) => getManager().updateConf(content)
const updateFont      = (content) => getManager().updateFont(content)
const applyIconfont   = debounce(updateIconfont, 1000)
const applyConfig     = debounce(updateConfig,   1000)
const applyFont       = debounce(updateFont,     1000)
const apply           = { tab, color, panel, }

export {
  applyConfig,
  applyIconfont,
  applyFont,
  setupStorage,
  Manager,
  apply,
  setProp,
  toggleProp,
  // OPERATION,
}
