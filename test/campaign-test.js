const { expect } = require("chai");
const { ethers } = require("hardhat");

const decimals = 18;
let accounts = [];
let campaign, campaignAddress, campaignFactory;

const minBet = ethers.utils.parseUnits("10", decimals);

describe("Campaign contract", () => {
    it("deploy campaign factory and create one campaign", async () => {
        accounts = await ethers.getSigners();

        const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
        campaignFactory = await CampaignFactory.deploy();
        await campaignFactory.deployed();
        console.log("CampaignFactory contract deployed to: " + campaignFactory.address);

        await campaignFactory.connect(accounts[1]).createCampaign(100);
        [campaignAddress] = await campaignFactory.connect(accounts[1]).getDeployedCampaigns();

        const Campaign = await ethers.getContractFactory("Campaign");
        campaign = await Campaign.attach(campaignAddress);
    });

    it("campaign manager", async() => {
        const selManage = await campaign.manager.call();
        expect(selManage).to.be.equal(accounts[1].address);
    });

    it("campaign contribute", async() => {
        await expect(
            campaign.connect(accounts[2]).contribute(50)
        ).to.be.revertedWith("A minumum contribution is required.");

        await campaign.connect(accounts[2]).contribute(200);
    });

    it("campain requests testing", async() => {
        await campaign.connect(accounts[1]).createRequest("Buy batteries", "100", accounts[2].address);

        const firstRequest = await campaign.requests(0);
        expect(firstRequest.description).to.be.equal("Buy batteries");

        await campaign.connect(accounts[3]).contribute(minBet);
        await campaign.connect(accounts[1]).createRequest("A cool spend request", ethers.utils.parseUnits("5", decimals), accounts[1].address);

        const lastInd = await campaign.getRequestsCount() - 1;
        await campaign.connect(accounts[3]).approveRequest(lastInd);
        await campaign.connect(accounts[2]).approveRequest(lastInd);
        await campaign.connect(accounts[1]).finalizeRequest(lastInd);
    });
});