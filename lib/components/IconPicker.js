'use babel'

import { render } from 'react-dom'
import React, { Component } from 'react'
import { Button, Icon } from './base'
import { fetchIconLists } from '../core/icons'
// import { $, $$, SelectListView } from "atom-space-pen-views"


class IconPreviewAdapter {

  constructor() {
    let item = document.createElement('icon-picker')
    //let item = new SelectListView({ item })
    let modal = atom.workspace.addModalPanel({item})
    modal.hide()

    this.item = item
    this.modal = modal
    this.catalog = {}
    this.elements = {
      icons: [],
      sections: []
    }
    let com = <IconPicker adapter={this} />
    let comp = render(com, this.item)

    this.fetch =
      fetchIconLists(true)

    this.fetch.on('icons:loaded', function(data) {
      comp.updateCatalog(data)
    })
    this.onSelect = this.onSelect.bind(this)
    this.onSuccess = this.onSuccess.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }

  onSelect (e) {
    let existing = this.item.querySelector('.icon.selected')
    if (existing)
      existing.classList.remove('selected')
    e.target.classList.add('selected')
  }

  onSuccess (e, details) {
    // TODO: Return the value to the calling element id:11
    this.modal.hide()
    this.successCallback(e, details)
    return details
  }

  onCancel (e, details) {
    e.target.classList.add('selected')
    // TODO: Return the value to the calling element id:12
    this.modal.hide()
  }

  setupHandlers (options) {
    this.successCallback = (e, d) => options.onSuccess(e, d)
  }

  show () {
    this.modal.show()
  }

  hide () {
    this.modal.hide()
  }
}


export class IconPicker extends Component {

  constructor(props) {
    super(props)
    this.state = ({
      selection: null,
      catalog: {},
    })
  }

  renderList () {
    let { catalog, selection } = this.state
    let list = []

    for (let iconset in catalog) {

      let start = list.length
      for (let icon in catalog[iconset]) {

        //let unicode = iconset[icon]
        let el = this.getElementForIcon({iconset, icon})
        list.push(el)
      }

      let icons = list.splice(start)
      let sect = this.getElementForSection({iconset, icons})
      list.push(sect)
    }
    return list
  }

  getElementForSection ({iconset, icons}) {
    return (
      <section className={'list-nested-item icon-picker-set iconset ' + iconset} key={iconset}>
        <h3>{iconset}</h3>
        {icons}
      </section>
    )
  }

  getElementForIcon ({iconset, icon}) {
    return (
      <Icon
        key={iconset + '-' + icon}
        icon={icon}
        iconset={iconset}
        onClick={e=>this.select(e, {iconset, icon})}
      />
    )
  }

  updateCatalog (data) {
    let { catalog } = this.state
    catalog = { ...catalog, ...data }
    this.setState({ catalog })
  }

  select (e, selection) {
    let { adapter } = this.props
    this.setState({ selection })
    adapter.onSelect(e, selection)
    return selection
  }

  render () {
    let { adapter } = this.props
    let catalog = this.renderList()
    return (
      <catalog className='select-list catalog'>

        <header>
          Icon Picker
        </header>

        <main className='catalog-main'>
          {catalog}
        </main>

        <footer className='btn-toolbar'>

          <Button type='success' onClick={e=>adapter.onSuccess(e, this.state.selection)}>
            <Icon iconset='ion' icon='ios-checkmark-empty' />
            Select
          </Button>

          <Button type='error' onClick={e=>adapter.onCancel(e, this.state.selection)}>
            <Icon iconset='ion' icon='ios-close-empty' />
            Cancel
          </Button>

        </footer>
      </catalog>
    )
  }
}

let adapter
export const showModal = (options) => {

  if (adapter)
    adapter.setupHandlers(options)
  else
    adapter = new IconPreviewAdapter()
  adapter.show()
  if (options.onSuccess)
    adapter.successCallback = options.onSuccess
  return adapter
}

export default showModal
