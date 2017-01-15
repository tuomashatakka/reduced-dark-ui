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
    }
    this.editor = null
    this.onChange = this.onChange.bind(this)
    this.props.adapter.then(data => {
      this.setState({ options: JSON.parse(data).items })
      console.log(this.state)
    })
  }

  onChange (mdl, e) {
    let { options } = this.state
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

  render () {

    let { results, term } = this.state
    return (
      <div>

        <atom-text-editor mini ref={ref => {

          if (!ref || this.editor)
            return

          this.editor = ref
          console.log(this);
          console.log(this.editor);

          let mdl = this.editor.getModel()
          mdl.onDidStopChanging(e => this.onChange(mdl, e))
          console.log(this.editor, mdl)
        }} />

        <output>
          {results.map(o => (
            <span className="token option">
              {o.family} ({o.category})
            </span>
          ))}
        </output>

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
