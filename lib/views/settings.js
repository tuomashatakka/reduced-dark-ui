'use babel'
import React, { Component, prop as PropTypes } from 'react'
import { formatTitle } from '../utils'
import { render } from 'react-dom'
import { Icon } from '../components/base'

/**
 * @class TabbedView
 * @extends React.Component
 */
export default class TabbedView extends Component {


  constructor (props) {
    super(props)
    this.state = {
      tab: 0,
    }
    console.log(props.children[0])
    this.renderTab = this.renderTab.bind(this)
    this.renderContent = this.renderContent.bind(this)
  }

  renderTab (el, key) {
    let { tab } = this.state
    let { title } = el.props
    let active = (tab === key || tab === title) ? 'active' : 'inactive'

    return (
      <li
        onClick={e => this.setState({ tab: title })}
        key={key}
        className={`${active} tab`}>
        {title}
      </li>
    )
  }

  renderContent () {
    let { tab } = this.state
    let { children } = this.props
    let title, gchildren, icon
    let el = children.find(
      o => o.props.title === tab)

    if (!el && children.length)
      el = children[0]

    if (el && el.props)
      ({ icon, title, gchildren: children } = el.props)

    return (
      <section className='section displayed-item'>

        <header className="section-heading">
          <Icon icon={icon} />
          <h2>{title}</h2>
        </header>

        <main className="section-body">
          {el}
        </main>

      </section>
    )
  }

  render () {
    let { children } = this.props
    let { tab } = this.state
    let content = this.renderContent()
    let tabs = children.map(this.renderTab)

    return (
      <section className="section panels-item" tabindex="0">

        <ul className='list-inline tab-bar'>
          {tabs}
        </ul>

        {content}

      </section>
    )
  }

}


export const addTabView = (el) => render(

<TabbedView>
  <div title='layout' icon='ios-browsers'>askokodaskokodaskokodaskokodaskokodaskokodaskokod</div>
  <div title='colors' icon='ios-color-filter-outline'>basd</div>
  <div title='icons' icon='ios-pricetag'>lasd</div>
  <div title='environment' icon='ios-settings'>hajdasd</div>
</TabbedView>, el)


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
