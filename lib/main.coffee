root = document.documentElement;

module.exports =
  activate: (state) ->
    atom.config.observe 'reduced-atom-ui.tabSizing', (noFullWidth) ->
      setTabSizing(noFullWidth)

  deactivate: ->
    unsetTabSizing()

setTabSizing = (noFullWidth) ->
  if (noFullWidth)
    unsetTabSizing()
  else
    root.setAttribute('reduced-atom-ui-tabsizing', "nofullwidth")

unsetTabSizing = ->
  root.removeAttribute('reduced-atom-ui-tabsizing')
