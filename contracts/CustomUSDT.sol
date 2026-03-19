// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title CustomUSDT
 * @dev Custom USDT token with auto-burn after 6 months and Chainlink price oracle integration
 */
contract CustomUSDT is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    // Chainlink Price Feed for USD/ETH
    AggregatorV3Interface public priceFeed;

    // 6 months in seconds (180 days)
    uint256 public constant BURN_DURATION = 180 days;

    // Track holder information
    struct HolderInfo {
        uint256 holdingStartTime;
        uint256 burnedAmount;
        bool isInitialHolder;
    }

    mapping(address => HolderInfo) public holders;
    address[] public initialHolders;

    // Events
    event BurnTriggered(address indexed holder, uint256 amount, uint256 timestamp);
    event InitialHolderAdded(address indexed holder, uint256 amount);
    event PriceFeedUpdated(address indexed newPriceFeed);

    /**
     * @dev Initialize the token with initial supply
     * @param initialSupply Initial token supply (with 6 decimals like USDT)
     * @param priceFeedAddress Chainlink price feed address
     */
    constructor(
        uint256 initialSupply,
        address priceFeedAddress
    ) ERC20("Tether USD", "USDT") ERC20Permit("Tether USD") {
        require(priceFeedAddress != address(0), "Invalid price feed address");

        priceFeed = AggregatorV3Interface(priceFeedAddress);

        // Mint initial supply
        _mint(msg.sender, initialSupply * 10 ** decimals());

        // Mark deployer as initial holder
        holders[msg.sender] = HolderInfo({
            holdingStartTime: block.timestamp,
            burnedAmount: 0,
            isInitialHolder: true
        });

        initialHolders.push(msg.sender);

        emit InitialHolderAdded(msg.sender, initialSupply * 10 ** decimals());
    }

    /**
     * @dev Override decimals to match USDT (6 decimals)
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @dev Get current price in USD using Chainlink oracle
     * @return price Current ETH/USD price
     */
    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        return uint256(price) * 10 ** 10; // Convert to 18 decimals
    }

    /**
     * @dev Get balance in USD for an address
     * @param account Address to get balance for
     * @return balanceInUSD Balance in USD (18 decimals)
     */
    function getBalanceInUSD(address account) public view returns (uint256) {
        uint256 tokenBalance = balanceOf(account);
        uint256 pricePerToken = getLatestPrice() / (10 ** 12); // Price per USDT token
        return (tokenBalance * pricePerToken) / 10 ** 6;
    }

    /**
     * @dev Check if holder is eligible for burn (6 months passed)
     * @param holder Address of the holder
     * @return isEligible True if 6 months have passed since holding started
     */
    function isEligibleForBurn(address holder) public view returns (bool) {
        if (balanceOf(holder) == 0) return false;

        HolderInfo memory info = holders[holder];
        return block.timestamp >= info.holdingStartTime + BURN_DURATION;
    }

    /**
     * @dev Get time remaining until burn eligibility
     * @param holder Address of the holder
     * @return timeRemaining Seconds until eligible for burn
     */
    function getTimeUntilBurnEligible(address holder) public view returns (uint256) {
        HolderInfo memory info = holders[holder];
        uint256 eligibleTime = info.holdingStartTime + BURN_DURATION;

        if (block.timestamp >= eligibleTime) return 0;
        return eligibleTime - block.timestamp;
    }

    /**
     * @dev Auto-burn tokens after 6 months of holding
     * Anyone can trigger this for any holder
     * @param holder Address of the holder to burn tokens for
     * @return burnAmount Amount of tokens burned
     */
    function autoBurnAfterHoldingPeriod(address holder) public returns (uint256) {
        require(holders[holder].isInitialHolder, "Not an initial holder");
        require(isEligibleForBurn(holder), "Holder is not eligible for burn yet");

        uint256 tokenBalance = balanceOf(holder);
        require(tokenBalance > 0, "No tokens to burn");

        // Burn 50% of the balance
        uint256 burnAmount = tokenBalance / 2;

        holders[holder].burnedAmount += burnAmount;

        // Execute burn
        _burn(holder, burnAmount);

        emit BurnTriggered(holder, burnAmount, block.timestamp);

        return burnAmount;
    }

    /**
     * @dev Override transfer to track holding periods
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = _msgSender();

        // Initialize holder info if not exists
        if (holders[to].holdingStartTime == 0) {
            holders[to] = HolderInfo({
                holdingStartTime: block.timestamp,
                burnedAmount: 0,
                isInitialHolder: false
            });
        }

        _transfer(owner, to, amount);
        return true;
    }

    /**
     * @dev Override transferFrom to track holding periods
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        address spender = _msgSender();

        // Initialize holder info if not exists
        if (holders[to].holdingStartTime == 0) {
            holders[to] = HolderInfo({
                holdingStartTime: block.timestamp,
                burnedAmount: 0,
                isInitialHolder: false
            });
        }

        _approve(from, spender, allowance(from, spender) - amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Add initial holders during launch
     * Only owner can call this
     * @param _holders Array of holder addresses
     * @param _amounts Array of amounts for each holder
     */
    function addInitialHolders(
        address[] calldata _holders,
        uint256[] calldata _amounts
    ) external onlyOwner {
        require(_holders.length == _amounts.length, "Array length mismatch");

        for (uint256 i = 0; i < _holders.length; i++) {
            require(_holders[i] != address(0), "Invalid address");

            // Transfer tokens to holder
            _transfer(msg.sender, _holders[i], _amounts[i]);

            // Mark as initial holder
            if (holders[_holders[i]].holdingStartTime == 0) {
                holders[_holders[i]] = HolderInfo({
                    holdingStartTime: block.timestamp,
                    burnedAmount: 0,
                    isInitialHolder: true
                });
            } else {
                holders[_holders[i]].isInitialHolder = true;
            }

            initialHolders.push(_holders[i]);

            emit InitialHolderAdded(_holders[i], _amounts[i]);
        }
    }

    /**
     * @dev Update the Chainlink price feed address
     * Only owner can call this
     * @param newPriceFeed New price feed address
     */
    function updatePriceFeed(address newPriceFeed) external onlyOwner {
        require(newPriceFeed != address(0), "Invalid price feed address");
        priceFeed = AggregatorV3Interface(newPriceFeed);
        emit PriceFeedUpdated(newPriceFeed);
    }

    /**
     * @dev Get all initial holders
     * @return Array of initial holder addresses
     */
    function getInitialHolders() external view returns (address[] memory) {
        return initialHolders;
    }

    /**
     * @dev Get holder information
     * @param holder Address of the holder
     * @return info Holder information structure
     */
    function getHolderInfo(address holder)
        external
        view
        returns (HolderInfo memory)
    {
        return holders[holder];
    }
}
