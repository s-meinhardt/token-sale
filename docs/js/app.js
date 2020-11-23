let web3
let dappToken
let dappTokenSale
let account
let tokenPrice
const tokensAvailable = 750000

const initWeb3 = async () => {
  if (window.ethereum) {
    window.ethereum.enable()
    return new Web3(window.ethereum)
  } else {
    alert(
      'Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!'
    )
    web3Provider = new Web3.providers.HttpProvider('http://localhost:7545')
    return new Web3(web3Provider)
  }
}

const render = async () => {
  document.querySelector('#loader').style.display = 'block'
  document.querySelector('#content').style.display = 'none'

  account = (await web3.eth.getAccounts())[0]
  console.log('Account: ', account)

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

let initApp = async () => {
  web3 = await initWeb3()

  const netID = await web3.eth.net.getId()
  console.log('netID: ', netID)

  // Loading the DApp Token
  const DappToken = await (await fetch('DappToken.json')).json()
  dappToken = new web3.eth.Contract(
    DappToken.abi,
    '0xeaaa14e937f7506950a6bd37f5d86265def6a671'
  )
  console.log('Dapp Token Address: ', dappToken.options.address)

  // Loading the DApp Token Sale
  const DappTokenSale = await (await fetch('DappTokenSale.json')).json()
  dappTokenSale = new web3.eth.Contract(
    DappTokenSale.abi,
    '0xe4b5368a01cc3e8c56521ce0d674d8e62b361d68'
  )
  console.log('Dapp Token Sale Address: ', dappTokenSale.options.address)
  tokenPrice = await dappTokenSale.methods.tokenPrice().call()

  // Listen for the "Update" event emitted when the account changes
  // await web3.currentProvider.publicConfigStore.on('update', render)
  // Listen for the "Sell" events emitted from the contract and render the page
  dappTokenSale.events.Sell({ from: 'latest' }).on('data', render)

  if (window.ethereum) {
    ethereum.on('accountsChanged', (accounts) => render())
  } else {
    render()
  }
}

const buyTokens = async (e) => {
  e.preventDefault()
  const numberOfToken = document.querySelector('#numberOfToken').value
  await dappTokenSale.methods.buyTokens(numberOfToken).send({
    from: account,
    value: numberOfToken * tokenPrice,
    gas: 500000,
  })
  document.querySelector('form').reset()
  console.log('Token bought...')
}
document.querySelector('form').addEventListener('submit', buyTokens)

initApp()
