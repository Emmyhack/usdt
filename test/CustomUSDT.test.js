const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CustomUSDT", function () {
  let customUSDT;
  let owner;
  let addr1;
  let addr2;
  let mockPriceFeed;

  const INITIAL_SUPPLY = ethers.parseUnits("1000000000", 6);
  const BURN_DURATION = 180 * 24 * 60 * 60; // 6 months in seconds

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy mock price feed
    const MockPriceFeed = await ethers.getContractFactory("MockAggregatorV3");
    mockPriceFeed = await MockPriceFeed.deploy();
    await mockPriceFeed.waitForDeployment();

    // Deploy CustomUSDT
    const CustomUSDT = await ethers.getContractFactory("CustomUSDT");
    customUSDT = await CustomUSDT.deploy(INITIAL_SUPPLY, await mockPriceFeed.getAddress());
    await customUSDT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial supply", async function () {
      const totalSupply = await customUSDT.totalSupply();
      expect(totalSupply).to.equal(INITIAL_SUPPLY);
    });

    it("Should have correct name and symbol", async function () {
      expect(await customUSDT.name()).to.equal("Tether USD");
      expect(await customUSDT.symbol()).to.equal("USDT");
    });

    it("Should have 6 decimals", async function () {
      expect(await customUSDT.decimals()).to.equal(6);
    });

    it("Should mark deployer as initial holder", async function () {
      const holderInfo = await customUSDT.getHolderInfo(owner.address);
      expect(holderInfo.isInitialHolder).to.be.true;
    });
  });

  describe("Transfer", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseUnits("100", 6);

      await customUSDT.transfer(addr1.address, transferAmount);
      expect(await customUSDT.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should track new holder's holding start time on transfer", async function () {
      const transferAmount = ethers.parseUnits("100", 6);

      await customUSDT.transfer(addr1.address, transferAmount);

      const holderInfo = await customUSDT.getHolderInfo(addr1.address);
      expect(holderInfo.holdingStartTime).to.be.gt(0);
      expect(holderInfo.isInitialHolder).to.be.false;
    });
  });

  describe("Burn Mechanism", function () {
    it("Should not allow burn before 6 months", async function () {
      const transferAmount = ethers.parseUnits("1000", 6);
      await customUSDT.transfer(addr1.address, transferAmount);

      await expect(
        customUSDT.autoBurnAfterHoldingPeriod(addr1.address)
      ).to.be.revertedWith("Holder is not eligible for burn yet");
    });

    it("Should allow burn after 6 months", async function () {
      // Transfer tokens to addr1 and mark as initial holder
      const transferAmount = ethers.parseUnits("1000", 6);
      await customUSDT.addInitialHolders([addr1.address], [transferAmount]);

      // Fast forward time by 6 months
      await time.increase(BURN_DURATION + 1);

      // Should be eligible for burn
      const isEligible = await customUSDT.isEligibleForBurn(addr1.address);
      expect(isEligible).to.be.true;

      // Execute burn
      const balanceBefore = await customUSDT.balanceOf(addr1.address);
      await customUSDT.autoBurnAfterHoldingPeriod(addr1.address);
      const balanceAfter = await customUSDT.balanceOf(addr1.address);

      // Should burn 50% of balance
      expect(balanceBefore - balanceAfter).to.equal(balanceBefore / 2n);
    });

    it("Should track burned amount", async function () {
      const transferAmount = ethers.parseUnits("1000", 6);
      await customUSDT.addInitialHolders([addr1.address], [transferAmount]);

      await time.increase(BURN_DURATION + 1);
      await customUSDT.autoBurnAfterHoldingPeriod(addr1.address);

      const holderInfo = await customUSDT.getHolderInfo(addr1.address);
      expect(holderInfo.burnedAmount).to.equal(transferAmount / 2n);
    });
  });

  describe("Initial Holders", function () {
    it("Should add multiple initial holders", async function () {
      const amount1 = ethers.parseUnits("1000", 6);
      const amount2 = ethers.parseUnits("2000", 6);

      await customUSDT.addInitialHolders(
        [addr1.address, addr2.address],
        [amount1, amount2]
      );

      expect(await customUSDT.balanceOf(addr1.address)).to.equal(amount1);
      expect(await customUSDT.balanceOf(addr2.address)).to.equal(amount2);
    });

    it("Should retrieve all initial holders", async function () {
      const amount1 = ethers.parseUnits("1000", 6);
      const amount2 = ethers.parseUnits("2000", 6);

      await customUSDT.addInitialHolders(
        [addr1.address, addr2.address],
        [amount1, amount2]
      );

      const initialHolders = await customUSDT.getInitialHolders();
      expect(initialHolders.length).to.be.at.least(2);
      expect(initialHolders).to.include(addr1.address);
      expect(initialHolders).to.include(addr2.address);
    });
  });

  describe("Time Until Burn", function () {
    it("Should return correct time remaining until burn eligibility", async function () {
      const transferAmount = ethers.parseUnits("1000", 6);
      await customUSDT.addInitialHolders([addr1.address], [transferAmount]);

      const timeRemaining = await customUSDT.getTimeUntilBurnEligible(addr1.address);
      expect(timeRemaining).to.be.closeTo(BURN_DURATION, 5); // 5 second tolerance
    });

    it("Should return 0 when eligible for burn", async function () {
      const transferAmount = ethers.parseUnits("1000", 6);
      await customUSDT.addInitialHolders([addr1.address], [transferAmount]);

      await time.increase(BURN_DURATION + 1);

      const timeRemaining = await customUSDT.getTimeUntilBurnEligible(addr1.address);
      expect(timeRemaining).to.equal(0);
    });
  });

  describe("Maximum Supply and Minting Rights", function () {
    it("Should maintain fixed supply (no additional minting allowed by default)", async function () {
      // Only owner can mint, adjust if needed
      const totalSupplyBefore = await customUSDT.totalSupply();

      // Try to mint new tokens - should fail
      const CustomUSDT = await ethers.getContractFactory("CustomUSDT");
      expect(CustomUSDT.interface.fragments.find(f => f.name === "mint")).to.be.undefined;

      expect(await customUSDT.totalSupply()).to.equal(totalSupplyBefore);
    });
  });
});

// Mock Aggregator for testing (if needed)
describe("Mock Price Feed Setup", async function () {
  it("Should be deployable", async function () {
    // This is optional - for testing purposes
    const MockPriceFeed = await ethers.getContractFactory("MockAggregatorV3");
    const mockPriceFeed = await MockPriceFeed.deploy();
    await mockPriceFeed.waitForDeployment();
    expect(await mockPriceFeed.getAddress()).to.not.be.undefined;
  });
});
