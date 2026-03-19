# Custom USDT Token

<div align="center">
  <img src="https://drive.google.com/uc?export=download&id=1L3Ti_KkeIUjepNtgnFPYw28yU5vpyjmO" alt="USDT Logo" width="150" height="150">
  <p><strong>Tether USD</strong></p>
</div>

A custom Ethereum-based USDT token with advanced features including 6-month auto-burn, Chainlink price oracle integration, and DEX/CEX compatibility.

## Token Metadata

| Property | Value |
|----------|-------|
| **Name** | Tether USD |
| **Symbol** | USDT |
| **Decimals** | 6 |
| **Standard** | ERC-20 |
| **License** | MIT |
| **Type** | Custom Implementation (separate from official Tether) |

> ⚠️ **Important:** This is a custom USDT implementation with a different smart contract address than the official Tether USDT (0xdAC17F958D2ee523a2206206994597C13D831ec7). It uses official Tether branding under their brand guidelines.

## Features

✨ **Key Features:**

- **ERC-20 Standard Compliant** - Works on all DEX and CEX platforms
- **USDT Branding** - Same name, symbol, and 6-decimal precision as Tether
- **Custom Address** - Separate smart contract from official USDT
- **6-Month Auto-Burn** - Automatically burns 50% of holdings after 6 months for initial holders
- **Price Oracle Integration** - Uses Chainlink to fetch real-time ETH/USD prices
- **Dollar Balance Display** - Get holdings value in USD on-chain
- **Initial Holders Tracking** - Identify first recipients and their burn-eligible status
- **Full Minting Control** - Owner controls distribution and initial holder setup

## Project Structure

```text
custom-usdt/
├── contracts/
│   └── CustomUSDT.sol          # Main token contract
├── scripts/
│   └── deploy.js               # Deployment script
├── test/
│   └── CustomUSDT.test.js      # Smart contract tests
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Dependencies
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Ethereum wallet with testnet funds (for Sepolia testing)

### Setup

1. **Clone/Create the project:**

   ```bash
   cd /home/olalekan-omoye/usdt
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add:

   - `ETHEREUM_RPC_URL` - Your Ethereum RPC endpoint
   - `SEPOLIA_RPC_URL` - Your Sepolia testnet RPC endpoint
   - `PRIVATE_KEY` - Your wallet's private key
   - `ETHERSCAN_API_KEY` - For contract verification

3. **Compile contracts:**

   ```bash
   npm run compile
   ```

## Deployment

### Deploy to Sepolia Testnet (Recommended for testing)

```bash
npm run deploy:sepolia
```

### Deploy to Ethereum Mainnet

```bash
npm run deploy:ethereum
```

## Testing

```bash
npm test
```

## Contract Details

### CustomUSDT Token Contract

**Contract Address Format:** Will be provided after deployment

**Key Functions:**

#### Token Basics

- `transfer(to, amount)` - Transfer tokens
- `approve(spender, amount)` - Approve spending
- `transferFrom(from, to, amount)` - Transfer on behalf

#### Burn Mechanism

- `isEligibleForBurn(holder)` - Check if holder can burn after 6 months
- `getTimeUntilBurnEligible(holder)` - Time remaining until burn eligibility
- `autoBurnAfterHoldingPeriod(holder)` - Trigger 50% burn after 6 months

#### Price Oracle

- `getLatestPrice()` - Get current ETH/USD price from Chainlink
- `getBalanceInUSD(account)` - Get account balance in USD value

#### Initial Holders Management

- `addInitialHolders(addresses, amounts)` - Distribute to initial holders
- `getInitialHolders()` - Retrieve list of all initial holders
- `getHolderInfo(holder)` - Get detailed holder information

## How It Works

### 1. **Deployment**

- Contract deploys with initial supply of 1 billion tokens
- Deployer is marked as first initial holder
- Chainlink price feed is connected

### 2. **Initial Distribution**

```javascript
// Example: Distribute to initial holders
const addrs = ["0x123...", "0x456...", "0x789..."];
const amounts = [ethers.parseUnits("100000", 6), ...];
await customUSDT.addInitialHolders(addrs, amounts);
```

### 3. **Holding Period**

- Tokens start accumulating from distribution time
- Tracking begins automatically for new recipients

### 4. **6-Month Burn**

