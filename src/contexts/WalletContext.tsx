import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { setupNetwork } from '../config/web3';
import { AED_ABI, PROCESSOR_ABI, LOYALTY_ABI } from '../config/abi';
import addresses from '../config/contractAddresses.json';

interface WalletContextType {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  aedBalance: string;
  loyaltyBalance: string;
  refreshBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [aedBalance, setAedBalance] = useState("0");
  const [loyaltyBalance, setLoyaltyBalance] = useState("0");

  const refreshBalances = async () => {
    if (!signer || !address || !provider) return;
    try {
      const aedContract = new ethers.Contract(addresses.AED_TOKEN_ADDRESS, AED_ABI, provider);
      const bal = await aedContract.balanceOf(address);
      setAedBalance(ethers.formatUnits(bal, 18));

      const loyaltyContract = new ethers.Contract(addresses.LOYALTY_POINTS_ADDRESS, LOYALTY_ABI, provider);
      const points = await loyaltyContract.balanceOf(address);
      setLoyaltyBalance(ethers.formatUnits(points, 18));
    } catch (err) {
      console.error("Failed to fetch balances", err);
    }
  };

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert("Please install MetaMask!");
      return;
    }
    
    setIsConnecting(true);
    try {
      await setupNetwork();
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        const _signer = await browserProvider.getSigner();
        setProvider(browserProvider);
        setSigner(_signer);
        setAddress(accounts[0]);
      }
    } catch (err) {
      console.error("Connection failed", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
    setAedBalance("0");
    setLoyaltyBalance("0");
  };

  useEffect(() => {
    if (address && provider) {
      refreshBalances();
      
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          connect(); // Reconnect with new account
        }
      };

      window.ethereum?.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [address, provider]);

  return (
    <WalletContext.Provider value={{ address, provider, signer, connect, disconnect, isConnecting, aedBalance, loyaltyBalance, refreshBalances }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
};
