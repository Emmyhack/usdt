const hre = require("hardhat");

/**
 * Bulk distribution script
 * Allows distributing tokens to multiple addresses at once
 */

async function bulkTransfer(tokenAddress, recipients) {
  const customUSDT = await hre.ethers.getContractAt("CustomUSDT", tokenAddress);
  const [signer] = await hre.ethers.getSigners();

  console.log("🚀 Starting bulk transfer...\n");

  const addresses = recipients.map((r) => r.address);
  const amounts = recipients.map((r) => hre.ethers.parseUnits(r.amount, 6));

  try {
    const tx = await customUSDT.addInitialHolders(addresses, amounts);

    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();

    console.log("\n✅ Bulk transfer completed!");
    console.log("Block number:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());

    console.log("\n📊 Distribution Summary:");
    for (let i = 0; i < recipients.length; i++) {
      console.log(`  ${recipients[i].address}: ${recipients[i].amount} USDT`);
    }

    return receipt;
  } catch (error) {
    console.error("❌ Error during bulk transfer:", error.message);
    throw error;
  }
}

// Example usage
async function main() {
  const tokenAddress = process.env.USDT_TOKEN_ADDRESS || "0x...";

  // Define recipients - customize as needed
  const recipients = [
    { address: "0x1111111111111111111111111111111111111111", amount: "1000" },
    { address: "0x2222222222222222222222222222222222222222", amount: "2000" },
    { address: "0x3333333333333333333333333333333333333333", amount: "1500" },
    // Add more recipients as needed
  ];

  await bulkTransfer(tokenAddress, recipients);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { bulkTransfer };
