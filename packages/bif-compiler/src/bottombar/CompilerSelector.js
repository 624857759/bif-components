import React from 'react'
import SolcSelector from './SolcSelector'
import CppSelector from './CppSelector'
import { DockerImageSelector } from '@obsidians/docker'
import { BaseProjectManager } from '@obsidians/workspace'
import compilerManager from '../compilerManager'

export default props => {
  const [language, onChangeLanguage] = React.useState('solidity')
  const [selected, onSelected] = React.useState('')
  
  React.useEffect(BaseProjectManager.effect('settings:language', onChangeLanguage), [])
  React.useEffect(BaseProjectManager.effect('settings:compilers.abi', onSelected), [])
  
  if (language === 'cpp') {
    return <CppSelector />
  } else if (language === 'solidity') {
    return <SolcSelector />
  } else if (language === 'go') {
    return <GoSelector />
  } else if (language === 'java') {
    return <MavenSelector />
  } else {
    return null
  }
}