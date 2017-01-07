'use babel'
import glob from 'glob'
import { rootNamespace } from '../utils'

const ICON_CLASS_NAME = 'display-icon'
const getHaystack = () =>
  ['ion', 'fa', 'icon']


/**
 * Walks the DOM for the given HTML node until one of the haystack's
 * classes is found. Returns the found icon's name and icon set
 * @method findElementIcon
 * @param  {HTMLNode}      el    HTML element to search the icon in
 * @return {Object}              An object containing the found icon and its
 *                               iconset. If no icon is found, returns the
 *                               defaults defined in the beginning of the
 *                               function
 */
export const findElementIcon = (el) => {

  let match = false
  let icon = 'ios-close-empty'
  let iconset = 'icon'
  let haystack = getHaystack()

  if (!el)
    return { iconset, icon }

  while (!match && haystack.length) {
    iconset = haystack.pop()
    match = el.querySelector('.' + iconset)

    if (!match)
      continue

    let cls = match.className || ""
    let cond = new RegExp('\\s' + iconset + '-([\\w-]+)', 'gi')

    cls.replace(cond, (_, name) => {
      icon = name
      return _
    })
  }

  return { iconset, icon }
}


const makeIcon = ({ iconset, icon, className }) => {
  let el = document.createElement('span')

  className = [
    iconset,
    iconset + '-' + icon,
    className ]
    .join(' ')

  el.setAttribute(
    'class',
    className )

  return el
}


let iconCache = {}
const getIcons = (icon=null) => {
  // Return all icons if no icon is specified
  let descriptor = 'reduced-dark-ui.icons'
  let icons

  if (!iconCache.length || (icon && !iconCache[icon])) {
    icons = atom.config.get(descriptor) || {}
    iconCache = {iconCache, ...icons}}

  else
    icons = {...iconCache}

  return icon === null ?
    icons :
    icons[icon] ||
    null
}


const updateIcons = (payload) => {
  let icons = iconCache = atom.config.get('reduced-dark-ui.icons') || {}

  if (payload instanceof Object)
    icons = Object.assign(icons, payload)

  return atom.config.set('reduced-dark-ui.icons', icons)
}


const clearIcons = () => {
  atom.config.set('reduced-dark-ui.icons', {})
}


const fetchIconLists = () => {
  let catalog = {},
      pack = atom.packages.getLoadedPackage(rootNamespace),
      onPathsResolved = (response) => {
        for (let path of response) {

          let key, test = /.*?\/([\w]+)\.json/,
              assign = (_, name) => key = name
          // Resolve the icon package name. The
          // replace function name is misleading
          // since its return value is simply ignored
          path.replace(test, assign)
          catalog[key] = require(path)
        }
        return catalog
  }

  return new Promise( (resolve, reject) => {

    // Resolve the promise on glob search results
    glob(
      pack.path + '/assets/iconsets/**/*.json',
      (_, res) => resolve(onPathsResolved(res)))
  })
}


export {
  getHaystack,
  makeIcon,
  getIcons,
  updateIcons,
  clearIcons,
  fetchIconLists,
  ICON_CLASS_NAME,
}
