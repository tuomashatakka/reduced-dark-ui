'use babel'

const getHaystack = () => ['ion', 'fa', 'icon']

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

export const getPanelIcon = (query) => {

  let match = false
  let icon = 'ios-close-empty'
  let iconset = 'icon'
  let haystack = getHaystack()

  let el = typeof query === 'object' ? query : document.querySelector(query)

  if (!el)
    return { iconset, icon }

  while (!match && haystack.length) {
    iconset = haystack.pop()
    match = el.querySelector('.' + iconset)

    if (!match)
      continue

    let cls = match.className
    let cond = new RegExp('\\s' + iconset + '-([\\w-]+)', 'gi')
    console.log("cond:", cond)
    let f = cls.replace(cond, (_, name) => {
      icon = name
      return _
    })
    console.log("replaced:", f)
    console.log(cls)
    console.log(icon)
  }

  console.log("I", match + 'ly found the icon', icon, 'of', iconset, 'in', query, ':0')
  return { iconset, icon }
}

export const setPanelIcons = (q='atom-panel.left') => {
  let panels = document.querySelectorAll(q)
  let className = 'display-icon'

  if (!panels)
    return

  panels.forEach(panel => {

    if (panel.firstChild.classList.contains(className))
      return

    let ico = makeIcon({
      ...getPanelIcon(panel),
      className })

    panel.insertBefore(ico, panel.firstChild)
  })
}
