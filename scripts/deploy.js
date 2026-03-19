const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Custom USDT Token...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer account:", deployer.address);

  // Chainlink Price Feed Addresses (for reference)
  const priceFeeds = {
    ethereum: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8019", // ETH/USD on mainnet
    sepolia: "0x694AA1769357215DE4FAC081bf1f309adC325306", // ETH/USD on Sepolia
  };

  // Get network
  const network = hre.ethers.provider._network.name;
  const priceFeedAddress = priceFeeds[network] || priceFeeds.sepolia;

  console.log(`Network: ${network}`);
  console.log(`Price Feed Address: ${priceFeedAddress}\n`);

  // Initial supply (1 billion USDT with 6 decimals)
  const initialSupply = hre.ethers.parseUnits("1000000000", 6);

  // Deploy contract
  const CustomUSDT = await hre.ethers.getContractFactory("CustomUSDT");
  const token = await CustomUSDT.deploy(initialSupply, priceFeedAddress);

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("✅ CustomUSDT deployed successfully!");
  console.log(`Token Address: ${tokenAddress}\n`);

  // Get contract details
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();

  console.log("Token Details:");
  console.log(`  Name: ${name}`);
  console.log(`  Symbol: ${symbol}`);
  console.log(`  Decimals: ${decimals}`);
  console.log(`  Total Supply: ${hre.ethers.formatUnits(totalSupply, decimals)}\n`);

  // Save deployment info
  const deploymentsFile = `./deployments/${network}-${Date.now()}.json`;
  const fs = require("fs");

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }

  const deploymentInfo = {
    network,
    tokenAddress,
    deployerAddress: deployer.address,
    priceFeedAddress,
    initialSupply: hre.ethers.formatUnits(initialSupply, decimals),
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  fs.writeFileSync(deploymentsFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentsFile}`);

  // Contract interaction examples
  console.log("\n📋 Example Interactions:\n");

  try {
    // Get latest price
    const price = await token.getLatestPrice();
    console.log(`Current ETH/USD Price: ${hre.ethers.formatUnits(price, 8)}`);

    // Get balance in USD
    const balanceUSD = await token.getBalanceInUSD(deployer.address);
    console.log(`Deployer Balance in USD: $${hre.ethers.formatUnits(balanceUSD, 18)}\n`);
  } catch (error) {
    console.log("Note: Price feed may not be available on this network");
    console.log("Error:", error.message, "\n");
  }

  console.log("📝 Next Steps:");
  console.log("1. Save the token address for future interactions");
  console.log("2. Verify the contract on Etherscan:");
  console.log(
    `   npx hardhat verify --network ${network} ${tokenAddress} ${initialSupply} ${priceFeedAddress}`
  );
  console.log("3. Use the ABI to interact with the token on DEX/CEX platforms\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
