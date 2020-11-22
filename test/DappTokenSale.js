const DappTokenSale = artifacts.require('DappTokenSale')
const DappToken = artifacts.require('DappToken')

contract('DappTokenSale', (accounts) => {
  const tokenPrice = 1000000 // in wei (greater values cause problem with JavaScript)
  let buyer = accounts[1]
  let admin = accounts[0]
  let tokensAvailable = 750000 // the amount we want to sell

  it('initializes the contract with the correct values', async () => {
    let tokenSaleInstance = await DappTokenSale.deployed()
    assert.notEqual(tokenSaleInstance.address, 0x0, 'has contract address')

    let tokenAddress = await tokenSaleInstance.tokenContract()
    assert.notEqual(tokenAddress, 0x0, 'has token contract address')

    let price = await tokenSaleInstance.tokenPrice()
    assert.equal(price, tokenPrice)
  })

  it('facilitates token buying', async () => {
    let tokenSaleInstance = await DappTokenSale.deployed()
    let tokenInstance = await DappToken.deployed()
    await tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {
      from: admin,
    })
    let numberOfTokens = 10
    let receipt = await tokenSaleInstance.buyTokens(numberOfTokens, {
      from: buyer,
      value: numberOfTokens * tokenPrice,
    })
    assert.equal(
      await tokenSaleInstance.tokensSold(),
      numberOfTokens,
      'increments the number of tokens sold'
    )
    assert.equal(receipt.logs.length, 1, 'triggers one event')
    assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event')
    assert.equal(
      receipt.logs[0].args._buyer,
      buyer,
      'logs the account that purchased the tokens'
    )
    assert.equal(
      receipt.logs[0].args._amount,
      numberOfTokens,
      'logs the number of tokens purchased'
    )
    assert.equal(
      await tokenInstance.balanceOf(buyer),
      10,
      'tokens the buyer bought'
    )
    assert.equal(
      await tokenInstance.balanceOf(tokenSaleInstance.address),
      tokensAvailable - numberOfTokens,
      'the tokens available after purchase'
    )
    try {
      assert.fail(
        await tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: 1,
        })
      )
    } catch (error) {
      assert(error.message.indexOf('revert') >= 0, 'not enough Ether provided')
    }

    try {
      assert.fail(
        await tokenSaleInstance.buyTokens(800000, {
          from: buyer,
          value: 800000 * tokenPrice,
        })
      )
    } catch (error) {
      assert(error.message.indexOf('revert') >= 0, 'not enough tokens availabe')
    }
  })

  it('ends token sale', async () => {
    let tokenSaleInstance = await DappTokenSale.deployed()
    let tokenInstance = await DappToken.deployed()
    try {
      assert.fail(
        await tokenSaleInstance.endSale({
          from: buyer,
        })
      )
    } catch (error) {
      assert(error.message.indexOf('revert') >= 0, 'only admin can end sale')
    }
    await tokenSaleInstance.endSale({ from: admin })
    assert.equal(
      await tokenInstance.balanceOf(admin),
      999990,
      'returns all unsold dapp tokens'
    )
    try {
      assert.fail(
        await tokenSaleInstance.buyTokens(20, {
          from: buyer,
          value: 20 * tokenPrice,
        })
      )
    } catch (error) {
      assert(error.message.indexOf('revert') >= 0, 'token sale has ended')
    }
    let balance = await web3.eth.getBalance(tokenSaleInstance.address)
    assert.equal(balance.toString(), '0')
  })
})
