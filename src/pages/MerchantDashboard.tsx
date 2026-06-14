import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { QRCodeSVG } from 'qrcode.react';
import { ethers } from 'ethers';
import { PROCESSOR_ABI } from '../config/abi';
import addresses from '../config/contractAddresses.json';
import { ArrowDownLeft, Store, QrCode, LogIn } from 'lucide-react';
import { format } from 'date-fns';

export default function MerchantDashboard() {
  const { t } = useLanguage();
  const { address, provider, aedBalance } = useWallet();
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [salesToday, setSalesToday] = useState(0);

  useEffect(() => {
    if (address && provider) {
      fetchTransactions();
      
      // Auto refresh every 10s
      const interval = setInterval(fetchTransactions, 10000);
      return () => clearInterval(interval);
    }
  }, [address, provider]);

  const fetchTransactions = async () => {
    if (!provider || !address) return;
    try {
      const processor = new ethers.Contract(addresses.PAYMENT_PROCESSOR_ADDRESS, PROCESSOR_ABI, provider);
      const allTx = await processor.getAllTransactions();
      
      const myTxs = allTx
        .filter((tx: any) => tx.merchant.toLowerCase() === address.toLowerCase())
        .map((tx: any) => ({
          customer: tx.customer,
          amount: ethers.formatUnits(tx.amount, 18),
          timestamp: Number(tx.timestamp) * 1000
        }))
        .sort((a: any, b: any) => b.timestamp - a.timestamp);

      setTransactions(myTxs);

      const today = new Date();
      today.setHours(0,0,0,0);
      
      const todaySales = myTxs
        .filter((tx: any) => tx.timestamp >= today.getTime())
        .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);
        
      setSalesToday(todaySales);
    } catch(err) {
      console.error(err);
    }
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
           <Store className="w-8 h-8 text-purple-400" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-2">Merchant Access Required</h2>
         <p className="text-gray-400 mb-6">Please connect your wallet to access the merchant dashboard.</p>
      </div>
    );
  }

  const paymentUrl = `${window.location.origin}/pay/${address}?amount=${amount}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Store className="w-8 h-8 text-amber-500 mr-3 rtl:ml-3" />
        <h1 className="text-3xl font-bold text-white">{t('merchant.dashboard')}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1a1429] rounded-2xl p-6 border border-purple-900/50">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{t('balance.title')}</h3>
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
            {parseFloat(aedBalance).toFixed(2)} <span className="text-xl text-purple-500">AEDc</span>
          </div>
        </div>

        <div className="bg-[#1a1429] rounded-2xl p-6 border border-purple-900/50">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{t('sales.today')}</h3>
          <div className="text-3xl font-bold text-white">
            {salesToday.toFixed(2)} <span className="text-xl text-gray-500">AEDc</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-[#1a1429] rounded-2xl p-6 border border-purple-900/50 flex flex-col items-center text-center">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <QrCode className="w-5 h-5 mr-2 rtl:ml-2 text-purple-400" />
              {t('payment.request')}
            </h3>
            
            <div className="w-full mb-6">
              <label className="block text-left text-sm font-medium text-gray-400 mb-2">{t('amount.aed')}</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0f0a1f] border border-purple-800 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.2)]">
              <QRCodeSVG 
                value={paymentUrl} 
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#0f0a1f"}
                level={"Q"}
              />
            </div>
            {amount && Number(amount) > 0 && (
              <p className="mt-4 text-sm text-green-400">Scan to pay {amount} AEDc</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-[#1a1429] rounded-2xl p-6 border border-purple-900/50 min-h-[400px]">
             <h3 className="text-xl font-semibold mb-6">{t('recent.transactions')}</h3>
             
             {transactions.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                 <Store className="w-12 h-12 mb-3 opacity-20" />
                 <p>No transactions found</p>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-purple-900/50 text-gray-400 text-sm">
                       <th className="pb-3 px-4 font-medium">{t('customer')}</th>
                       <th className="pb-3 px-4 font-medium">{t('amount')}</th>
                       <th className="pb-3 px-4 font-medium">{t('date')}</th>
                     </tr>
                   </thead>
                   <tbody>
                     {transactions.map((tx, idx) => (
                       <tr key={idx} className="border-b border-purple-900/20 hover:bg-purple-900/10 transition-colors">
                         <td className="py-4 px-4 font-mono text-sm text-purple-300">
                           {tx.customer.slice(0,6)}...{tx.customer.slice(-4)}
                         </td>
                         <td className="py-4 px-4">
                           <span className="inline-flex items-center text-green-400 font-medium">
                             <ArrowDownLeft className="w-4 h-4 mr-1 rtl:ml-1" />
                             +{parseFloat(tx.amount).toFixed(2)}
                           </span>
                         </td>
                         <td className="py-4 px-4 text-gray-400 text-sm">
                           {format(new Date(tx.timestamp), 'PPp')}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
