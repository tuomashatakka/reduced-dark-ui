'use babel'


// Debug utilities
export const devs = () => {
    let name='reduced-dark-ui'

    window.reloadTheme = (name='reduced-dark-ui') => {
      let pack = window.pack = atom.packages.getLoadedPackage(name)
      pack.deactivate().then(
        () =>
        pack.unload().then(
          () =>
          pack.load().then(
            () => pack.activate()
          )
        )
      )
    }
    window.reloadThemeDelay = (name='reduced-dark-ui', d=300) => {
      atom.packages.deactivatePackage(name)
      return new Promise (ok => setTimeout(()=>{
        let n = 0
        while('reduced-dark-ui' in atom.packages.activePackages) {
          n++
          if (n > 5000)
            break
        }
        console.log(n, "ticks");
        atom.packages.activatePackage(name).then(ok)
      }, d))
    }

    window.overwriteSettingsView = () => {
      try {

        atom.workspace.open('atom://config')
        .then(view => {
          let el = view.element ||
            document.querySelector('.settings-view')
          addTabView(el)
        })
      } catch (e) {}
    }

    window.addCallbackToActiveEditor = (callback) => {
      window.pack = atom.packages.getLoadedPackage('reduced-dark-ui')
      let x = atom.workspace.getActivePane()
      let y = atom.workspace.getActiveTextEditor()

      let subscr = y.onDidSave(callback)
      pack.onDidDeactivate(()=>subscr.dispose())
    }

    // atom.packages.onDidActivatePackage(pkg=>autobind(pkg))
    window.autobind = () => {
      let callback = window.overwriteSettingsView
      window.addCallbackToActiveEditor(callback)
    }

}
