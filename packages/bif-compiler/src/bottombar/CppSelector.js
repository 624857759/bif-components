import React from 'react'

import { DockerImageSelector } from '@obsidians/docker'
import { BaseProjectManager } from '@obsidians/workspace'
import compilerManager from '../compilerManager'

export default () => {
  const [selected, onSelected] = React.useState('')

  React.useEffect(BaseProjectManager.effect(`settings:compilers.abi`, onSelected), [])
  console.log(BaseProjectManager.instance.projectSettings)
  return (
    <>
      <DockerImageSelector
        channel={compilerManager.cdt}
        // disableAutoSelection
        size='sm'
        icon='fas fa-hammer'
        title='bif-cdt'
        noneName='bif-cdt'
        noManager
        // downloadingTitle={`Downloading Xdev`}
        selected={selected}
        onSelected={v => BaseProjectManager.instance.projectSettings?.set(`compilers.cdt`, v)}
      />
      <DockerImageSelector
        channel={compilerManager.abi}
        // disableAutoSelection
        size='sm'
        icon='fas fa-hammer'
        title='bif-abi'
        noneName='bit-abi'
        noManager
        // downloadingTitle={`Downloading Xdev`}
        selected={selected}
        onSelected={v => BaseProjectManager.instance.projectSettings?.set(`compilers.abi`, v)}
      />
    </>
  )
}