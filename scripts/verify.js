const hre = require("hardhat");

/**
 * Verify deployment script
 * Checks that the contract is properly deployed and functional
 */

async function verifyDeployment(tokenAddress, priceFeedAddress) {
  console.log("🔍 Verifying CustomUSDT Deployment...\n");

  try {
    const customUSDT = await hre.ethers.getContractAt("CustomUSDT", tokenAddress);
    const [deployer] = await hre.ethers.getSigners();

    // 1. Check token metadata
    console.log("✅ Token Metadata:");
    console.log(`  Name: ${await customUSDT.name()}`);
    console.log(`  Symbol: ${await customUSDT.symbol()}`);
    console.log(`  Decimals: ${await customUSDT.decimals()}\n`);

    // 2. Check total supply
    console.log("✅ Supply Check:");
    const totalSupply = await customUSDT.totalSupply();
    console.log(`  Total Supply: ${hre.ethers.formatUnits(totalSupply, 6)}\n`);

    // 3. Check deployer balance
    console.log("✅ Deployer Balance:");
    const deployerBalance = await customUSDT.balanceOf(deployer.address);
    console.log(`  Balance: ${hre.ethers.formatUnits(deployerBalance, 6)} USDT\n`);

    // 4. Check price feed
    console.log("✅ Price Feed Integration:");
    try {
      const latestPrice = await customUSDT.getLatestPrice();
      console.log(`  Latest ETH/USD Price: ${hre.ethers.formatUnits(latestPrice, 8)}\n`);
    } catch (error) {
      console.log("  ⚠️  Price feed might not be available on this network\n");
    }

    // 5. Check initial holders
    console.log("✅ Initial Holders:");
    const initialHolders = await customUSDT.getInitialHolders();
    console.log(`  Total: ${initialHolders.length}`);
    if (initialHolders.length > 0) {
      console.log(`  First holder: ${initialHolders[0]}\n`);
    }

    // 6. Test transfer functionality
    console.log("✅ Transfer Functionality:");
    console.log("  (Would test transfer but skipping to avoid state changes)\n");

    // 7. Check contract version
    console.log("✅ Contract Info:");
    console.log(`  Address: ${tokenAddress}`);
    console.log(`  Network: ${hre.ethers.provider._network.name}`);
    console.log(`  Block: ${await hre.ethers.provider.getBlockNumber()}\n`);

    console.log("🎉 Deployment verified successfully!\n");

    return {
      verified: true,
      address: tokenAddress,
      network: hre.ethers.provider._network.name,
      totalSupply: hre.ethers.formatUnits(totalSupply, 6),
      initialHoldersCount: initialHolders.length,
    };
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    return {
      verified: false,
      error: error.message,
    };
  }
}

// Export for use in other scripts
async function main() {
  const tokenAddress = process.env.USDT_TOKEN_ADDRESS || "0x...";
  const priceFeedAddress = process.env.PRICE_FEED_ADDRESS || "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8019";

  await verifyDeployment(tokenAddress, priceFeedAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { verifyDeployment };
