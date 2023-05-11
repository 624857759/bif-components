import Client from './Client'
import TxManager from './TxManager'

export default class Sdk {
  constructor({ url, chainId, explorer, utils, id }) {
    this.client = new Client({ url, explorer })
    this.txManager = new TxManager(this.client)
    this.utils = utils
    this.networkId = id
    this.url = url
    this.chainId = chainId
    this.explorer = explorer
    this.keypair = this.client.client.keypair
  }

  dispose() {
  }

  get txOptions() {
    return this.utils.txOptions
  }

  async isValidAddress(address) {
    return this.client.client.keypair.isAddress(address)
  }

  async latest() {
    return await this.client.latest()
  }

  async getTokens(address) {
    return this.client.client.account.getAccount(address)
  }

  contractFrom({ address, abi }) {
    console.log(arguments, 'contractFrom')
    return new Contract({ address, abi }, this.client)
  }

  async getTransferTransaction(...args) {
    return await this.txManager.getTransferTx(Contract, ...args)
  }

  async getDeployTransaction(...args) {
    return await this.txManager.getDeployTx(...args)
  }

  async estimate(arg) {
    return await this.txManager.estimate(arg)
  }

  sendTransaction(arg) {
    return this.txManager.sendTransaction(arg)
  }

  async getTransactions(address, page, size) {
    const result = await fetch(`${this.explorer}api/tx/account?address=${address}&start=1&pageSize=5`)
    const { data } = await result.json()
    const list = data.accTxList
    return {
      cursor: list.length ? list[0].index - 1 : '',
      data: list.reverse(),
    }
  }
}
