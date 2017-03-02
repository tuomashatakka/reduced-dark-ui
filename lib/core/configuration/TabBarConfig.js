'use babel'
import { setProp, toggleProp } from './index'
import { PACKAGE_NAME } from '../../constants'

export default function apply () {
  let position = atom.config.get(`${PACKAGE_NAME}.layout.tabPosition`).toLowerCase()
  let closePosition = atom.config.get(`${PACKAGE_NAME}.layout.tabClosePosition`).toLowerCase()
  let fixedTabBar = atom.config.get(`${PACKAGE_NAME}.layout.fixedTabBar`)
  setProp('.tab-bar', {
    'justify': position,
    'close-button': closePosition,
  })
  toggleProp('atom-workspace', 'fixed-tabs', fixedTabBar)
}
