// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AEDStablecoin
 * @dev Simulated AED Stablecoin (AEDc) for testing payments on the Polygon Amoy testnet.
 */
contract AEDStablecoin is ERC20, Ownable {
    constructor() ERC20("AED Stablecoin", "AEDc") Ownable(msg.sender) {
        // Mint an initial supply of 10,000,000 AEDc to the deployer
        _mint(msg.sender, 10000000 * 10 ** decimals());
    }

    /**
     * @dev Simple faucet mechanism to allow testing
     */
    function requestTokens(uint256 amount) external {
        require(amount <= 10000 * 10 ** decimals(), "Amount too high");
        _mint(msg.sender, amount);
    }
}
