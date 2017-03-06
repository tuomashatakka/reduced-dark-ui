


describe "Initial loading for the UI theme package Reduced Dark", ->
  beforeEach ->
    waitsForPromise ->
      atom.packages.activatePackage('settings-view')

    waitsForPromise ->
      atom.packages.activatePackage('reduced-dark-ui')


  it "activates correctly", ->
    pack = atom.packages.getActivePackage('reduced-dark-ui')
    console.log pack
    console.log pack.mainModulePath
    console.log pack.mainModule.subscriptions
    console.log pack.mainModule.Theme
    expect(pack.name).toBe 'reduced-dark-ui'
    # expect(pack.mainModule.name).toBe 'reduced-dark-ui'

  it "loads the stylesheet files", ->
    pack = atom.packages.getActivePackage('reduced-dark-ui')
