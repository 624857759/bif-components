import redux from '@obsidians/redux'
import networks from './networks'
import React from 'react'
import notification from '@obsidians/notification'

export default class BrowserExtension {
  static getNotInstallMsg  () {
    return '未监测到星火链插件钱包！'
  }

  static Init(networkManager) {
    if (window.bifWallet) {
      return new BrowserExtension(networkManager, window.bifWallet)
    }
  }

  constructor(networkManager, bifWallet) {
    this.name = 'bifWallet'
    this.networkManager = networkManager
    this._accounts = []
    this._enabled = true
    this.bifWallet = bifWallet
  }

  get isEnabled() {
    return this._enabled
  }

  get currentAccount() {
    return this.ethereum.selectedAddress
  }

  get allAccounts() {
    return this._accounts
  }

  tryInit () {

  }

  auth() {
    return new Promise((resolve, reject) => {
      if (!window.bifWallet) {
        reject('wallet extension not install')
      } else {
        window.bifWallet.auth(({ code, data }) => {
          resolve(data.bid)
        })
      }
    });
  }

  async onChainChanged(chainId) {
    const state = redux.getState()
    const intChainId = parseInt(chainId)
    const network = networks.find(n => n.chainId === intChainId)
    const currentNetwork = networks.find(n => n.id === state.network)

    if (!currentNetwork || currentNetwork.chainId !== intChainId) {
      if (network) {
        this.networkManager.setNetwork(network, { force: true })
      }
      else {
        const chainList = state.chainList.toJS().networks
        const customChain = chainList.find(chain => chain.chainId === intChainId)
        if (customChain) {
          const rpc = customChain.rpc.find(rpc => rpc.indexOf("${INFURA_API_KEY}") === -1)
          if (rpc) {
            const option = {
              url: rpc,
              chainId: intChainId,
              name: customChain.name,
            }
            const customConfig = { url: rpc, option: JSON.stringify(option) }
            const currentCustomChain = state.customNetworks.toJS()
            let activeCustomNetworkChainId = null
            Object.values(currentCustomChain).forEach(network => {
              if (network && network.active) activeCustomNetworkChainId = network.chainId
            })
            if (activeCustomNetworkChainId !== intChainId) {
              redux.dispatch('MODIFY_CUSTOM_NETWORK', {
                name: customChain.name,
                option,
              })
              redux.dispatch('ACTIVE_CUSTOM_NETWORK', option)
              redux.dispatch('UPDATE_UI_STATE', { customNetworkOption: option })
              redux.dispatch('CHANGE_NETWORK_STATUS', true)
              this.networkManager.updateCustomNetwork(customConfig)
            }
          }
        }
      }
    }

  }

  getAllAccounts() {
    console.log(this.bifWallet)
  }

  async onAccountsChanged(accounts) {
    redux.dispatch('UPDATE_UI_STATE', { signer: accounts[0] })
  }
}