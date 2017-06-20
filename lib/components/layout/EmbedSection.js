'use babel'
import React, { Component, prop as PropTypes } from 'react'
import Field from './Field'


/**
 * @class Section
 * @extends React.Component
 */
export default class Section extends Component {

  render () {
    let { description, content, scope } = this.props

    return (
      <section className='section padded' key={scope}>

       {description ? <div className='settings-description'>{description}</div> : null}

        <div
         className='section-body'
         ref={el => el && content && [...el.children].map(child => child.remove()) && el.appendChild(content)} />
      </section>

    )
  }
}
