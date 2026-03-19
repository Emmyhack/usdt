const hre = require("hardhat");

/**
 * Example interactions with the CustomUSDT token
 * Run with: npx hardhat run scripts/interact.js --network sepolia
 */

async function main() {
  const tokenAddress = "0x..."; // Replace with your deployed token address
  const holderAddress = "0x..."; // Replace with holder address

  console.log("🔗 Interacting with CustomUSDT Token\n");

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Connected as:", signer.address, "\n");

  // Get contract instance
  const customUSDT = await hre.ethers.getContractAt("CustomUSDT", tokenAddress);

  // Example 1: Get token info
  console.log("📊 Token Information:");
  console.log("Name:", await customUSDT.name());
  console.log("Symbol:", await customUSDT.symbol());
  console.log("Decimals:", await customUSDT.decimals());
  console.log("Total Supply:", hre.ethers.formatUnits(await customUSDT.totalSupply(), 6), "\n");

  // Example 2: Get holder balance
  console.log("👤 Holder Information:");
  const balance = await customUSDT.balanceOf(holderAddress);
  console.log("Balance:", hre.ethers.formatUnits(balance, 6), "USDT");

  // Example 3: Check burn eligibility
  const isEligible = await customUSDT.isEligibleForBurn(holderAddress);
  const timeRemaining = await customUSDT.getTimeUntilBurnEligible(holderAddress);
  console.log("Eligible for burn:", isEligible);

  if (!isEligible) {
    const days = Math.floor(timeRemaining / (24 * 60 * 60));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
    console.log(`Time remaining: ${days} days, ${hours} hours\n`);
  } else {
    console.log("✅ Ready for auto-burn!\n");
  }

  // Example 4: Get holder info
  console.log("📋 Holder Details:");
  const holderInfo = await customUSDT.getHolderInfo(holderAddress);
  console.log("Holding since:", new Date(Number(holderInfo.holdingStartTime) * 1000).toISOString());
  console.log("Is initial holder:", holderInfo.isInitialHolder);
  console.log("Total burned:", hre.ethers.formatUnits(holderInfo.burnedAmount, 6), "USDT\n");

  // Example 5: Get USD balance
  console.log("💵 USD Valuation:");
  try {
    const priceUSD = await customUSDT.getLatestPrice();
    console.log("ETH/USD Price:", hre.ethers.formatUnits(priceUSD, 8));

    const balanceUSD = await customUSDT.getBalanceInUSD(holderAddress);
    console.log("Balance in USD: $", hre.ethers.formatUnits(balanceUSD, 18), "\n");
  } catch (error) {
    console.log("Note: Price feed unavailable on this network\n");
  }

  // Example 6: Transfer tokens
  console.log("📤 Transfer Tokens Example (not executed):");
  console.log("Code: await customUSDT.transfer(recipientAddress, hre.ethers.parseUnits('100', 6));");
  console.log("(After this, recipient becomes a holder with new holding start time)\n");

  // Example 7: Add initial holders
  console.log("👥 Add Initial Holders Example (not executed):");
  console.log(`const addresses = ["0x...", "0x..."];`);
  console.log(`const amounts = [ethers.parseUnits("1000", 6), ethers.parseUnits("2000", 6)];`);
  console.log(`await customUSDT.addInitialHolders(addresses, amounts);\n`);

  // Example 8: Trigger auto-burn
  if (isEligible) {
    console.log("🔥 Auto-Burn Example (Safe - only runs if eligible):");
    console.log("const tx = await customUSDT.autoBurnAfterHoldingPeriod(holderAddress);");
    console.log("await tx.wait();");
    console.log("console.log('50% of balance has been burned');\n");
  }

  // Example 9: Get all initial holders
  console.log("📝 All Initial Holders:");
  const initialHolders = await customUSDT.getInitialHolders();
  console.log(`Total initial holders: ${initialHolders.length}`);
  for (let i = 0; i < Math.min(5, initialHolders.length); i++) {
    const address = initialHolders[i];
    const balance = await customUSDT.balanceOf(address);
    console.log(`  ${i + 1}. ${address}: ${hre.ethers.formatUnits(balance, 6)} USDT`);
  }
  if (initialHolders.length > 5) {
    console.log(`  ... and ${initialHolders.length - 5} more holders\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
