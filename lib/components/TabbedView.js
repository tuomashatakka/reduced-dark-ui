'use babel'
import React, { Component } from 'react'
import { formatTitle } from '../utils'
import { Icon } from '../components/base'

/**
 * @class TabbedView
 * @extends React.Component
 */
export default class TabbedView extends Component {


  constructor (props) {
    super(props)
    this.getTab = this.getTab.bind(this)
    this.renderTab = this.renderTab.bind(this)
    this.renderContent = this.renderContent.bind(this)
    this.state = {
      tab: 0,
    }
  }

  getTab (tab) {
    let { children } = this.props
    let el

    if (!(tab > -1))
      tab = this.state.tab

    if (children.find)
      el = children.find(
        o => o.props.title === tab)

    if (el)
      return el

    if (!children.length)
      return children

    if(isNaN(parseInt(tab)))
      return children[0]
    return children[tab]
  }

  renderTab (el, key=0) {

    // let { title } = el.props
    let { tab } = this.state
    let { props } = this.getTab(key)
    let { icon, title } = props

    let active = (tab === key || tab === title) ? 'active' : 'inactive'

    return (
      <li
        onClick={() => this.setState({ tab: title })}
        key={key}
        className={`${active} tab`}>

        <Icon icon={icon} iconset='ion' />
        {title}

      </li>
    )
  }

  renderContent () {

    let el = this.getTab() || {}
    let { icon, title, type } = el.props
    type = type || 'general'

    return (
      <section className={`config-${type} section displayed-item`}>

        <header className="section-heading">
          <h2>
            <Icon icon={icon} iconset='ion' />
            {formatTitle(title)}
          </h2>
        </header>

        <main className={`${type}-package-view section-body`}>
          {el}
        </main>

      </section>
    )
  }

  render () {
    let { children } = this.props || [],
      content = this.renderContent(),
      tabs = children.map ? children.map(this.renderTab) : this.renderTab(children)

    return (
      <section className="section panels-item" tabIndex="0">

        <ul className='list-inline inline-tabs tab-bar'>
          {tabs}
        </ul>

        {content}

      </section>
    )
  }

}
