const DappToken = artifacts.require('DappToken')

contract('DappToken', (accounts) => {
  it('initializes the contract with the correct values', async () => {
    let tokenInstance = await DappToken.deployed()
    let name = await tokenInstance.name()
    assert.equal(name, 'DApp Token', 'has the correct name')
    let symbol = await tokenInstance.symbol()
    assert.equal(symbol, 'DAPP', 'has the correct symbol')
    let standard = await tokenInstance.standard()
    assert.equal(standard, 'DApp Token v1.0', 'has the correct standard')
  })

  it('allocates the initial supply upon deployment', async () => {
    let tokenInstance = await DappToken.deployed()

    let totalSupply = await tokenInstance.totalSupply()
    assert.equal(totalSupply, 1000000, 'sets the total supply to 1,000,000')

    let adminBalance = await tokenInstance.balanceOf(accounts[0])
    assert.equal(
      adminBalance,
      1000000,
      'it allocates the initial supply to the admin account'
    )
  })

  it('transfers token ownership', async () => {
    let tokenInstance = await DappToken.deployed()

    try {
      assert.fail(
        await tokenInstance.transfer.call(accounts[1], 999999999999999)
      )
    } catch (error) {
      assert(
        error.message.indexOf('revert') >= 0,
        'error message must contain revert'
      )
    }

    let success = await tokenInstance.transfer.call(accounts[1], 250000, {
      from: accounts[0],
    })
    assert.equal(success, true, 'it returns true')

    let receipt = await tokenInstance.transfer(accounts[1], 250000, {
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

    let balanceReceiver = await tokenInstance.balanceOf(accounts[1])
    assert.equal(
      balanceReceiver,
      250000,
      'adds the amount to the receiving account'
    )

    let balanceSender = await tokenInstance.balanceOf(accounts[0])
    assert.equal(
      balanceSender,
      750000,
      'deducts the amount to the sending account'
    )
  })

  it('approves tokens for delegated transfer', async () => {
    let tokenInstance = await DappToken.deployed()

    let success = await tokenInstance.approve.call(accounts[1], 100)
    assert.equal(success, true, 'it returns true')

    let receipt = await tokenInstance.approve(accounts[1], 100, {
      from: accounts[0],
    })
    assert.equal(receipt.logs.length, 1, 'triggers one event')
    assert.equal(
      receipt.logs[0].event,
      'Approval',
      'should be the "Approval" event'
    )
    assert.equal(
      receipt.logs[0].args._owner,
      accounts[0],
      'logs the account the tokens are authorized by'
    )
    assert.equal(
      receipt.logs[0].args._spender,
      accounts[1],
      'logs the account the tokens are authorized to'
    )
    assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount')

    let allowance = await tokenInstance.allowance(accounts[0], accounts[1])
    assert.equal(allowance, 100, 'stores the allowance for delegated transfer')
  })

  it('handles delegated token transfers', async () => {
    let tokenInstance = await DappToken.deployed()
    let fromAccount = accounts[2]
    let toAccount = accounts[3]
    let spendingAccount = accounts[4]
    await tokenInstance.transfer(fromAccount, 100, { from: accounts[0] })
    await tokenInstance.approve(spendingAccount, 10, { from: fromAccount })
    try {
      assert.fail(
        await tokenInstance.transferFrom(fromAccount, toAccount, 200, {
          from: spendingAccount,
        })
      )
    } catch (error) {
      assert(
        error.message.indexOf('revert') >= 0,
        'cannot transfer value larger than balance'
      )
    }
    try {
      assert.fail(
        await tokenInstance.transferFrom(fromAccount, toAccount, 50, {
          from: spendingAccount,
        })
      )
    } catch (error) {
      assert(
        error.message.indexOf('revert') >= 0,
        'cannot transfer value larger than allowance'
      )
    }
    let success = await tokenInstance.transferFrom.call(
      fromAccount,
      toAccount,
      10,
      {
        from: spendingAccount,
      }
    )
    assert.equal(success, true)
    let receipt = await tokenInstance.transferFrom(fromAccount, toAccount, 10, {
      from: spendingAccount,
    })
    assert.equal(receipt.logs.length, 1, 'triggers one event')
    assert.equal(
      receipt.logs[0].event,
      'Transfer',
      'should be "Transfer" event'
    )
    assert.equal(
      receipt.logs[0].args._from,
      fromAccount,
      'logs the sending account'
    )
    assert.equal(
      receipt.logs[0].args._to,
      toAccount,
      'logs the receiving account'
    )
    assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount')

    let balanceReceiver = await tokenInstance.balanceOf(toAccount)
    assert.equal(balanceReceiver, 10, 'adds 10 to receiving account')

    let balanceSender = await tokenInstance.balanceOf(fromAccount)
    assert.equal(balanceSender, 90, 'deducts 10 from sending account')

    let allowance = await tokenInstance.allowance(fromAccount, spendingAccount)
    assert.equal(allowance, 0, 'the remaining allowance after transfer')
  })
})
