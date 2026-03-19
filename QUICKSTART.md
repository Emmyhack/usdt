# Quick Start Guide for CustomUSDT

## ⚡ Quick Start

### 1. Setup

```bash
npm install
cp .env.example .env
# Edit .env with your RPC URLs and private key
```

### 2. Deploy

```bash
# To testnet (Sepolia)
npm run deploy:sepolia

# To mainnet (requires realistic setup)
npm run deploy:ethereum
```

### 3. Distribute Tokens

```bash
# Edit scripts/bulkTransfer.js with your recipient addresses and amounts
node scripts/bulkTransfer.js --network sepolia
```

### 4. Monitor Burns

```bash
# Check if accounts are eligible for burn
node scripts/interact.js --network sepolia
```

## 📋 Key Concepts

### Initial Holders

* First recipients of the token
* Can trigger auto-burn after 6 months
* Tracked in contract state

### Auto-Burn (6-Month Mechanism)

* Starts counting from distribution date
* 50% of balance is burned
* Any account can trigger after 6 months pass
* Burn is automatic and irreversible

### Price Oracle

* Connected to Chainlink
* Updates every block
* Shows real-time USD value
* Works on mainnet (may need mock on testnet)

## 🔐 Security Tips

1. **Never share your private key**
2. **Test on testnet first**
3. **Verify contract on Etherscan after deployment**
4. **Use hardware wallet for mainnet**
5. **Double-check recipient addresses**

## 🚀 Production Deployment Checklist

* [ ] Test on Sepolia thoroughly
* [ ] Verify contract on Etherscan
* [ ] Set up monitoring and logging
* [ ] Plan distribution strategy
* [ ] Document all transactions
* [ ] Set up automated burn triggers
* [ ] Monitor for vulnerabilities
* [ ] Communicate roadmap to community

## 📞 Support

* [Hardhat Docs](https://hardhat.org)
* [OpenZeppelin](https://docs.openzeppelin.com)
* [Chainlink](https://docs.chain.link)
* [Ethereum](https://ethereum.org/developers)

## 💡 Tips for DEX/CEX Integration

1. **Uniswap V3 Liquidity Pool:**

```bash
npx hardhat run scripts/uniswapIntegration.js
```

1. **Token Logo/Metadata:**

   * Use same USDT logo URL
   * Set correct contract name/symbol
   * Add to [token list](https://tokenlists.org)

1. **Exchange Listing:**

   * Provide verified contract ABI
   * Submit listing request with token details
   * Prepare marketing materials

## 🎯 Next Steps

1. Customize token parameters in contracts
2. Set up automated monitoring
3. Create governance structure if needed
4. Plan tokenomics and distribution
5. Build community engagement tools
