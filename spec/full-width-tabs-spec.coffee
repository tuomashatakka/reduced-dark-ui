describe "Reduced Dark UI configuration", ->
  beforeEach ->
    waitsForPromise ->
      atom.packages.activatePackage('reduced-dark-ui')

  it "scales the ui correctly", ->

    # Default value
    expect(document.documentElement.getAttribute('reduced-dark-ui-uiscale')).toBe '100'

    # Invalid value
    atom.config.set('reduced-dark-ui.layout.uiScale', false)
    expect(document.documentElement.getAttribute('reduced-dark-ui-uiscale')).toBe '100'

    # Minimum boundary
    atom.config.set('reduced-dark-ui.layout.uiScale', 10)
    expect(document.documentElement.getAttribute('reduced-dark-ui-uiscale')).toBe '25'

    # Maximum boundary
    atom.config.set('reduced-dark-ui.layout.uiScale', 210)
    expect(document.documentElement.getAttribute('reduced-dark-ui-uiscale')).toBe '200'

    # Regular case
    atom.config.set('reduced-dark-ui.layout.uiScale', 105)
    expect(document.documentElement.getAttribute('reduced-dark-ui-uiscale')).toBe '105'
