
import { makeSdk } from '@obsidians/eth-sdk'

import kp from './kp'
import networks from './networks'
import BrowserExtension from './BrowserExtension'
import Client from './Client'
import Contract from './Contract'
import TxManager from './TxManager'
import utils from './utils'

export default makeSdk({
  kp,
  networks,
  namedContracts: {},
  Client,
  Contract,
  TxManager,
  BrowserExtension,
  utils,
})

export { default as utils } from './utils'
export { default as redux } from './redux'