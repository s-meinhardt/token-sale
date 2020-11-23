const DappToken = artifacts.require('DappToken')
const DappTokenSale = artifacts.require('DappTokenSale')
const tokenPrice = 1000000000000000 // in wei (greater values cause problem with JavaScript)

module.exports = async (deployer) => {
  await deployer.deploy(DappToken, 1000000)
  await deployer.deploy(DappTokenSale, DappToken.address, tokenPrice)
}
