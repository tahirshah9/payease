export const AED_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function requestTokens(uint256 amount) external"
];

export const LOYALTY_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

export const PROCESSOR_ABI = [
  "function processPayment(address merchant, uint256 amount) external",
  "function processPaymentWithRedemption(address merchant, uint256 amount, uint256 pointsToRedeem) external",
  "function getTransactionCount() external view returns (uint256)",
  "function getAllTransactions() external view returns (tuple(address customer, address merchant, uint256 amount, uint256 pointsEarned, uint256 timestamp)[])"
];
