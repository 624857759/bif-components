import { utils } from '@obsidians/eth-sdk'
import txOptions from './txOptions'
import * as sjcl from 'brdc-sjcl'

const display = value => {
	if (typeof value === 'bigint') {
		value = value.toString()
	}
	return value
}

// TODO: improve logic
const formatAddress = (addr, chainId) => {
	return addr
}

const isValidAddress = (address) => {
	try {
		if (!address || typeof address !== 'string') {
			return false
		}
		const items = address.split(':')
		if (items.length !== 3 && items.length !== 4) {
			return false
		}
		if (items.length === 3) {
			address = items[2]
		} else {
			address = items[3]
		}
		const prifx = address.substring(0, 2)
		if (prifx !== 'ef' && prifx !== 'zf') {
			return false
		}
		let addr = address.substring(2, address.length)
		let base58_address = []
		base58_address = sjcl.codec.base58.decode(addr)
		if (base58_address.length != 22) {
			return false
		}
		return (true)
	} catch (err) {
		console.log(err)
		return false
	}
}

export default {
	...utils,
	txOptions,
	isValidAddress,
	formatAddress,
	abbreviateAddress: address => `${address.substr(0, 6)}...${address.substr(address.length - 6, address.length)}`,
	display,
	// TODO: improve unit format
	unit: {
		fromValue: value => value,
		toValue: cfx => `${cfx}00000000`,
		valueToGvalue: value => value
	},
}