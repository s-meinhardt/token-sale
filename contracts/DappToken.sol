// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

contract DappToken {
    uint256 public totalSupply;
    string public name = "DApp Token";  // optional
    string public symbol =  "DAPP";     // optional
    string public standard = "DApp Token v1.0";  // not part of the ERC20 standard

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
      require(balanceOf[msg.sender]>= _value, "Not enough tokens to transfer");
      balanceOf[msg.sender] -= _value;
      balanceOf[_to] += _value;
      emit Transfer(msg.sender, _to, _value);
      return true;
    }

    
}
