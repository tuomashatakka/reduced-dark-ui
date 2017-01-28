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
    this.renderTab = this.renderTab.bind(this)
    this.renderContent = this.renderContent.bind(this)

    this.state = {
      tab: 0,
    }
  }

  renderTab (el, key) {

    let { tab } = this.state
    let { title } = el.props
    let active = (tab === key || tab === title) ? 'active' : 'inactive'

    return (
      <li
        onClick={() => this.setState({ tab: title })}
        key={key}
        className={`${active} tab`}>
        {title}
      </li>
    )
  }

  renderContent () {

    let { tab } = this.state
    let { children } = this.props
    let el = children.find(
      o => o.props.title === tab)

    if (!el && children.length)
      el = children[0]

    let { props } = el
    let { icon, title } = props

    return (
      <section className='section displayed-item'>

        <header className="section-heading">
          <Icon icon={icon} />
          <h2>{formatTitle(title)}</h2>
        </header>

        <main className="section-body">
          {el}
        </main>

      </section>
    )
  }

  render () {
    let { children } = this.props
    let content = this.renderContent()
    let tabs = children.map(this.renderTab)

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
