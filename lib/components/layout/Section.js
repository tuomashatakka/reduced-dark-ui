'use babel'
import React, { Component, prop as PropTypes } from 'react'
import Field from './Field'


/**
 * @class Section
 * @extends React.Component
 */
export default class Section extends Component {

  render () {
    let { icon, scope } = this.props
    let { properties, title, description } = atom.config.getSchema(scope) || {}
    let sections
    if (properties)
      sections = Object.keys(properties)
    else
      sections = atom.config.get(scope).properties

    return (

      <section
        title={title}
        icon={icon}
        key={scope}
        ref={el => el && content && el.appendChild(content)}
        className='section padded'>

        <header className='section-heading'>
          <h1>{title}</h1>
          <em>{description}</em>
        </header>

        <div className='section-body'>
        {
          sections.map(sub => {

            let key = `${scope}.${sub}`
            let props = { key, scope: key }
            if (properties[sub].properties)
              return <Section icon='ios-arrow-right' {...props} />
            else
              return <Field {...props} />
          })
        }
        </div>
      </section>

    )
  }
}
