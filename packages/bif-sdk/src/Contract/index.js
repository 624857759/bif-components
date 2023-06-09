import utils from '../utils'
import keypairManager from '@obsidians/keypair'
import redux from '@obsidians/redux'
import moment from 'moment'

export default class Contract {
	constructor ({ address, abi }, client) {
		this.address = address
		this.abi = abi
		this.client = client
		this.instance = this.client.client.contract
	}

	get chainId() {
		return this.client.chainId
	}

	async query(method, { json, obj, array }, override) {
		console.log(method, arguments)
		let args
		let result
		let input
		if (override.ext === 'js') {
			args = json
			input = JSON.stringify({
				method,
				params: json,
				abicode: override.abicode
			})
		} else {
			let returnType
			const action = override.abis.find(item => item.name === method)

			if (action) {
				returnType = action.outputs[0].type
			}
			args = obj
			input = JSON.stringify({
				function: `${method}(${Object.values(obj).map(item => item.type)})`,
				args: array.join(','),
				return: `returns(${returnType})`
			})
		}
		try {
			const params = {
				sourceAddress: override.from,
				contractAddress: this.address,
				input
			}
			console.log(params)
			result = await this.instance.contractQuery(params)
		} catch (e) {
			throw utils.parseError(e)
		}
		return this.parseResult(result, method)
	}

	async execute(method, { json, obj, array }, override) {
		console.log(method, arguments)
		let args
		let input
		if (override.ext === 'js' || override.ext === 'cpp') {
			args = json
			input = JSON.stringify({
				method,
				params: json
			})
		} else {
			args = obj
			input = JSON.stringify({
				function: `${method}(${Object.values(args).map(item => item.type)})`,
				args: array.join(',')
			})
		}

		const params = {
			sourceAddress: override.from,
			privateKey: await keypairManager.getSecret(override.from),
			contractAddress: this.address,
			ceilLedgerSeq: '',
			feeLimit: '320000000',
			remarks: 'contractInvoke',
			amount: '0',
			input,
			// domainId: '0'
		}
		console.log(params)
		const res = await this.instance.contractInvoke(params)
		const { success_count, errorCode, result } = res
		let hash = result.hash
		const { network, uiState } = redux.getState()
		const localNetwork = uiState.get('localNetwork')
		let networkId
		if (localNetwork) {
			networkId = localNetwork.params.id
		} else {
			networkId = network
		}
		// return 
		if (errorCode === 0) {
			
			let txSucceed = false
			let status = 'SUCCESS'
			let chain60s = 0
			while (chain60s < 60) {
				const chainRes = await this.client.client.transaction.getTransactionInfo({ hash })
				if (chainRes.errorCode === 0) {
					if (chainRes.result.transactions[0].error_code !== 0) {
						status = 'FAILED'
						chain60s = 60
						result.error_desc = chainRes.result.transactions[0].error_desc
					} else {
						hash = chainRes.result.transactions[0].hash
						chain60s = 60
					}
				} else {
					if (chainRes.result) {
						if (chainRes.result.transactions[0].error_desc) {
							status = 'FAILED'
							chain60s = 60
							result.error_desc = chainRes.result.transactions[0].error_desc
						} else {
							chain60s++
						}
					}
				}
			}

			redux.dispatch('ADD_TRANSACTION', {
				network: networkId, tx: {
					data: {
						address: override.from,
						confirmed: undefined,
						name: method,
						params: json,
						receipt: undefined,
						signer: override.from,
						title: method,
					},
					status: status,
					ts: moment().unix(),
					txHash: result.hash
				}
			})
			return result
		} else {
			console.log(res)
			redux.dispatch('ADD_TRANSACTION', {
				network: networkId, tx: {
					data: {
						address: override.from,
						confirmed: undefined,
						name: method,
						params: json,
						receipt: undefined,
						signer: override.from,
						title: method,
					},
					status: 'FAILED',
					ts: moment().unix(),
					... result.hash ? {
						txHash: result.hash
					}: {}
				}
			})
			throw new Error(res.errorDesc)
		}
	}

	parseResult(result, method) {
		return {
			raw: result,
			parsed: [],
		}
	}

	get maxGap() {
		return this.chainId === 1029 ? 100 : 1000
	}

	async getLogs(event, { from, to } = {}) {
		const logs = await this.instance[event.name]
			.call(...new Array(event.inputs.length).fill(null))
			.getLogs({ fromEpoch: from, toEpoch: to })
		return logs.map(item => {
			item.blockNumber = item.epochNumber
			item.args = item.arguments
			return item
		})
	}
}
