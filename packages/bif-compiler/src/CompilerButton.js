import React, { PureComponent } from 'react'

import {
  Button,
  UncontrolledTooltip
} from '@obsidians/ui-components'

import compilerManager from './compilerManager'

export default class CompilerButton extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      building: false
    }
  }

  componentDidMount () {
    compilerManager.button = this
  }

  onClick = () => {
    if (this.state.building) {
      compilerManager.stop()
    } else if (this.props.onClick) {
      this.props.onClick()
    } else {
      compilerManager.build({})
    }
  }

  render () {
    const {
      className,
      size = 'sm',
      color = 'default',
    } = this.props

    let icon = <span key='build-icon'><i className='fas fa-hammer' /></span>
    if (this.state.building) {
      icon = (
        <React.Fragment>
          <span key='building-icon' className='hover-hide'><i className='fas fa-spinner fa-spin' /></span>
          <span key='stop-build-icon' className='hover-show'><i className='fas fa-stop-circle' /></span>
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        <Button
          color={color}
          size={size}
          id='tooltip-build-btn'
          key='tooltip-build-btn'
          className={`hover-block ${className}`}
          onClick={this.onClick}
        >
          {icon}
        </Button>
        <UncontrolledTooltip trigger='hover' delay={0} placement='bottom' target='tooltip-build-btn'>
          { this.state.building ? '停止编译' : `开始编译`}
        </UncontrolledTooltip>
      </React.Fragment>
    )
  }
}