import platform from '@obsidians/platform'
import { IpcChannel } from '@obsidians/ipc'
import utils from './utils'

export default class BIFClient {
	constructor(option) {
		const { networkId, explorer, url } = option;
		this.networkId = networkId;
		this.explorer = explorer || 'http://test-explorer.bitfactory.cn';

		this.client = window.BIFCoreSDK && new window.BIFCoreSDK({
			host: url,
		});
		this.jslint = window.jslint

		window.bifSDK = this.client;

		if (platform.isDesktop) {
			this.channel = new IpcChannel('sdk')
			this.channel.invoke('setNetwork', option)
		} else {
			this.channel = new IpcChannel()
		}
	}

	get url() {
		if (this.client) {
			return this.client.block.host
		}
	}

	async checkAddress(addr) {
		return window.bifSDK.keypair.isAddress(addr)
	}

	async sendTransaction() {

	}

	async getTransactions(address, start, pageSize) {
		const result = await fetch(`${this.explorer}/api/tx/account?address=${address}&start=${start + 1}&pageSize=${pageSize}`)
		const { data } = await result.json()

		return {
			list: data.accTxList.map(item => ({
				timeStamp: item.txTime / 1000,
				hash: item.txHash,
				from: item.fromAddress,
				to: item.toAddress,
				gasFee: item.fee,
				blockNumber: item.ledgerSeq,
				value: item.amount,
				txStatus: item.txStatus
			})),
			total: data.page.pageTotal
		}
	}

	async getTokenInfo(address) {
		if (!this.explorer) {
			return
		}
	}

	async getAccount(address) {
		const result = await fetch(`${this.explorer}/api/account/${address}
		?id=undefined`)
		const { data } = await result.json()
		return {
			address: utils.formatAddress(address),
			balance: data.balance ? utils.unit.fromValue(data.balance) : 0,
			nonce: data.nonce ? data.nonce.toString() : 0,
			codeHash: data.metadatasHash || utils.formatAddress(address),
			...data
		}
	}

	async networkInfo() {
		return await this.getStatus()
	}

	async getStatus() {
		return this.client.block.getBlockLatestInfo()
	}

	async getTokens(address) {
		return []
	}

	async latest() {
		const status = await this.getStatus()
		return status.latestState
	}

	async checkContractAddress(hash) {
		let i = 0;
		return new Promise((resolve, reject) => {
			const timer = setInterval(async () => {
				if (i === 60) {
					clearInterval(timer)
					reject('操作请求超时，请重试...')
				}
				try {
					const res = await this.client.transaction.getTransactionInfo({
						hash,
					})
					if (res.errorCode === 0) {
						clearInterval(timer)
						resolve(res)
					} else {
						i++
					}
				} catch (e) {
					clearInterval(timer)
				}
			}, 2000)
		})
	}

	async getTransactionReceipt(hash) {
		return await this.checkContractAddress(hash)
	}
}
