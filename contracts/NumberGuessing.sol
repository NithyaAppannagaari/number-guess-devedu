// SPDX-License-Identifier: UNLICENSED

// every transaction has a sender, and we access it as msg.sender, which is of type address
// we use msg.sender to track who the owner is (deployer of the contract) and send winnings to the write person / wallet

// to accept eth, a function must be marked payable. when someone calls a payable function and sends ETH,
// we read how much they sent with msg.value
// to send, we do payable(address).transfer(amount)

// we can also utilize reusable access controls in solidity via a modifier

pragma solidity ^0.8.28;

contract NumberGuessing {
  bytes32 number_hash;
  address public owner;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "not owner");
    _; // this means "run the rest of the function"
  }

  event CorrectGuess(address winner, uint amount);
  event WrongGuess(address player);

  function guess(uint number) payable public {
    require(msg.value >= 0.001 ether, "must deposit into pot to guess");

    bytes32 guess_hash = keccak256(abi.encodePacked(number));

    if (number_hash == guess_hash) {
        uint pot = address(this).balance;
        payable(msg.sender).transfer(pot);
        emit CorrectGuess(msg.sender, pot);
    } else {
        emit WrongGuess(msg.sender);
    }
  }

  function setNumber(uint secret) onlyOwner public {
    number_hash = keccak256(abi.encodePacked(secret));
  }
  
}
