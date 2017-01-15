'use babel'

import { render } from 'react-dom'
import React, { Component } from 'react'
import { Button, Icon } from './base'
import { fetchIconLists } from '../core/icons'
import { getFontData } from '../core/fonts'
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
    this.onChange = this.onChange.bind(this)
    this.setValue = this.setValue.bind(this)
    this.getIndex = this.getIndex.bind(this)
    this.props.adapter.then(data => {
      this.setState({ options: JSON.parse(data).items })
      console.log(this.state)
    })
  }

  onChange (e) {
    let { options } = this.state
    let mdl = this.editor.getModel()
    let term = mdl.getText()

    if (options) {
      let reg = new RegExp(term, 'i')
      let results = options.filter(o =>
        o.family.search(reg) !== -1 ||
        o.category.search(reg) !== -1 ||
        o.variants.indexOf(term) !== -1
      )
      this.setState({ term, results })
    }
    console.log(term)
  }

  setValue(index) {
    if (!index) {
      this.setState({ selected: null })
      return
    }
    let { options } = this.state
    let mdl = this.editor.getModel()
    mdl.setText(options[index].family)
    this.setState({ selected: index })
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


export default function queryField (options) {
  let { element } = options
  let container = document.createElement('div')
  let adapter = getFontData()
  console.log(adapter);

  return render(
    <QueryField
      container={container}
      adapter={adapter}/>,
    element.parentElement.appendChild(container)
  )
}