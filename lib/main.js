

let pkg = require('../package.json')
let {configSchema: conf, name: rootNamespace} = pkg
const doc = document.documentElement
const htmlAttrName = rootNamespace + '-settings'


function namespace(name, dot=false) {
  let processed = dot ? name : name.replace(
    /([A-Z _+]+)/g,
    needle => '-' + needle.toLowerCase())

  console.log(processed)
  return ([rootNamespace, name].join(dot ? '.' : '-'))
}

class Theme {

  constructor (settings=[]) {
    this.settings = settings
    this.set = this.set.bind(this)
    this.listen = this.listen.bind(this)
  }

  activate (state) {
    console.log(state)
    atom.notifications.addInfo(JSON.stringify(["Activation state", state, this.settings]))

    for (let key in this.settings) {
      if (key in state)
        this.listen(key, state[key])

      else
        this.listen(key, this.settings[key].default)

    }
  }

  deactivate () {
    return JSON.serialize(this.settings)
  }

  listen (name, value=null) {
    console.log("Started listening to", namespace(name, true))

    if (value)
      this.set(name, value)

    return atom.config.observe(
      namespace(name, true),
      val => this.set(name, val)
    )
  }

  set (name, value=null) {
    let current = doc.getAttribute(htmlAttrName) || ''

    //name = namespace(name)
    if(!name)
      return

    let neu = current.split(' ')
    console.log(neu)
    neu = neu.filter(o => name !== o)
    console.log(neu)

    if(value)
      neu.push(name)
    console.log(current)
    console.log(neu)

    doc.setAttribute(htmlAttrName, neu.join(' '))
  }
}


let theme = new Theme(conf)


module.exports = {
  activate: state => theme.activate(state),
  deactivate: () => theme.deactivate(),
}