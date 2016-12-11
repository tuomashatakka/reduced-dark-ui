root = document.documentElement;

module.exports =
  activate: (state) ->
    atom.config.observe 'reduced-dark-ui.tabSizing', (noFullWidth) ->
      setTabSizing(noFullWidth)

  deactivate: ->
    unsetTabSizing()

setTabSizing = (noFullWidth) ->
  if (noFullWidth)
    unsetTabSizing()
  else
    root.setAttribute('reduced-dark-ui-tabsizing', "nofullwidth")

unsetTabSizing = ->
  root.removeAttribute('reduced-dark-ui-tabsizing')
