'use babel'

import { render } from 'react-dom'
import React, { Component, PropTypes } from 'react'
import { getFontData } from '../core/fonts'
import { throttle } from 'underscore'
// import { $, $$, SelectListView } from "atom-space-pen-views"


export class QueryField extends Component {

  constructor (props) {
    super(props)
    this.state = {
      term: "",
      results: ["kakke", "pisse"],
      selected: null,
      options: [],
    }
    this.editor = null
    this.onChange = throttle(this.onChange.bind(this), 1000)
    this.setValue = this.setValue.bind(this)
    this.getIndex = this.getIndex.bind(this)
    this.setOptions = this.setOptions.bind(this)
    if (this.props.adapter)
      this.props.adapter.then(data => this.setOptions(data.google))
  }

  setOptions (options) {
    this.setState({ options })
  }
  onChange (e) {
    let { options } = this.state
    let mdl = this.editor.getModel()
    let term = mdl.getText().trim().split(/\s/)

    if (options) {
      let reg = new RegExp(term.join('|'), 'gi')
      let results = options.filter(o =>
        o.family.search(reg) !== -1 ||
        o.category.search(reg) !== -1 ||
        o.variants.indexOf(term) !== -1
      )
      this.setState({ term, results })
    }
    if (term.length)
      this.setValue(term.join(" "))
  }

  setValue(index) {
    let { options, selected } = this.state
    let { onUpdate } = this.props
    let text
    console.log(index, onUpdate, options, selected)
    if (index && isNaN(parseInt(index))) {
      if (onUpdate)
        onUpdate(index.replace(',', ' ').trim())
      return index
    }
    else
      text = options[index].family
    let mdl = this.editor.getModel()

    mdl.setText(text)
    this.setState({ selected: index })

    if (onUpdate)
      onUpdate(text.replace(',', ' ').trim())
  }

  getIndex(query) {
    let { options } = this.state
    if (!options || !query)
      return -1
    return options.findIndex(o => o.family == query)
  }

  render () {

    let { results, term, selected } = this.state
    return (
      <div className='select-list popover-list'>

        <atom-text-editor mini ref={ref => {

          if (!ref || this.editor)
            return

          this.editor = ref
          let mdl = this.editor.getModel()
          mdl.setText(this.props.initialValue)
          mdl.onDidStopChanging(e => this.onChange(e))

        }} />

        <ol className='list-group'>

          {
            results.map((o, n) => {
            let { family, category } = o
            let index = this.getIndex(family)
            let active = (selected >= 0 && index == selected)

            return (
              <li
                key={n}
                className={"token option" + (active ? " selected" : "")}
                onClick={() => this.setValue(index)}>
                {
                  active ?
                  <strong className='inline-block'>{family}</strong> :
                  <span className='inline-block'>{family}</span>
                }
                <span className="inline-block text-subtle">{category}</span>
              </li>
            )
          })}

        </ol>
      </div>
    )
  }

}


QueryField.propTypes = {
  adapter: PropTypes.object,
  initialValue: PropTypes.string,
  onUpdate: PropTypes.function,
}

export default function queryField ({ element }) {
  let container = document.createElement('div')
  let adapter = getFontData()

  return render(
    <QueryField
      initialValue={element.getModel().getText()}
      onUpdate={val => element.getModel().setText(val)}
      container={container}
      adapter={adapter}/>,
    element.parentElement.appendChild(container)
  )
}
