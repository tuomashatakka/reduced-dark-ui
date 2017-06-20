'use babel'
import { setProp, toggleProp } from './index'
import { PACKAGE_NAME } from '../../constants'

export default function apply () {
  let collapse = atom.config.get(`${PACKAGE_NAME}.layout.collapsing`)
  let fixedProjectRoot = atom.config.get(`${PACKAGE_NAME}.layout.fixedProjectRoot`)
  let sillyModeEnabled = atom.config.get(`${PACKAGE_NAME}.layout.SILLYMODE`)
  let overrideBackground = atom.config.get(`${PACKAGE_NAME}.decor.overrideEditorBackground`)
  toggleProp('.tree-view-scroller', 'fixed-root', fixedProjectRoot)
  toggleProp('atom-panel-container.left', 'collapse', collapse === 'Both' || collapse === 'Left')
  toggleProp('atom-panel-container.right', 'collapse', collapse === 'Both' || collapse === 'Right')
  toggleProp('html', 'silly', sillyModeEnabled)
  toggleProp('atom-workspace', 'background-override', overrideBackground)
}
