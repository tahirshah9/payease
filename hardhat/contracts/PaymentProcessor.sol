// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Simple ERC20 for Loyalty Points
contract LoyaltyPoints is IERC20, Ownable {
    // Basic ERC20 State
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    string public name = "PayEase Loyalty Points";
    string public symbol = "PEPTS";
    uint8 public decimals = 18;

    address public paymentProcessor;

    constructor() Ownable(msg.sender) {}

    function setPaymentProcessor(address _processor) external onlyOwner {
        paymentProcessor = _processor;
    }

    modifier onlyProcessor() {
        require(msg.sender == paymentProcessor, "Only PaymentProcessor can mint");
        _;
    }

    function mint(address to, uint256 amount) external onlyProcessor {
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyProcessor {
        require(_balances[from] >= amount, "Insufficient points");
        _balances[from] -= amount;
        _totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    // Standard ERC20 Functions
    function totalSupply() external view returns (uint256) { return _totalSupply; }
    function balanceOf(address account) external view returns (uint256) { return _balances[account]; }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Allowance exceeded");
        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

/**
 * @title PaymentProcessor
 * @dev Handles merchant payments in AEDc and automatically issues Loyalty Points.
 */
contract PaymentProcessor is Ownable {
    IERC20 public aedToken;
    LoyaltyPoints public loyaltyPoints;

    struct Transaction {
        address customer;
        address merchant;
        uint256 amount;
        uint256 pointsEarned;
        uint256 timestamp;
    }

    Transaction[] public transactions;

    uint256 public pointsPerAed = 1; // 1 AEDc = 1 Point
    uint256 public discountPer100Points = 1; // 100 Points = 1 AEDc discount

    event PaymentProcessed(address indexed customer, address indexed merchant, uint256 amount, uint256 pointsEarned);
    event PointsRedeemed(address indexed customer, address indexed merchant, uint256 discountAmount, uint256 pointsBurned);

    constructor(address _aedToken, address _loyaltyPoints) Ownable(msg.sender) {
        aedToken = IERC20(_aedToken);
        loyaltyPoints = LoyaltyPoints(_loyaltyPoints);
    }

    /**
     * @dev Process standard payment without redemption
     */
    function processPayment(address merchant, uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        
        // Transfer AEDc from customer to merchant
        bool success = aedToken.transferFrom(msg.sender, merchant, amount);
        require(success, "Payment transfer failed");

        // Calculate and mint loyalty points
        uint256 scaledAmount = amount / (10 ** 18); // Assume 18 decimals
        uint256 pointsToMint = scaledAmount * pointsPerAed * (10 ** 18);
        
        if(pointsToMint > 0) {
            loyaltyPoints.mint(msg.sender, pointsToMint);
        }

        transactions.push(Transaction({
            customer: msg.sender,
            merchant: merchant,
            amount: amount,
            pointsEarned: pointsToMint,
            timestamp: block.timestamp
        }));

        emit PaymentProcessed(msg.sender, merchant, amount, pointsToMint);
    }

    /**
     * @dev Process payment and redeem points for a discount
     */
    function processPaymentWithRedemption(address merchant, uint256 amount, uint256 pointsToRedeem) external {
        require(amount > 0, "Amount must be greater than zero");
        require(pointsToRedeem >= 100 * (10 ** 18), "Minimum 100 points to redeem");
        
        // Calculate the discount in AEDc
        uint256 scaledPoints = pointsToRedeem / (10 ** 18);
        uint256 discountInAed = (scaledPoints / 100) * discountPer100Points * (10 ** 18);
        
        uint256 finalAmount = amount;
        if(discountInAed >= amount) {
            finalAmount = 0; // Free (or dust remaining ignored for simplicity here)
            // Adjust points burned so we only burn what's necessary (simplified logic for hackathon)
        } else {
            finalAmount = amount - discountInAed;
        }

        // Burn points
        loyaltyPoints.burn(msg.sender, pointsToRedeem);

        // Process final payment if > 0
        if(finalAmount > 0) {
            bool success = aedToken.transferFrom(msg.sender, merchant, finalAmount);
            require(success, "Payment transfer failed");
        }

        transactions.push(Transaction({
            customer: msg.sender,
            merchant: merchant,
            amount: finalAmount,
            pointsEarned: 0, // Don't earn points on redemption txs to prevent loops
            timestamp: block.timestamp
        }));

        emit PointsRedeemed(msg.sender, merchant, discountInAed, pointsToRedeem);
        emit PaymentProcessed(msg.sender, merchant, finalAmount, 0);
    }

    function getTransactionCount() external view returns(uint256) {
        return transactions.length;
    }
    
    function getAllTransactions() external view returns (Transaction[] memory) {
        return transactions;
    }
}
