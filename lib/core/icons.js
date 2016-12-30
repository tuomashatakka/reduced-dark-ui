'use babel'

const getHaystack = () => ['ion', 'fa', 'icon']
const ICON_CLASS_NAME = 'display-icon'

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

const getIcons = (icon=null) => {
  // Return all icons if no icon is specified
  let descriptor = 'reduced-dark-ui.icons'
  let icons = atom.config.get(descriptor) || {}
  return icon === null ? icons : icons[icon] || null
}

const updateIcons = (payload) => {
  let icons = atom.config.get('reduced-dark-ui.icons') || {}
  if (payload instanceof Object)
    icons = Object.assign(icons, payload)
  return atom.config.set('reduced-dark-ui.icons', icons)
}

export {
  getHaystack,
  makeIcon,
  getIcons,
  updateIcons,

  ICON_CLASS_NAME
}
