const { expect } = require("chai");
const { ethers } = require("hardhat");

const decimals = 18;
let accounts = [];
let lottery;

const minBet = ethers.utils.parseUnits("0.02", decimals);
const minBelow = ethers.utils.parseUnits("0.001", decimals);

describe("Lottery Contract", () => {
  it("deploy and one account to enter", async () => {
    accounts = await ethers.getSigners();

    const Lottery = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy();
    await lottery.deployed();
    console.log("Lottery contract deployed to: " + lottery.address);

    await lottery.connect(accounts[1]).enter(minBet);
    const players = await lottery.connect(accounts[0]).getPlayers();

    expect(players[0]).to.equal(accounts[1].address);
    expect(players.length).to.equal(1);
  });

  it("multiple accounts to enter", async () => {
    await lottery.connect(accounts[2]).enter(minBet);
    await lottery.connect(accounts[3]).enter(minBet);
    await lottery.connect(accounts[4]).enter(minBet);

    const players = await lottery.connect(accounts[0]).getPlayers();
    expect(players[1]).to.equal(accounts[2].address);
    expect(players[2]).to.equal(accounts[3].address);
    expect(players[3]).to.equal(accounts[4].address);
    expect(players.length).to.equal(4);
  });

  it("requires a minimum amount of ether to enter", async () => {
    await expect(
      lottery.connect(accounts[5]).enter(minBelow)
    ).to.be.revertedWith("A minimal payment of .01 ether must be sent to enter the lottery");
  });

  it("only manager can call pickWinner", async () => {
    await expect(
      lottery.connect(accounts[1]).pickWinner()
    ).to.be.revertedWith("Only owner can call this function");
  });

  it("sends money to the winner and resets the players array", async () => {
    await lottery.connect(accounts[1]).enter(ethers.utils.parseUnits("1", decimals));
    await lottery.connect(accounts[0]).pickWinner();
  });
});
