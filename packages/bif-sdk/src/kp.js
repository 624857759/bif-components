import { ethers } from 'ethers';
import { randomBytes } from 'ethers/lib/utils';
import randombytes from 'randombytes'

const keygen = (secret, type) => {
	console.log(secret, type)
	const keypair = window.bifSDK.keypair
	const cryptoType = type === 'ED25519' ? keypair.CRYPTO_ED25519 : keypair.CRYPTO_SM2
	const isMnemonicCodes = secret && secret.split(' ').length > 1
	const random = randombytes(16)
	const mnemonicCodes = keypair.generateMnemonicCode(random.toString('hex'))
	// console.log(keypair.privateKeyFromMnemonicCode('coral genuine drama prison arctic lawsuit fiction small tiny assault spawn language'))
	let privateKeyManager

	if (secret) {
		privateKeyManager = isMnemonicCodes ? keypair.privKeyFromMCodeAndCrypto(cryptoType, mnemonicCodes, "m/44'/526'/1'/0/0") : keypair.privateKeyManagerByKey(secret)
	} else {
		privateKeyManager = keypair.privateKeyManager(cryptoType)
	}
	const singleAdrr = typeof privateKeyManager === 'string'

	const privateKey = secret || privateKeyManager.encPrivateKey;
	const publicKey = singleAdrr ? privateKeyManager : privateKeyManager.encPublicKey;
	const address = singleAdrr ? privateKeyManager : privateKeyManager.encAddress;
	const hexAddress = singleAdrr ? privateKeyManager : privateKeyManager.encAddress;
	return { address, hexAddress, publicKey, privateKey }
}

const newKeypair = (_, type) => {

	const key = keygen('', type)

	return {
		address: key.address || key.hexAddress,
		secret: key.privateKey,
		secretName: 'Private Key',
	}
}

export default {
	newKeypair,
	importKeypair(secret = '') {
		const key = keygen(secret)
		return {
			address: key.address || key.hexAddress,
			secret: key.privateKey,
			secretName: 'Private Key',
		}
	},
	walletFrom(secret) {
		if (secret.startsWith('0x')) {
			return new ethers.Wallet(secret)
		} else {
			return ethers.Wallet.fromMnemonic(secret, `m/44'/503'/0'/0/0`)
		}
	},
	exportKeypair(secret, chainId) {
		const key = networkManager.sdk.client.client.keypair.privateKeyManager(secret)
		return {
			address: key.address || key.hexAddress,
			hexAddress: key.hexAddress,
			publicKey: key.publicKey,
			secret: key.secret
		}
	}
}