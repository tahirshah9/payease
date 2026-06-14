import { ethers } from "ethers";
import contractAddresses from "./contractAddresses.json";

export const POLYGON_AMOY_CHAIN_ID = 80002;

export const formatAed = (amount: bigint | string) => {
  return ethers.formatUnits(amount, 18);
};

export const parseAed = (amount: string) => {
  return ethers.parseUnits(amount, 18);
};

export const setupNetwork = async () => {
  if (!window.ethereum) throw new Error("No crypto wallet found");
  
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ethers.toBeHex(POLYGON_AMOY_CHAIN_ID) }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      // Chain not added
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: ethers.toBeHex(POLYGON_AMOY_CHAIN_ID),
            chainName: "Polygon Amoy Testnet",
            rpcUrls: ["https://rpc-amoy.polygon.technology/"],
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18,
            },
            blockExplorerUrls: ["https://amoy.polygonscan.com/"],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
};
