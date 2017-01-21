console.log describe
describe "Reduced Dark UI theme", ->
  beforeEach ->
    waitsForPromise ->
      atom.packages.activatePackage('reduced-dark-ui')

  it "allows to disable full-width tab sizing to be set via theme settings", ->
    expect(document.documentElement.getAttribute('theme-reduced-dark-ui-tabsizing')).toBe null

    atom.config.set('reduced-dark-ui.tabSizing', false)
    console.log "asd basd" 
    expect(document.documentElement.getAttribute('theme-reduced-dark-ui-tabsizing')).toBe 'nofullwidth'
