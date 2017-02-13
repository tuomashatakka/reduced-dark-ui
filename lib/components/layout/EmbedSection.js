'use babel'
import React, { Component, prop as PropTypes } from 'react'
import Field from './Field'


/**
 * @class Section
 * @extends React.Component
 */
export default class Section extends Component {

  render () {
    let { title, description, icon, content, scope } = this.props

    return (
      <section

        className='section padded'
        title={title}
        icon={icon}
        key={scope}>

        { title ? <header className='section-heading'>
          <h1>{title}</h1>
         {description ? <em>{description}</em> : null}
        </header> : null }

        <div
         className='section-body'
         ref={el => el && content && el.appendChild(content)} />
      </section>

    )
  }
}
