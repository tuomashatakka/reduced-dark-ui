'use babel'
import dev from './tools'
import { findElementIcon, getIcons, updateIcons, clearIcons, makeIcon, ICON_CLASS_NAME } from './core/icons'
import { formatTitle, uuid } from './utils'
import { TAB_HEIGHT } from './constants'


/**
 * Takes a panel instance and rturns the view item for that panel
 * @method getPanelItemNode
 * @return {HTMLNode} The element for the panel's first item
 */
export const getPanelItemNode = (panel, n=0) =>
  panel.item ? (panel.item.get ? panel.item.get(n) : panel.item) : {},


/**
 * Resolves identification details for a panel to use
 * in naming
 * @method getPanelSpecs
 * @param  {[type]}      panel [description]
 * @return {Object}            An object containing the panel's tag
*                              and class names
 */
    getPanelSpecs = (panel) => {
      let tag = null,
          id = null,
          classes = [],
          node = getPanelItemNode(panel)

      if (node.getAttribute('id'))
        id = node.getAttribute('id')

      if (node.tagName && node.tagName !== 'DIV')
        tag = node.tagName.toLowerCase()

      if (node.classList && node.classList.length)
        classes = node.classList

      return { id, tag, classes }
    },


    resolvePanelIdentifier = (panel) => {

      let { id, tag, classes } = getPanelSpecs(panel)
      let test = [tag, id, ...classes]

      while (test.length) {
        let c = test.pop()
        let pkg = atom.packages.getLoadedPackage(c)

        if (pkg)
          return pkg.name
      }

      return tag || [...classes].join('-')
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
      let { parentElement,
            firstElementChild:
            iconNode }  =  el
      let node          =  iconElement

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
      console.log("\nnode",node, "\niconNode",iconNode, "\niconElement",iconElement)
      console.log(ico, savedIcon, overrides)
      node = makeIcon({ node, ...ico, className })
      console.log(node)
      const mainPaneContainer = document.querySelector('atom-workspace-axis.vertical')
      let update        = () => updateMargin(mainPaneContainer, el)

      node.addEventListener('click', update)
      console.log("NODE PARENT", node.parentElement, parentElement, el)
      if (!node.parentElement) {
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
