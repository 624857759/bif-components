import keypairManager from '@obsidians/keypair'

const ERROR_CODES = {
  0: '操作成功',
  1: '服务内部错误',
  2: '参数错误',
  3: '对象已存在， 如重复提交交易',
  4: '对象不存在，如查询不到账号、TX、区块等',
  5: 'TX 超时，指该 TX 已经被当前节点从 TX 缓存队列去掉，但并不代表这个一定不能被执行',
  6: '账户禁止使用',
  7: '数学计算溢出',
  90: '公钥非法',
  91: '私钥非法',
  93: '签名权重不够，达不到操作的门限值',
  94: '地址非法',
  97: '交易缺失操作',
  98: '单笔交易内超过了100个操作',
  99: '交易序号错误，nonce错误',
  100: '余额不足',
  101: '源和目的账号相等',
  102: '创建账号操作，目标账号已存在',
  103: '账户不存在',
  106: '创建账号初始化资产小于配置文件中最小费用',
  111: '费用不足',
  120: '权重值不在有效范围',
  121: '门限值不在有效范围',
  144: 'metadata的version版本号不与已有的匹配（一个版本化的数据库）',
  146: '交易数据超出上限',
  151: '合约执行失败',
  152: '合约语法分析失败',
  153: '合约递归深度超出上限',
  154: '合约产生的交易超出上限',
  155: '合约执行超时',
  156: '目标地址非合约账户',
  160: '插入交易缓存队列失败',
  161: '禁止转移星火令',
  170: '服务域不存在'
}

class Tx {
  constructor (client, tx, getResult) {
    this.client = client
    this.tx = tx
    this.getResult = getResult
  }

  get from() {
    return this.tx.from
  }

  get chainId() {
    return this.client.chainId
  }

  send(sp) {
    const pendingTx = this.sendTx()
    return this._processPendingTx(pendingTx)
  }

  _processPendingTx(pendingTx) {
    return {
      then: (res, rej) => pendingTx.then(res, rej),
      mined: async () => {
        return {}
      },
      executed: async () => {
        let i = 0;
        let receipt

        return new Promise((resolve, reject) => {
          let errMsg
          const timer = setInterval(async () => {
            if (i === 60) {
              clearInterval(timer)
              reject('操作失败，请重试...')
            }
            const hash = await pendingTx
            if (hash) {
              clearInterval(timer)
              try {
                receipt = await this.client.getTransactionReceipt(hash)
                console.log(receipt)
                if (receipt.errorCode === 0) {
                  if (receipt.result.transactions[0].error_code === 100) {
                    errMsg = '余额不足'
                    reject({
                      message: '余额不足'
                    })
                  }
                  if (receipt.result.transactions[0].error_desc) {
                    const result = JSON.parse(receipt.result.transactions[0].error_desc)
                    resolve(result ? {
                      contractCreated: result[0].contract_address,
                      codeHash: hash
                    } : {})
                  } else {
                    resolve({})
                  }
                }
              } catch (e) {
                console.log(errMsg)
                reject(errMsg || '操作失败，请重试')
              }
            } else {
              i++
            }
          }, 500)
        })
      },
      confirmed: () => true,
    }
  }

  async call(transaction) {
    return await this.client.cfx.call(transaction, transaction.epochHeight - 1)
  }
}

export class ExecuteTx extends Tx {
  async sendTx(method, { json, obj, array }, override) {
    const params = {
      sourceAddress: override.from,
      privateKey: await keypairManager.getSecret(override.from),
      contractAddress: this.address,
      ceilLedgerSeq: '',
      remarks: 'contractInvoke',
      amount: '0',
      input: JSON.stringify({
        function: `${method}(${Object.values(obj).map(item => item.type)})`,
        args: array.join(',')
      }),
    }
    const res = await this.instance.contractInvoke(params)
    const { errorCode, errorDesc, result } = res

    if (errorCode === 0) {
      return {
        txHash: result.hash,
        // const data = await this.provider.call(tx, height)
        // const result = this.instance.interface.decodeFunctionResult(method, data)
        ...this.parseResult(result, method)
        // ...this.parseResult(res, method)
      }
    } else {
      console.error(res)
      throw new Error(errorDesc)
    }
  }
}

export class TransferTx extends Tx {
  async sendTx(account) {
    const params = this.tx
    const query = {
      sourceAddress: params.from,
      privateKey: await keypairManager.getSecret(this.from),
      destAddress: params.to,
      remarks: 'gasSend',
      amount: params.value,
      ceilLedgerSeq: '',
    }

    const res = await this.client.client.transaction.gasSend(query)

    const { errorCode, result } = res
    if (errorCode === 0) {
      return result.hash
    } else {
      // errorCode
      if (errorCode === 4) {
        throw new Error(`${params.from} 该地址不存在，请切换到账户所对应的网络。`)
      }

      if (errorCode === 101) {
        throw new Error("源地址与目标地址相同，请选择不同的地址进行操作。")
      }

      throw new Error(res.errorDesc ? res.errorDesc : res.error_desc ? res.error_desc : '未知错误，请重试')
    }
  }

  async estimate({ from }) {
    const account = await this.client.getAccount(from)
    return await this.client.cfx.estimateGasAndCollateral({ from, nonce: account.nonce })
  }
}

export class ContractTx extends Tx {
  constructor (client, tx, getResult, override) {
    super(client, tx, getResult)
    this.override = override
  }

  get from() {
    return this.override.from
  }

  async sendTx() {
    const contractName = this.tx.options.contractName || 's'
    let abi
    let constructorArgs
    let parametersStr
    let initInput
    if (this.tx.options.vmType === 1) {
      abi = this.tx.abi.output.abi
      constructorArgs = abi.find(item => item.type === 'constructor').inputs.map(item => item.type).join(',')
      parametersStr = this.tx.parameters.filter(item => item !== "").map(item => `'${item}'`).join(',')
    }
    initInput = contractName ? JSON.stringify({ function: `${contractName.replace('_meta', '')}}(${constructorArgs})`, args: parametersStr }) : ''

    if (this.tx.options.vmType === 0) {
      initInput = JSON.stringify({
        params: this.tx.options.args
      })
      // sample: initInput = "{\"params\":{\"name\":\"xinghuo space nft\",\"symbol\":\"S\",\"tokenUri\":\"https://gateway.pinata.cloud/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/6476\"}}" 
    }

    const params = {
      sourceAddress: this.from,
      privateKey: await keypairManager.getSecret(this.from),
      payload: this.tx.bytecode,
      initBalance: '1',
      remarks: 'create account',
      type: this.tx.options.vmType,
      ceilLedgerSeq: '',
      initInput,
      feeLimit: this.override.gasLimit || '301836100',
      gasPrice: '',
    }
    const res = await this.client.client.contract.createContract(params)
    const { errorCode, errorDesc, result } = res

    if (errorCode === 0) {
      return result.hash
    } else if (ERROR_CODES[errorCode]) {
      throw new Error(ERROR_CODES[errorCode])
    }

    throw new Error(errorDesc)
  }

  async estimate({ from }) {
    const account = await this.client.getAccount(from)
    return await this.tx.estimateGasAndCollateral({ ...this.override, from, nonce: account.nonce })
  }
}
