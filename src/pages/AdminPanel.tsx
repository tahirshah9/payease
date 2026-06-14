import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { ethers } from 'ethers';
import { PROCESSOR_ABI } from '../config/abi';
import addresses from '../config/contractAddresses.json';
import { BarChart3, Download } from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminPanel() {
  const { t } = useLanguage();
  const { provider } = useWallet();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (provider) fetchAllTransactions();
  }, [provider]);

  const fetchAllTransactions = async () => {
    try {
      const processor = new ethers.Contract(addresses.PAYMENT_PROCESSOR_ADDRESS, PROCESSOR_ABI, provider);
      const allTx = await processor.getAllTransactions();
      
      const formatted = allTx.map((tx: any) => ({
        customer: tx.customer,
        merchant: tx.merchant,
        amount: ethers.formatUnits(tx.amount, 18),
        points: ethers.formatUnits(tx.pointsEarned, 18),
        timestamp: Number(tx.timestamp) * 1000
      })).sort((a: any, b: any) => b.timestamp - a.timestamp);

      setTransactions(formatted);

      // Process chart data (sales by day)
      const dataMap = new Map();
      formatted.forEach((tx: any) => {
        const dateStr = format(new Date(tx.timestamp), 'MMM dd');
        const current = dataMap.get(dateStr) || 0;
        dataMap.set(dateStr, current + parseFloat(tx.amount));
      });

      const cData = Array.from(dataMap.entries()).map(([date, amount]) => ({
        date,
        amount
      })).reverse();

      setChartData(cData);
    } catch(err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ['Date', 'Customer', 'Merchant', 'Amount (AEDc)', 'Points Earned'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        new Date(tx.timestamp).toISOString(),
        tx.customer,
        tx.merchant,
        tx.amount,
        tx.points
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'payease_transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <BarChart3 className="w-8 h-8 text-purple-500 mr-3 rtl:ml-3" />
          <h1 className="text-3xl font-bold text-white">System Admin Panel</h1>
        </div>
        <button 
          onClick={exportCSV}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors border border-gray-700"
        >
          <Download className="w-4 h-4 mr-2 rtl:ml-2" /> Export CSV
        </button>
      </div>

      <div className="bg-[#1a1429] rounded-2xl p-6 border border-purple-900/50 mb-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-200">Network Transaction Volume (AEDc)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#37305a" vertical={false} />
              <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} />
              <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f0a1f', borderColor: '#4c1d95', borderRadius: '8px' }}
                itemStyle={{ color: '#fbbf24' }}
              />
              <Bar dataKey="amount" fill="#9333ea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1a1429] rounded-2xl p-6 border border-purple-900/50">
         <h3 className="text-xl font-semibold mb-6">Global Transaction Log</h3>
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-purple-900/50 text-gray-400 text-sm">
                 <th className="pb-3 px-4 font-medium">Date</th>
                 <th className="pb-3 px-4 font-medium">Customer</th>
                 <th className="pb-3 px-4 font-medium">Merchant</th>
                 <th className="pb-3 px-4 font-medium">Amount</th>
               </tr>
             </thead>
             <tbody>
               {transactions.map((tx, idx) => (
                 <tr key={idx} className="border-b border-purple-900/20 hover:bg-purple-900/10 transition-colors">
                   <td className="py-3 px-4 text-gray-400 text-sm">
                     {format(new Date(tx.timestamp), 'PPp')}
                   </td>
                   <td className="py-3 px-4 font-mono text-sm text-purple-400">
                     {tx.customer.slice(0,6)}...{tx.customer.slice(-4)}
                   </td>
                   <td className="py-3 px-4 font-mono text-sm text-pink-400">
                     {tx.merchant.slice(0,6)}...{tx.merchant.slice(-4)}
                   </td>
                   <td className="py-3 px-4 text-white font-medium">
                     {tx.amount} AEDc
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
