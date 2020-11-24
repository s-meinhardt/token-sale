let web3
let dappToken
let dappTokenSale
let accounts
let tokenPrice = '0'
const tokensAvailable = 750000
const dappTokenAddress = '0xeaaa14e937f7506950a6bd37f5d86265def6a671'
const dappTokenSaleAddress = '0xe4b5368a01cc3e8c56521ce0d674d8e62b361d68'

const connectWallet = async () => {
  try {
    accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })
    document.querySelector('#connectBtn').style.display = 'none'
  } catch (error) {
    console.log(error)
    accounts = []
  }
}

const initWeb3 = async () => {
  if (window.ethereum) {
    console.log('Is connected? ', window.ethereum.isConnected())
    await connectWallet()
    console.log('Selected Address: ', window.ethereum.selectedAddress)
    ethereum.autoRefreshOnNetworkChange = false
    await window.ethereum.on('accountsChanged', (accounts) => {
      console.log('New Accounts: ', accounts)
      if (accounts.length === 0) {
        document.querySelector('#connectBtn').style.display = 'block'
      }
      render(accounts)
    })
    return new Web3(window.ethereum)
  } else {
    alert(
      'Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!'
    )
    web3Provider = new Web3.providers.HttpProvider('http://localhost:7545')
    accounts = await web3.eth.getAccounts()
    return new Web3(web3Provider)
  }
}

const render = async (accounts) => {
  console.log('Accounts: ', accounts)

  document.querySelector('#loader').style.display = 'block'
  document.querySelector('#content').style.display = 'none'

  try {
    document.querySelector('#accountAddress').innerHTML =
      'Your Account: ' + accounts[0]
    var balance = await dappToken.methods.balanceOf(accounts[0]).call()
  } catch (error) {
    console.log(error)
    var balance = 0
  }
  document.querySelector('.dapp-balance').innerHTML = balance
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
  dappToken = new web3.eth.Contract(DappToken.abi, dappTokenAddress)
  console.log('Dapp Token Address: ', dappToken.options.address)

  // Loading the DApp Token Sale
  const DappTokenSale = await (await fetch('DappTokenSale.json')).json()
  dappTokenSale = new web3.eth.Contract(DappTokenSale.abi, dappTokenSaleAddress)
  console.log('Dapp Token Sale Address: ', dappTokenSale.options.address)
  tokenPrice = await dappTokenSale.methods.tokenPrice().call()

  // Listen for the "Sell" events emitted from the contract and render the page
  await dappTokenSale.events
    .Sell({ from: 'latest' })
    .on('data', () => render(accounts))

  await render(accounts)
}

const buyTokens = async (e) => {
  e.preventDefault()
  document.querySelector('.be-patient').style.display = 'block'
  const numberOfToken = document.querySelector('#numberOfToken').value
  await dappTokenSale.methods.buyTokens(numberOfToken).send({
    from: accounts[0],
    value: numberOfToken * tokenPrice,
    gas: 500000,
  })
  document.querySelector('form').reset()
  console.log('Token bought...')
  document.querySelector('.be-patient').style.display = 'none'
}
document.querySelector('form').addEventListener('submit', buyTokens)
document.querySelector('#connectBtn').addEventListener('click', connectWallet)

initApp()
