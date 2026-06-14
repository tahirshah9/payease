import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { Link } from 'react-router-dom';
import { Store, Wallet as WalletIcon, BarChart3, ShieldCheck, Zap, Coins } from 'lucide-react';
import { ethers } from 'ethers';
import addresses from '../config/contractAddresses.json';
import { AED_ABI } from '../config/abi';

export default function Home() {
  const { t } = useLanguage();
  const { address, provider } = useWallet();

  const handleFaucet = async () => {
    if(!provider || !address) return alert("Connect wallet first!");
    try {
      const signer = await provider.getSigner();
      const aed = new ethers.Contract(addresses.AED_TOKEN_ADDRESS, AED_ABI, signer);
      const tx = await aed.requestTokens(ethers.parseUnits("1000", 18));
      await tx.wait();
      alert("Requested 1000 AEDc from test faucet successfully!");
      window.location.reload();
    } catch(err) {
      console.error(err);
      alert("Faucet failed. See console.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 space-y-12">
      <div className="text-center max-w-2xl space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-purple-900/30 rounded-full mb-4 border border-purple-500/20">
          <ShieldCheck className="w-6 h-6 text-amber-400 mr-2 rtl:ml-2" />
          <span className="text-purple-300 font-medium">Polygon Amoy Testnet</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-amber-200 to-amber-500">
          PayEase
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed max-w-xl mx-auto">
          The smart AED stablecoin payment infrastructure for UAE merchants and tourists.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link to="/merchant" className="group relative bg-[#1a1429] border border-purple-900/50 hover:border-purple-500/50 rounded-2xl p-8 transition-all hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="w-14 h-14 bg-purple-900/40 rounded-xl flex items-center justify-center mb-6 border border-purple-700/30">
            <Store className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('home.merchant')}</h2>
          <p className="text-gray-400 mb-6">Manage your business, generate QR codes, and track AEDc payments instantly with zero fees.</p>
          <div className="inline-flex items-center text-purple-400 font-medium group-hover:text-purple-300">
            Launch Dashboard <Zap className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* Note: The physical application would use QR scan directly. Here we simulate a tourist clicking to pay a dummy merchant. */}
        <Link to="/pay/0x2546BcD3c84621e976D8185a91A922aE77ECEc30" className="group relative bg-[#1a1429] border border-purple-900/50 hover:border-amber-500/50 rounded-2xl p-8 transition-all hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="w-14 h-14 bg-amber-900/40 rounded-xl flex items-center justify-center mb-6 border border-amber-700/30">
            <WalletIcon className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('home.tourist')}</h2>
          <p className="text-gray-400 mb-6">Seamlessly pay merchants in AED stablecoins and instantly earn loyalty points on every purchase.</p>
          <div className="inline-flex items-center text-amber-400 font-medium group-hover:text-amber-300">
            Simulate Payment <Zap className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>

      {address && (
          <div className="mt-8 flex flex-col items-center border border-gray-800 rounded-xl p-6 bg-[#120d1c]">
             <Coins className="w-8 h-8 text-yellow-500 mb-2"/>
             <h3 className="text-lg font-medium text-white mb-1">Developer Faucet</h3>
             <p className="text-sm text-gray-400 mb-4">Get demo AEDc tokens for testing on Polygon Amoy.</p>
             <button onClick={handleFaucet} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 transition-colors text-sm font-medium">
               Request 1000 AEDc
             </button>
          </div>
      )}
    </div>
  );
}
