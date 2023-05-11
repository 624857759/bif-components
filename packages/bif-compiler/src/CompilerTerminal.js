import React, { PureComponent } from 'react'

import Terminal from '@obsidians/terminal'

import compilerManager from './compilerManager'

export default class CompilerTerminal extends PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    const { active, cwd } = this.props

    return (
      <Terminal
        ref={ref => (compilerManager.terminal = ref)}
        active={active}
        cwd={cwd}
        logId='compiler-project'
        input
      />
    )
  }
}