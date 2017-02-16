'use babel'
import { Emitter, CompositeDisposable } from 'atom'
import { decoratePanel } from '../panels'
import { makeIcon } from './icons'

const PACKAGE_NAME = 'reduced-dark-ui'


export class PanelManager extends Emitter {

  constructor (...args) {
    super(...args)
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(
      atom.workspace.panelContainers.left.onDidAddPanel((...args) => {
      this.emit('update', 'left', ...args) }))
    this.subscriptions.add(
      atom.workspace.panelContainers.right.onDidAddPanel((...args) => {
      this.emit('update', 'right', ...args) }))

    this.on('change', (args) => { this.setPanelIcon.call(this, args) })
    this.on('update', this.updatePanels.bind(this))
    this.emit('update')
  }

  updatePanels () {

    let panels = this.getPanels()

    for (let panel of panels) {
      let specs         = decoratePanel(panel)
      panel.icon        = specs.ico
      panel.name        = specs.name
      panel.iconElement = specs.iconNode
    }
  }

  getPanels () {
    let collapse = atom.config.get(`${PACKAGE_NAME}.layout.collapsing`)
    let panels = []

    if (collapse === 'Neither')
      return panels
    if (collapse !== 'Right')
      panels = panels.concat(atom.workspace.getLeftPanels())
    if (collapse !== 'Left')
      panels = panels.concat(atom.workspace.getRightPanels())

    return panels
  }

  setPanelIcon (props) {

    let { name, panel, icon, iconset } = props
    if (name)
      panel = this.getPanels().find(pan => pan.name === name)

    panel.icon = { icon, iconset }
    decoratePanel(panel)
  }

}


let pmgr = new PanelManager()
export default function getManager () { return pmgr }
