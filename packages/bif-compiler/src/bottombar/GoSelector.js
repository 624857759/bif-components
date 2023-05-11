import React from 'react'

import { DockerImageSelector } from '@obsidians/docker'
import { BaseProjectManager } from '@obsidians/workspace'
import compilerManager from '../compilerManager'

export default () => {
  const [selected, onSelected] = React.useState('')

  React.useEffect(BaseProjectManager.effect('settings:compilers.go', onSelected), [])

  let extraFlags = undefined
  if (process.env.OS_IS_MAC) {
    extraFlags = '--platform linux/amd64'
  }

  return (
    <DockerImageSelector
      channel={compilerManager.go}
      disableAutoSelection
      size='sm'
      icon='fas fa-hammer'
      title='Go'
      noneName='go'
      modalTitle='Go Manager'
      downloadingTitle='Downloading Go'
      extraFlags={extraFlags}
      selected={selected}
      onSelected={v => BaseProjectManager.instance.projectSettings?.set('compilers.go', v)}
    />
  )
}