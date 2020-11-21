// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

contract DappToken {
    uint256 public totalSupply;
    string public name = "DApp Token";  // optional
    string public symbol =  "DAPP";     // optional
    string public standard = "DApp Token v1.0";  // not part of the ERC20 standard
    uint8 public decimals = 18;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    mapping(address => uint256) public balanceOf;   // balanceOf(_owner) = balance
    mapping(address => mapping(address => uint256)) public allowance;  // allowance(_owner, _spender) = value

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

    function approve(address _spender, uint256 _value) public returns (bool success) {
      allowance[msg.sender][_spender] = _value;
      emit Approval(msg.sender, _spender, _value);
      return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
      require(balanceOf[_from]>= _value, "Not enough tokens to transfer");
      require(allowance[_from][msg.sender] >= _value, "Not enough tokens allowed to transfer");
      balanceOf[_from] -= _value;
      balanceOf[_to] += _value;
      allowance[_from][msg.sender] -= _value;
      emit Transfer(_from, _to, _value);
      return true;
    }

    
}
