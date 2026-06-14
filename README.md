# PayEase - AED Stablecoin Merchant Payment System

A blockchain-based point-of-sale system tailored for the UAE market, running on the Polygon Amoy testnet. It provides merchants with a dashboard to generate QR codes, allowing tourists to pay efficiently with AED stablecoins, and incorporates an automatic loyalty points system.

## Setup Instructions

### 1. Smart Contracts Setup (Hardhat)

1. Navigate to the `hardhat` directory.
   ```bash
   cd hardhat
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables in a `.env` file inside the `hardhat` folder:
   ```env
   PRIVATE_KEY="your_wallet_private_key"
   POLYGON_AMOY_RPC="https://rpc-amoy.polygon.technology/"
   ```
4. Compile the contracts:
   ```bash
   npx hardhat compile
   ```
5. Deploy to Polygon Amoy Testnet:
   ```bash
   npx hardhat run scripts/deploy.js --network amoy
   ```
6. Copy the deployed contract addresses and update the configuration in `src/config/web3.ts`.

### 2. Frontend Setup (React)

1. Start the development server from the root of the project:
   ```bash
   npm run dev
   ```
2. The application will be accessible at `http://localhost:3000`.
3. To test payments, you will need the MetaMask browser extension. Ensure it is connected to the Polygon Amoy testnet and you have funded your wallet with test Amoy MATIC.

## Features

- **Merchant Dashboard**: Connect wallet, view real-time AED balance, generate payment request QR codes, view history.
- **Customer Payment Flow**: Simple mobile-friendly interface. Scan QR, see payment amount, confirm transaction via MetaMask. 
- **Loyalty Program**: Smart contract issues "PayEase Points" automatically upon every transaction, allowing users to redeem discounts later.
- **Admin Panel**: Monitor overall transactions with visual charts.

## Deployment
The frontend is optimized for deployment on Vercel. Ensure all environment variables are correctly injected into your Vercel settings.
