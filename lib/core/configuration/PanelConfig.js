'use babel'
import { setProp, toggleProp } from './index'
import { PACKAGE_NAME } from '../../constants'

export default function apply () {
  let collapse = atom.config.get(`${PACKAGE_NAME}.layout.collapsing`).toLowerCase()
  let fixedProjectRoot = atom.config.get(`${PACKAGE_NAME}.layout.fixedProjectRoot`)
  let sillyModeEnabled = atom.config.get(`${PACKAGE_NAME}.layout.SILLYMODE`)
  toggleProp('.tree-view-scroller', 'fixed-root', fixedProjectRoot)
  toggleProp('atom-panel.left', 'collapse', collapse === 'both' || collapse === 'left')
  toggleProp('atom-panel.right', 'collapse', collapse === 'both' || collapse === 'right')
  toggleProp('html', 'silly', sillyModeEnabled)
}
