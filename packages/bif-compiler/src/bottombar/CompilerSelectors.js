import React from 'react'

// import { TruffleSelector } from '@obsidians/eth-compiler'

import compilerManager from '../compilerManager'
import CompilerSelector from './CompilerSelector'

export default props => {
  if (props.author === 'local') {
    return <CompilerSelector solc={compilerManager.bif} />
  }

  return <CompilerSelector remote solc={compilerManager.bif} />
}
