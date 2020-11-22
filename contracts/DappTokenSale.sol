// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./DappToken.sol";



contract DappTokenSale {
  address payable admin;
  DappToken public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokensSold;
  bool hasEnded = true;

  event Sell(address _buyer, uint256 _amount);

  modifier isAlive {
    require(hasEnded == false, 'contruct must not be ended');
    _;
  }

  constructor(address _tokenContractAddress, uint256 _tokenPrice) {
    admin = msg.sender;
    tokenContract = DappToken(_tokenContractAddress);
    tokenPrice = _tokenPrice;
    hasEnded = false;
  }

  function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
    require(y == 0 || (z = x * y) / y == x);
  }

  function buyTokens(uint256 _numberOfTokens) public payable isAlive {
    require(msg.value == multiply(_numberOfTokens, tokenPrice), 'not enough Ether provided');
    require( tokenContract.balanceOf(address(this)) >= _numberOfTokens);
    tokenContract.transfer(msg.sender, _numberOfTokens);
    tokensSold += _numberOfTokens;
    emit Sell(msg.sender, _numberOfTokens);
  }

  function endSale() public isAlive {
    require(msg.sender == admin, 'only admin can end the sale');
    tokenContract.transfer(admin, tokenContract.balanceOf(address(this)));
    admin.transfer(address(this).balance);
    hasEnded=true;  
    // selfdestruct(admin);
  }



}