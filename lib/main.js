

let pkg = require('../package.json')
let {configSchema: conf} = pkg
console.log(pkg)

const doc = document.documentElement,
      PKG_NAME = pkg.name,
      SETTINGS = {
        TAB_SIZING: conf.tabSizing,
        FIXED_TABS: conf.fixedTabBar,
      }


function getSettingName(name, delimiter='-') {
  return ([pkg.name, name].join(delimiter))
}

class Theme {

  constructor (settings=[]) {
    this.settings = settings
    console.log(this.settings)

    this.set = this.set.bind(this)
    this.unset = this.unset.bind(this)
    this.listen = this.listen.bind(this)
  }

  activate (state) {
    console.log(state)
    atom.notifications.addInfo(JSON.stringify(["Activation state", state]))
    for (let key in this.settings) {
      if (key in state)
        this.listen(key, state[key])
      else
        this.listen(key, this.settings[key].default)
    }
  }

  deactivate () {
    this.unset(this.tabSizing)
  }

  listen (name, value=null) {
    console.log("Started listening to", getSettingName(name, '.'))
    if (value)
      this.set(name, value)

    return atom.config.observe(
      getSettingName(name, '.'),
      val => {
        this.set(name, val)
      }
    )
  }

  set (name, value=null) {
    name = getSettingName(name)
    if(!name)
      return
    if (value) {
      doc.setAttribute(name, value)
    }
    else
      this.unset(name)
  }

  unset (name) {
    doc.setAttribute(name, false)
  }
}

let theme = new Theme(conf)


module.exports = {
  activate: state => theme.activate(state),
  deactivate: () => theme.deactivate(),
}
