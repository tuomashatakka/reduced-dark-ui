'use babel'

import { render } from 'react-dom'
import React, { Component } from 'react'
import { Button, Icon } from './base'
import { fetchIconLists } from '../core/icons'
// import { $, $$, SelectListView } from "atom-space-pen-views"


const styles = {
  title: {
    height: 'auto',
    position: 'absolute',
    zIndex: 100000,
    height: '6rem',
    lineHeight: '6rem',
    left: 0,
    right: 0,
    top: 0,
    padding: '0 2rem',
    fontSize: '3rem',
    fontWeight: '100',
  },
  list: {
    marginTop: '-1rem',
    paddingTop: '6rem',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  footer: {
    margin: '3rem 1rem 2rem',
  },
  section: {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'center',
    textAlign: 'center',
  },
  cell: {
    display: 'block',
    flex: '1 1 auto',
  },
}


class IconPreviewAdapter {

  constructor() {
    let item = document.createElement('icon-picker')
    //let item = new SelectListView({ item })
    let modal = atom.workspace.addModalPanel({item})

    this.item = item
    this.modal = modal
    this.catalog = {}
    this.elements = {
      icons: [],
      sections: []
    }

    this.fetch =
      fetchIconLists()
      .then(
      catalog => {

        this.catalog = catalog
        console.log(modal)
        render(
          <IconPicker adapter={this} /> ,
          this.item
        )

        return this.catalog
    })
  }
}


export default class IconPicker extends Component {

  constructor(props) {
    super(props)
    this.state = ({
      selection: null,
    })
  }

  renderList () {
    let { catalog } = this.props.adapter
    let { selection } = this.state
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
    let { section } = styles
    return (
      <li
        className={'list-nested-item icon-picker-set iconset ' + iconset}
        key={iconset}>

        <h3>
          {iconset}
        </h3>

        <ul
          className='list-group list-tree'
          style={section}>
          {icons}
        </ul>

      </li>
    )
  }

  getElementForIcon ({iconset, icon}) {
    let { cell } = styles
    return (
      <li
        key={iconset + '-' + icon}
        style={cell}
        className='list-item'
        onClick={e=>e.target.classList.add('selected')}>

        <Icon
          icon={icon}
          iconset={iconset}
        />

      </li>
    )
  }

  render () {
    let { title, list, footer } = styles
    let { adapter } = this.props
    let catalog = this.renderList()
    return (
      <icon-picker className='select-list'>

        <header style={title}>
          Icon Picker
        </header>

        <ul
          className='list-group list-tree catalog'
          style={list}>
          {catalog}
        </ul>

        <footer
          style={footer}
          className='btn-toolbar'>

          <Button
            type='success'
            onClick={()=>adapter.modal.hide()}>
            <Icon iconset='ion' icon='ios-checkmark-empty' />

            Select

          </Button>

          <Button
            type='error'
            onClick={()=>adapter.modal.hide()}>
            <Icon iconset='ion' icon='ios-close-empty' />

            Cancel

          </Button>

        </footer>
      </icon-picker>
    )
  }
}

let adapter = null
export const showModal = () => {
  let adapter = adapter || new IconPreviewAdapter()
  // adapter.modal.show()
  // let hideModal = () => {
  //   document.removeEventListener('click', hideModal) }
  // document.addEventListener('click', hideModal)
}
