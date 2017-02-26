'use babel'
import { PACKAGE_NAME } from '../../constants'

const addClass = (sel, ...cls) => el = document.querySelector(sel) && cls.map(o => el.classList.add(o))
const setProp = (sel, attrs={}) => Object.keys(attrs).map(o => document.querySelector(sel).setAttribute(`data-${o}`, attrs[o]))

export default function apply () {
  let position = atom.config.get(`${PACKAGE_NAME}.layout.tabPosition`)
  let closePosition = atom.config.get(`${PACKAGE_NAME}.layout.tabClosePosition`)
  let fixedTabBar = atom.config.get(`${PACKAGE_NAME}.layout.fixedTabBar`)
  console.log("POS", position, closePosition)
  setProp('.tab-bar', {
    'justify': position,
    'close-button': closePosition,
    'fixed': fixedTabBar ? 'true' : 'false',
  })
}
