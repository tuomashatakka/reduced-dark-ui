const doc = document.documentElement,
      PKG_NAME = 'reduced-dark-ui',
      SETTINGS = {
        TAB_SIZING: 'tabSizing',
      }


function getSettingName(name, delimiter='-') {
  return ([PKG_NAME, SETTINGS[name]].join(delimiter))
}

class Theme {

  constructor () {
    this.observableTabSizing = getSettingName('TAB_SIZING', '.'),
    this.tabSizing = getSettingName('TAB_SIZING'),

  }

  activate (state) {
    atom.config.observe(
      this.observableTabSizing,
      (val) => this.set(this.tabSizing, val)
    )
  }

  deactivate () {
    this.unset(this.tabSizing)
  }

  set (name, value=null) {
    if (!value)
      this.unset(name)
    else
      doc.setAttribute(name, value)
  }

  unset (name) {
    doc.removeAttribute(name)
  }
}

let theme = new Theme()

module.exports = {
  activate: state => theme.activate(state),
  deactivate: () => theme.deactivate(),
}
