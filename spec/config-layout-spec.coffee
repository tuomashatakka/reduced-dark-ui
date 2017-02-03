domattr = (name) -> document.documentElement.getAttribute(name)

describe "Reduced Dark UI configuration", ->
  beforeEach ->
    waitsForPromise ->
      atom.packages.activatePackage('reduced-dark-ui')

  it "scales the ui correctly", ->
    attr = 'uiscale'

    # Default value
    expect(domattr(attr)).toBe '100'

    # Invalid value
    atom.config.set('reduced-dark-ui.layout.uiScale', false)
    expect(domattr(attr)).toBe '100'

    # Minimum boundary
    atom.config.set('reduced-dark-ui.layout.uiScale', 10)
    expect(domattr(attr)).toBe '40'

    # Maximum boundary
    atom.config.set('reduced-dark-ui.layout.uiScale', 210)
    expect(domattr(attr)).toBe '150'

    # Regular case
    atom.config.set('reduced-dark-ui.layout.uiScale', 105)
    expect(domattr(attr)).toBe '105'

  it "adjusts the layout spacing correctly", ->
    attr = 'spacing'

    # Default value
    expect(domattr(attr)).toBe '100'

    # Invalid value
    atom.config.set('reduced-dark-ui.layout.spacing', false)
    expect(domattr(attr)).toBe '100'

    # Minimum boundary
    atom.config.set('reduced-dark-ui.layout.spacing', 10)
    expect(domattr(attr)).toBe '50'

    # Maximum boundary
    atom.config.set('reduced-dark-ui.layout.spacing', 210)
    expect(domattr(attr)).toBe '150'

    # Regular case
    atom.config.set('reduced-dark-ui.layout.spacing', 105)
    expect(domattr(attr)).toBe '105'
