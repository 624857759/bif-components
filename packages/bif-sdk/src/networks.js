const networks = [
	{
		id: 'mainnet',
		group: '星火链节点',
		name: '星火正式网',
		fullName: '星火正式网',
		icon: 'fas fa-vial',
		notification: '已切换到<b>星火正式网</b>',
		url: 'https://bif-core.bitfactory.cn',
		explorer: 'http://explorer.bitfactory.cn',
		symbol: '星火令'
	},
	{
		id: 'testnet',
		group: '星火链节点',
		name: '星火测试网',
		fullName: '星火测试网',
		icon: 'fas fa-vial',
		notification: '已切换到<b>星火测试网</b>',
		url: 'http://test.bifcore.bitfactory.cn',
		explorer: 'http://test-explorer.bitfactory.cn',
		symbol: '星火令'
	},
	{
		id: 'custom',
		group: '其他',
		name: 'QuickNode',
		fullName: 'QuickNode',
		icon: 'fas fa-edit',
		notification: `已切换到 <b>Custom</b> 网络}.`,
		url: '',
		symbol: '星火令',
	}
]

export const customNetworks = [

]

export default networks
