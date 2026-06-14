import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { Wallet, Globe, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  const { lang, setLang, t } = useLanguage();
  const { address, connect, disconnect, isConnecting, aedBalance } = useWallet();

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="border-b border-purple-900/50 bg-[#0f0a1f] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">P</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-amber-400">
              PayEase
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg hover:bg-purple-900/30 text-gray-300 transition-colors flex items-center"
            title="Toggle Language"
          >
            <Globe className="w-5 h-5 mr-1 rtl:ml-1" />
            <span className="text-sm font-medium uppercase">{lang}</span>
          </button>

          {address ? (
            <div className="flex items-center space-x-3 rtl:space-x-reverse bg-purple-900/20 px-3 py-1.5 rounded-full border border-purple-800/50">
              <div className="text-sm">
                <span className="text-amber-400 font-medium">{parseFloat(aedBalance).toFixed(2)} AEDc</span>
              </div>
              <div className="w-px h-4 bg-purple-800"></div>
              <div className="text-sm text-gray-300 font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
              <button onClick={disconnect} className="text-gray-400 hover:text-red-400 transition-colors ml-2 rtl:mr-2">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:opacity-50 flex items-center"
            >
              <Wallet className="w-4 h-4 mr-2 rtl:ml-2" />
              {isConnecting ? t('processing') : t('wallet.connect')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
