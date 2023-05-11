import utils from '../utils'
import { TransferTx, ContractTx } from './Tx'

import signatureProvider from './signatureProvider'
import ERC20 from '../redux/abi/ERC20.json'

export default class BifTxManager {
  constructor (client) {
    this.client = client
  }

	async getTransferTx(Contract, { from, to, token, amount }, override) {
		if (token === 'core' || !token) {
			const value = utils.unit.toValue(amount)
			return new TransferTx(this.client, { from, to, value, ...override })
		} else {
			const value = utils.unit.toValue(amount)
			const contract = new Contract({ address: token.address, abi: ERC20 }, this.client)
			return contract.execute('transfer', { array: [to, value] }, { ...override, from})
		}
	}

	async getDeployTx({ abi, bytecode, amount, parameters, ...restProps }, override) {
		return new ContractTx(this.client, { abi, bytecode, amount, parameters, ...restProps }, null, override)
	}

	async estimate(tx) {
		const gasPrice = await this.client.callRpc('cfx_gasPrice', [])
		const result = await tx.estimate({ from: tx.from })
		return {
			gas: result.gasLimit && result.gasLimit.toString() || '',
			gasPrice: BigInt(gasPrice).toString(10),
			storageLimit: result.storageCollateralized && result.storageCollateralized.toString() || ''
		}
	}

	sendTransaction(tx) {
		console.log(tx, 'tx')
		if(tx.send) {
			return tx.send()
		}
	}
}