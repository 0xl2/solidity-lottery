//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Lottery {
    address public manager;
    address payable[] public players;

    constructor() {
        manager = msg.sender;
    }

    function enter(uint256 _amount) public payable {
        require(
            _amount > .01 ether,
            "A minimal payment of .01 ether must be sent to enter the lottery"
        );

        players.push(payable(msg.sender));
    }

    // for production we will not use this random function
    function random() private view returns(uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.difficulty, block.number, players)
                )
            );
    }

    function pickWinner() public onlyOwner {
        uint256 index = random() % players.length;

        players[index].transfer(address(this).balance);
        players = new address payable[](0);
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    modifier onlyOwner() {
        require(msg.sender == manager, "Only owner can call this function");
        _;
    }
}
