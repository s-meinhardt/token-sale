let dappToken
let dappTokenSale
let account
let tokenPrice
const tokensAvailable = 750000

const render = async () => {
  document.querySelector('#loader').style.display = 'block'
  document.querySelector('#content').style.display = 'none'

  document.querySelector('#accountAddress').innerHTML =
    'Your Account: ' + account
  document.querySelector(
    '.dapp-balance'
  ).innerHTML = await dappToken.methods.balanceOf(account).call()

  document.querySelector('.token-price').innerHTML = web3.utils.fromWei(
    tokenPrice,
    'ether'
  )
  let tokensSold = await dappTokenSale.methods.tokensSold().call()
  document.querySelector('.tokens-sold').innerHTML = tokensSold
  document.querySelector('.tokens-available').innerHTML = tokensAvailable
  let progressPercent = Math.ceil((100 * tokensSold) / tokensAvailable)
  document.querySelector('#progress').style.width = progressPercent + '%'

  document.querySelector('#loader').style.display = 'none'
  document.querySelector('#content').style.display = 'block'
}

let init = async () => {
  // Initializing the web3 instance and setting some constants
  if (typeof web3 !== 'undefined') {
    web3Provider = web3.currentProvider
    web3 = new Web3(web3.currentProvider)
  } else {
    web3Provider = new Web3.providers.HttpProvider('http://localhost:7545')
    web3 = new Web3(web3Provider)
  }
  account = await web3.eth.getCoinbase()
  const netID = await web3.eth.net.getId()

  // Loading the DApp Token
  const DappToken = await (await fetch('DappToken.json')).json()
  dappToken = new web3.eth.Contract(
    DappToken.abi,
    DappToken.networks[netID].address
  )
  console.log('Dapp Token Address: ', dappToken.options.address)

  // Loading the DApp Token Sale
  const DappTokenSale = await (await fetch('DappTokenSale.json')).json()
  dappTokenSale = new web3.eth.Contract(
    DappTokenSale.abi,
    DappTokenSale.networks[netID].address
  )
  console.log('Dapp Token Sale Address: ', dappTokenSale.options.address)
  tokenPrice = await dappTokenSale.methods.tokenPrice().call()

  // Listen for events emitted from the contract and render the page
  await dappTokenSale.events.Sell({ from: 'latest' }).on('data', render)
  render()
}

const buyTokens = async (e) => {
  e.preventDefault()
  const numberOfToken = document.querySelector('#numberOfToken').value
  await dappTokenSale.methods.buyTokens(numberOfToken).send({
    from: account,
    value: numberOfToken * tokenPrice,
    gas: 500000,
  })
}
document.querySelector('form').addEventListener('submit', buyTokens)

init()
