'use babel'
import dev from './tools'
import { findElementIcon, getIcons, updateIcons, makeIcon, ICON_CLASS_NAME } from './core/icons'
import { formatTitle, FORMAT_FLAGS } from './utils'
import { TAB_HEIGHT } from './constants'


/**
 * Takes a panel instance and rturns the view item for that panel
 * @method getPanelItemNode
 * @return {HTMLNode} The element for the panel's first item
 */
export const getPanelItemNode = (panel, n=0) => {
      if (panel.item)
        panel = panel.item

      if (panel.get)
        panel = panel.get(n)

      if (panel.element)
        return panel.element

      return panel
    },


/**
 * Resolves identification details for a panel to use
 * in naming
 * @method getPanelSpecs
 * @param  {[type]}      panel [description]
 * @return {Object}            An object containing the panel's tag
*                              and class names
 */
    getPanelSpecs = (panel) => {

      let { name } = panel.item.constructor,
          node = getPanelItemNode(panel),
          proposals = []

      if (!name.startsWith('HTML'))
        proposals.push(formatTitle(name, FORMAT_FLAGS.DASHED))

      if (node.getAttribute && node.getAttribute('id'))
        proposals.push(node.getAttribute('id'))

      if (node.tagName && node.tagName !== 'DIV')
        proposals.push(node.tagName.toLowerCase())

      if (node.classList && node.classList.length)
        proposals = proposals.concat([...node.classList])

      return proposals.filter(name => name)
    },


    resolvePanelIdentifier = (panel) => {

      let names = getPanelSpecs(panel)
      let test = names
      while (test.length) {
        let c = test.pop()
        let pkg = atom.packages.getLoadedPackage(c)
        if (pkg)
          return pkg.name
      }

      return names.length ? names[0] : null
    },


    updateMargin = (target, source) => {

      let cls = source.parentElement.classList
      let isOpen = !cls.contains('open')
      let width = isOpen ?
        source.getBoundingClientRect().width + 'px' :
        TAB_HEIGHT
      target.style.marginLeft = width
      cls.toggle('open')
    },


    decoratePanel = (panel, overrides) => {

      let { iconElement,
            name: pre,
            icon: ico } = panel
      let className     = ICON_CLASS_NAME
      let packageClass  = resolvePanelIdentifier(panel)
      let name          = pre || formatTitle(packageClass)
      let savedIcon     = getIcons(name) || {}
      let el            = getPanelItemNode(panel)
      let node          = iconElement
      let { parentElement } = el

      // Short-circuit if the icon is already applied,
      // except if the keepExisting argument has a value of true,
      // in which case remove the old icon from the DOM and continue
      // execution normally
      ico = ico || {}
      ico = { ...savedIcon, ...ico, ...overrides }

      if (!ico.icon) {
        ico = findElementIcon(el)
        updateIcons({[name]: ico})
      }

      node = makeIcon({ node, ...ico, className })
      const mainPaneContainer = document.querySelector('atom-workspace-axis.vertical')
      let update        = () => updateMargin(mainPaneContainer, el)

      node.addEventListener('click', update)
      if (!node.parentElement && parentElement) {
        parentElement.insertBefore(node, el)
        parentElement.classList.add(`panel-${packageClass}`)
      }
      return { ico, name, iconNode: node, identifier: packageClass }
    },


    applyModalBackdropBlur = () => {

      const observeVisibilityChanges = (modal) => {
        let classes = document.documentElement.classList
        let disposable =
            modal.onDidChangeVisible(
              visible => visible ?
                classes.add('modal-open') :
                classes.remove('modal-open'))
        modal.onDidDestroy( () => disposable.dispose() )

        if (modal.visible)
          classes.add('modal-open')
      }

      let modalContainer = document
         .querySelector('atom-panel-container.modal')


      let modals = atom.workspace.getModalPanels()

      // Subscribe to existing panels' onDidChangeVisible event
      // & modals' container's onDidAddPanel event
      modals.forEach(
        modal => observeVisibilityChanges(modal))
      if (modalContainer)
        modalContainer
        .getModel()
        .onDidAddPanel(
        item => observeVisibilityChanges(item.panel))
    },

    decorate = () => {
      let panels = atom.workspace.getPanels('left')
      let rightPanels = atom.workspace.getPanels('right')

      dev.message("Decorating panels")

      panels.concat(rightPanels)
            .forEach(decoratePanel)
    }

export default
  decorate
