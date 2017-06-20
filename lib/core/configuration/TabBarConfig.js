'use babel'
import { setProp, toggleProp } from './index'
import { PACKAGE_NAME } from '../../constants'

export default function apply () {
  let position = atom.config.get(`${PACKAGE_NAME}.layout.tabPosition`)
  let closePosition = atom.config.get(`${PACKAGE_NAME}.layout.tabClosePosition`)
  let fixedTabBar = atom.config.get(`${PACKAGE_NAME}.layout.fixedTabBar`)
  setProp('.tab-bar', {
    'justify': position ? position.toLowerCase() : null,
    'close-button': closePosition ? closePosition.toLowerCase() : null,
  })
  toggleProp('atom-workspace', 'fixed-tabs', fixedTabBar)
}
