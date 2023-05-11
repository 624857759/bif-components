import React from 'react'

import { DockerImageSelector } from '@obsidians/docker'
import { BaseProjectManager } from '@obsidians/workspace'
import compilerManager from '../compilerManager'

export default () => {
  const [selected, onSelected] = React.useState('')
  console.log(BaseProjectManager.instance)
  React.useEffect(BaseProjectManager.effect('settings:compilers.caictdevelop/bif-solidity', onSelected), [])

  return (
    <DockerImageSelector
      channel={compilerManager.bif}
      disableAutoSelection
      size='sm'
      icon='fas fa-hammer'
      title='Solc'
      noneName='solc'
      noManager
      modalTitle='Solc Manager'
      downloadingTitle='Downloading Solc'
      selected={selected}
      onSelected={v => BaseProjectManager.instance?.projectSettings?.set('compilers.caictdevelop/bif-solidity', v)}
    />
  )
}