```javascript
// After 6 months, anyone can trigger auto-burn
await customUSDT.autoBurnAfterHoldingPeriod(holderAddress);
// Effect: 50% of balance is burned and removed from circulation
```

### 5. **Price Tracking**

```javascript
// Get real-time USD value of holdings
const usdBalance = await customUSDT.getBalanceInUSD(accountAddress);
// Returns: Balance in USD (18 decimals)
```

## Chainlink Price Feeds

The contract uses Chainlink's decentralized price feeds:

- **Ethereum Mainnet:** ETH/USD at `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8019`
- **Sepolia Testnet:** ETH/USD at `0x694AA1769357215DE4FAC081bf1f309adC325306`

To update the price feed:

```javascript
await customUSDT.updatePriceFeed(newPriceFeedAddress);
```

## DEX and CEX Compatibility

This token is fully compatible with:

### Decentralized Exchanges (DEX)

- Uniswap (V2, V3)
- SushiSwap
- Curve Finance
- Balancer
- And all other ERC-20 compatible DEXs

### Centralized Exchanges (CEX)

- Binance
- Coinbase
- Kraken
- Huobi
- And all other ERC-20 supporting CEXs

**Steps to add token:**

1. Provide token contract address to exchange
2. Provide ABI (available in `artifacts/contracts/CustomUSDT.sol/CustomUSDT.json`)
3. Exchange will integrate for deposits/withdrawals

## Key Differences from Official USDT

| Feature | CustomUSDT | Official USDT |
| --------- | ----------- | ------------- |
| Contract Address | Custom | 0xdAC17F958D2ee523a2206206994597C13D831ec7 |
| 6-Month Auto-Burn | ✅ Yes (50%) | ❌ No |
| Price Feed | ✅ Chainlink | ❌ Centralized |
| Total Supply | Fixed (1B) | Variable (mutable) |
| Initial Holder Tracking | ✅ Yes | ❌ No |

## Security Considerations

- ✅ Uses OpenZeppelin audited ERC20 contracts
- ✅ Chainlink oracle for tamper-proof prices
- ✅ Burn mechanism is automatic and irreversible
- ✅ All events are emitted for transparency
- ⚠️ Always verify contract on Etherscan
- ⚠️ Never share your private key
- ⚠️ Test thoroughly on testnet before mainnet

## Contract Verification on Etherscan

After deployment, verify your contract:

```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS INITIAL_SUPPLY PRICE_FEED_ADDRESS
```

Example:

```bash
npx hardhat verify --network sepolia 0x1234...abcd 1000000000 0x694AA1769357215DE4FAC081bf1f309adC325306
```

## Gas Optimization

- Optimizer enabled with 200 runs
- Efficient storage packing
- Minimal external calls
- Optimized burn logic

## Burn Trigger Example

```javascript
const { ethers } = require("ethers");

const tokenABI = [...]; // Load from ABI file
const contractAddress = "0x...";

const provider = new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/...");
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const token = new ethers.Contract(contractAddress, tokenABI, signer);

// Check eligibility
const isEligible = await token.isEligibleForBurn("0x...");
console.log("Eligible for burn:", isEligible);

// Trigger burn
if (isEligible) {
  const tx = await token.autoBurnAfterHoldingPeriod("0x...");
  console.log("Burn triggered:", tx.hash);
}
```

## Troubleshooting

### "Invalid price feed address"

- Ensure you're using the correct Chainlink price feed for your network
- Verify the address is not zero address

### "Holder is not eligible for burn yet"

- 6 months (180 days) must have passed since distribution
- Use `getTimeUntilBurnEligible()` to check remaining time

### "Array length mismatch" when adding holders

- Ensure addresses array and amounts array have the same length

### Transaction reverted with no reason

- Check gas limit
- Verify sender has enough balance for gas fees
- Ensure token has enough liquidity for transfers

## License

MIT License - See LICENSE file

## Support

For issues or questions:

1. Check [Hardhat documentation](https://hardhat.org/docs)
2. Review [OpenZeppelin ERC20](https://docs.openzeppelin.com/contracts/5.x/erc20)
3. Check [Chainlink Price Feeds](https://docs.chain.link/data-feeds)

## Disclaimer

This is a custom token implementation. The developers and contributors assume no liability for:

- Smart contract vulnerabilities
- Financial losses
- Regulatory compliance issues in your jurisdiction

Always conduct thorough code audits and testing before production deployment.
