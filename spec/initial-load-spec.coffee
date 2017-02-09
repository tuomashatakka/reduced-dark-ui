pack        = atom.packages.activatePackage('reduced-dark-ui')
activate    = new Promise((resolve, reject) ->
  pack.then ->
    p = atom.packages.getActivePackage('reduced-dark-ui')
    console.log(pack,p )
    theme   = new p.mainModule.Theme('reduced-dark-ui')
    theme.activate()
    setTimeout(resolve, 1500)
    pack
)


describe "Initial loading for the UI theme package Reduced Dark", ->
  beforeEach ->
    waitsForPromise ->
      activate


  it "activates correctly", ->
    pack = atom.packages.getActivePackage('reduced-dark-ui')
    console.log pack
    console.log pack.mainModulePath
    console.log pack.mainModule.subscriptions
    console.log pack.mainModule.Theme
    expect(pack.name).toBe 'reduced-dark-ui'
    # expect(pack.mainModule.name).toBe 'reduced-dark-ui'
    expect(pack.mainModule.Theme.constructor.name).toBe 'Object'


  it "loads the stylesheet files", ->
    pack = atom.packages.getActivePackage('reduced-dark-ui')
