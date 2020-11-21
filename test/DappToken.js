let DappToken = artifacts.require('DappToken')

contract('DappToken', (accounts) => {
  it('initializes the contract with the correct values', async () => {
    let instance = await DappToken.deployed()
    let name = await instance.name()
    assert.equal(name, 'DApp Token', 'has the correct name')
    let symbol = await instance.symbol()
    assert.equal(symbol, 'DAPP', 'has the correct symbol')
    let standard = await instance.standard()
    assert.equal(standard, 'DApp Token v1.0', 'has the correct standard')
  })

  it('allocates the initial supply upon deployment', async () => {
    let instance = await DappToken.deployed()

    let totalSupply = await instance.totalSupply()
    assert.equal(
      totalSupply.toNumber(),
      1000000,
      'sets the total supply to 1,000,000'
    )

    let adminBalance = await instance.balanceOf(accounts[0])
    assert.equal(
      adminBalance.toNumber(),
      1000000,
      'it allocates the initial supply to the admin account'
    )
  })

  it('transfers token ownership', async () => {
    let instance = await DappToken.deployed()

    try {
      await instance.transfer.call(accounts[1], 999999999999999)
    } catch (error) {
      assert(
        error.message.indexOf('revert') >= 0,
        'error message must contain revert'
      )
    }

    let success = await instance.transfer.call(accounts[1], 250000, {
      from: accounts[0],
    })
    assert.equal(success, true, 'it returns true')

    let receipt = await instance.transfer(accounts[1], 250000, {
      from: accounts[0],
    })
    assert.equal(receipt.logs.length, 1, 'triggers one event')
    assert.equal(
      receipt.logs[0].event,
      'Transfer',
      'should be the "Transfer" event'
    )
    assert.equal(
      receipt.logs[0].args._from,
      accounts[0],
      'logs the account the tokens are transferred from'
    )
    assert.equal(
      receipt.logs[0].args._to,
      accounts[1],
      'logs the account the tokens are transferred to'
    )
    assert.equal(
      receipt.logs[0].args._value,
      250000,
      'logs the transfer amount'
    )

    let balanceReceiver = await instance.balanceOf(accounts[1])
    assert.equal(
      balanceReceiver.toNumber(),
      250000,
      'adds the amount to the receiving account'
    )

    let balanceSender = await instance.balanceOf(accounts[0])
    assert.equal(
      balanceSender.toNumber(),
      750000,
      'deducts the amount to the sending account'
    )
  })
})
