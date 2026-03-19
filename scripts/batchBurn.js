const hre = require("hardhat");
const fs = require("fs");

/**
 * Batch burn trigger for multiple holders
 * Run with: npx hardhat run scripts/batchBurn.js --network sepolia
 */

async function triggerBatchBurn(tokenAddress, holderAddresses) {
  const customUSDT = await hre.ethers.getContractAt("CustomUSDT", tokenAddress);
  const [signer] = await hre.ethers.getSigners();

  console.log("🔥 Starting batch burn process...\n");

  const burnResults = [];

  for (const holderAddress of holderAddresses) {
    try {
      // Check eligibility
      const isEligible = await customUSDT.isEligibleForBurn(holderAddress);

      if (!isEligible) {
        const timeRemaining = await customUSDT.getTimeUntilBurnEligible(holderAddress);
        console.log(`⏳ ${holderAddress} - Not eligible yet (${Math.floor(timeRemaining / 86400)} days remaining)`);
        burnResults.push({
          address: holderAddress,
          status: "pending",
          reason: "6 months not elapsed",
        });
        continue;
      }

      // Get balance before burn
      const balanceBefore = await customUSDT.balanceOf(holderAddress);

      console.log(`🔄 Processing ${holderAddress}...`);

      // Trigger burn
      const tx = await customUSDT.autoBurnAfterHoldingPeriod(holderAddress);
      const receipt = await tx.wait();

      // Get balance after burn
      const balanceAfter = await customUSDT.balanceOf(holderAddress);
      const burnedAmount = balanceBefore - balanceAfter;

      console.log(`   ✅ Burned ${hre.ethers.formatUnits(burnedAmount, 6)} USDT`);
      console.log(`   Remaining balance: ${hre.ethers.formatUnits(balanceAfter, 6)} USDT`);
      console.log(`   TX: ${receipt.transactionHash}\n`);

      burnResults.push({
        address: holderAddress,
        status: "completed",
        balanceBefore: hre.ethers.formatUnits(balanceBefore, 6),
        burned: hre.ethers.formatUnits(burnedAmount, 6),
        balanceAfter: hre.ethers.formatUnits(balanceAfter, 6),
        txHash: receipt.transactionHash,
      });
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
      burnResults.push({
        address: holderAddress,
        status: "failed",
        error: error.message,
      });
    }
  }

  // Save results to file
  const reportPath = `./burn-reports/batch-burn-${Date.now()}.json`;
  fs.mkdirSync("./burn-reports", { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(burnResults, null, 2));

  console.log("\n📊 Batch Burn Summary:");
  console.log(`Completed: ${burnResults.filter((r) => r.status === "completed").length}`);
  console.log(`Pending: ${burnResults.filter((r) => r.status === "pending").length}`);
  console.log(`Failed: ${burnResults.filter((r) => r.status === "failed").length}`);
  console.log(`\nReport saved to: ${reportPath}`);

  return burnResults;
}

// Example usage
async function main() {
  const tokenAddress = process.env.USDT_TOKEN_ADDRESS || "0x...";

  // Get initial holders from contract or specify manually
  const customUSDT = await hre.ethers.getContractAt("CustomUSDT", tokenAddress);
  const holders = await customUSDT.getInitialHolders();

  console.log(`Found ${holders.length} initial holders\n`);

  await triggerBatchBurn(tokenAddress, holders);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { triggerBatchBurn };
