// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title MockAggregatorV3
 * @dev Mock implementation of Chainlink Price Feed for testing
 */
contract MockAggregatorV3 is AggregatorV3Interface {
    int256 private _price = 200000000000; // 2000 USD per ETH (8 decimals)
    uint8 public override decimals = 8;
    string public override description = "MOCK ETH / USD";
    uint256 public override version = 4;

    function _setPrice(int256 newPrice) external {
        _price = newPrice;
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (0, _price, block.timestamp, block.timestamp, 0);
    }

    function getRoundData(uint80 _roundId)
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (_roundId, _price, block.timestamp, block.timestamp, _roundId);
    }
}
