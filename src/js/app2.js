// Initializing the web3 instance
if (typeof web3 !== 'undefined') {
  web3Provider = web3.currentProvider
  web3 = new Web3(web3.currentProvider)
} else {
  web3Provider = new Web3.providers.HttpProvider('http://localhost:7545')
  web3 = new Web3(web3Provider)
}

init = async () => {
  // Loading the DApp Token
  let response = await fetch('DappToken.json')
  let DappToken = await TruffleContract(await response.json())
  await DappToken.setProvider(web3Provider)
  dappToken = await DappToken.deployed()
  console.log('Dapp Token Address: ', DappToken.address)

  // Loading the DApp Token Sale
  response = await fetch('DappTokenSale.json')
  let DappTokenSale = TruffleContract(await response.json())
  await DappTokenSale.setProvider(web3Provider)
  dappTokenSale = await DappTokenSale.deployed()
  console.log('Dapp Token Sale Address: ', DappTokenSale.address)

  // Stating the account address
  let account = await web3.eth.getCoinbase()
  let yourAddress = document.getElementById('accountAddress')
  yourAddress.innerHTML = 'Your Account: ' + account
}
init()
