App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 0.001, // in Ether
  tokensSold: 0,
  tokensAvailable: 750000,
  balance: 1000000,

  init: function () {
    console.log('App initialized...')
    return App.initWeb3()
  },

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        'http://localhost:7545'
      )
      web3 = new Web3(App.web3Provider)
    }
    return App.initContracts()
  },

  initContracts: function () {
    $.getJSON('DappTokenSale.json', function (dappTokenSale) {
      App.contracts.DappTokenSale = TruffleContract(dappTokenSale)
      App.contracts.DappTokenSale.setProvider(App.web3Provider)
      App.contracts.DappTokenSale.deployed().then((dappTokenSale) => {
        console.log('Dapp Token Sale Address:', dappTokenSale.address)
      })
    }).done(() => {
      $.getJSON('DappToken.json', function (dappToken) {
        App.contracts.DappToken = TruffleContract(dappToken)
        App.contracts.DappToken.setProvider(App.web3Provider)
        App.contracts.DappToken.deployed().then((dappToken) => {
          console.log('Dapp Token Address:', dappToken.address)
        })
        return App.render()
      })
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.DappTokenSale.deployed()
      .then((instance) => {
        return instance.getPastEvents('Sell', {
          fromBlock: 'latest',
        })
      })
      .then((events) => {
        console.log('Event triggered', events[0])
        App.render()
      })
  },

  render: function () {
    if (App.loading) {
      return
    }
    let loader = $('#loader')
    let content = $('#content')

    App.loading = true
    loader.show()
    content.hide()

    // Load account data
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        App.account = account
        $('#accountAddress').html('Your Account: ' + account)
      }
    })

    // Load token sale contract
    App.contracts.DappTokenSale.deployed()
      .then((instance) => {
        dappTokenSaleInstance = instance
        return dappTokenSaleInstance.tokenPrice()
      })
      .then((tokenPrice) => {
        App.tokenPrice = web3.utils.fromWei(tokenPrice, 'ether')
        $('.token-price').html(App.tokenPrice)
        return dappTokenSaleInstance.tokensSold()
      })
      .then((tokensSold) => {
        App.tokensSold = tokensSold.toNumber()
        $('.tokens-sold').html(App.tokensSold)
        $('.tokens-available').html(App.tokensAvailable)

        let progressPercent = Math.ceil(
          (100 * App.tokensSold) / App.tokensAvailable
        )
        $('#progress').css('width', progressPercent + '%')

        //Load token contract
        App.contracts.DappToken.deployed()
          .then((instance) => {
            dappTokenInstance = instance
            return dappTokenInstance.balanceOf(App.account)
          })
          .then((balance) => {
            App.balance = balance.toNumber()
            $('.dapp-balance').html(App.balance)

            App.loading = false
            loader.hide()
            content.show()
          })
      })
  },

  buyTokens: function () {
    $('#content').hide()
    $('#loader').show()
    let numberOfToken = $('#numberOfToken').val()
    App.contracts.DappTokenSale.deployed()
      .then((instance) => {
        return instance.buyTokens(numberOfToken, {
          from: App.account,
          value: numberOfToken * web3.utils.toWei(App.tokenPrice, 'ether'),
          gas: 500000,
        })
      })
      .then((result) => {
        console.log('Tokens bought...')
        $('form').trigger('reset')
        App.listenForEvents()
        // Wait for Sell event
      })
  },
}

$(function () {
  $(document).ready(function () {
    App.init()
    // alert('window is loaded')
  })
})
