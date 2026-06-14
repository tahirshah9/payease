const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment on network:", hre.network.name);

  // 1. Deploy AED Stablecoin
  console.log("Deploying AED Stablecoin...");
  const AEDStablecoin = await hre.ethers.getContractFactory("AEDStablecoin");
  const aed = await AEDStablecoin.deploy();
  await aed.waitForDeployment();
  const aedAddress = await aed.getAddress();
  console.log("✅ AED Stablecoin deployed to:", aedAddress);

  // 2. Deploy Loyalty Points Token
  console.log("Deploying Loyalty Points...");
  const LoyaltyPoints = await hre.ethers.getContractFactory("LoyaltyPoints");
  const loyalty = await LoyaltyPoints.deploy();
  await loyalty.waitForDeployment();
  const loyaltyAddress = await loyalty.getAddress();
  console.log("✅ Loyalty Points deployed to:", loyaltyAddress);

  // 3. Deploy Payment Processor
  console.log("Deploying Payment Processor...");
  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
  const processor = await PaymentProcessor.deploy(aedAddress, loyaltyAddress);
  await processor.waitForDeployment();
  const processorAddress = await processor.getAddress();
  console.log("✅ Payment Processor deployed to:", processorAddress);

  // 4. Set Payment Processor in Loyalty Points contract
  console.log("Configuring Loyalty Points contract...");
  const tx = await loyalty.setPaymentProcessor(processorAddress);
  await tx.wait();
  console.log("✅ Payment processor configured for automatic point minting.");

  // Save the addresses to a frontend config file
  const frontendConfig = {
    AED_TOKEN_ADDRESS: aedAddress,
    LOYALTY_POINTS_ADDRESS: loyaltyAddress,
    PAYMENT_PROCESSOR_ADDRESS: processorAddress
  };

  const configPath = path.join(__dirname, "../../src/config/contractAddresses.json");
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(frontendConfig, null, 2));
  
  console.log("\nDeployment completed successfully!");
  console.log("Frontend configuration written to src/config/contractAddresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
