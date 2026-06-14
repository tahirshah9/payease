import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { ethers } from 'ethers';
import { AED_ABI, PROCESSOR_ABI } from '../config/abi';
import addresses from '../config/contractAddresses.json';
import { Store, Wallet as WalletIcon, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export default function CustomerPayment() {
  const { merchantAddress } = useParams();
  const [searchParams] = useSearchParams();
  const requestedAmount = searchParams.get('amount') || '';
  
  const { t } = useLanguage();
  const { address, provider, connect, isConnecting, aedBalance, loyaltyBalance, refreshBalances } = useWallet();
  const navigate = useNavigate();

  const [amount, setAmount] = useState(requestedAmount);
  const [status, setStatus] = useState<'idle' | 'approving' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [usePoints, setUsePoints] = useState(false);

  // Auto calculate point discount (100 pts = 1 AEDc)
  const pointsAvailable = parseFloat(loyaltyBalance);
  const maxDiscountAed = Math.floor(pointsAvailable / 100) * 1;
  const applicableDiscount = Math.min(maxDiscountAed, parseFloat(amount || '0'));
  const pointsToRedeem = applicableDiscount * 100;
  const finalAmount = Math.max(0, parseFloat(amount || '0') - (usePoints ? applicableDiscount : 0));

  const handlePay = async () => {
    if (!merchantAddress || !amount || parseFloat(amount) <= 0) return;
    if (!provider || !address) {
      await connect();
      if(!provider) return;
    }

    try {
      setStatus('approving');
      setErrorMsg('');
      const signer = await provider!.getSigner();
      
      const parsedAmount = ethers.parseUnits(amount, 18);
      const parsedFinalAmount = ethers.parseUnits(finalAmount.toString(), 18);
      const parsedPoints = ethers.parseUnits(pointsToRedeem.toString(), 18);

      const aedToken = new ethers.Contract(addresses.AED_TOKEN_ADDRESS, AED_ABI, signer);
      
      // Check allowance if we are actually paying > 0
      if(finalAmount > 0) {
        const allowance = await aedToken.allowance(address, addresses.PAYMENT_PROCESSOR_ADDRESS);
        if (allowance < parsedFinalAmount) {
          const tx1 = await aedToken.approve(addresses.PAYMENT_PROCESSOR_ADDRESS, parsedFinalAmount);
          await tx1.wait();
        }
      }

      setStatus('processing');
      const processor = new ethers.Contract(addresses.PAYMENT_PROCESSOR_ADDRESS, PROCESSOR_ABI, signer);
      
      let tx2;
      if (usePoints && pointsToRedeem >= 100) {
        tx2 = await processor.processPaymentWithRedemption(merchantAddress, parsedAmount, parsedPoints);
      } else {
        tx2 = await processor.processPayment(merchantAddress, parsedAmount);
      }
      
      await tx2.wait();
      setStatus('success');
      await refreshBalances();
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.reason || err.message || "Transaction failed");
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border-4 border-green-500/50">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">{t('payment.success')}</h2>
        <p className="text-gray-400 mb-8 max-w-sm">
          Successfully sent <span className="text-white font-medium">{finalAmount.toFixed(2)} AEDc</span> to the merchant.
          {!usePoints && parseFloat(amount) > 0 && (
             <span className="block mt-2 text-amber-400 text-sm">
               You earned {Math.floor(parseFloat(amount))} Loyalty Points!
             </span>
          )}
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-medium transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-4">
      <div className="bg-[#1a1429] rounded-3xl p-8 border border-purple-900/50 shadow-2xl relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-700/50">
            <Store className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Pay Merchant</h2>
          <p className="text-gray-400 font-mono text-xs break-all px-4">{merchantAddress}</p>
        </div>

        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t('amount.aed')}</label>
            <div className="relative">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                readOnly={!!requestedAmount}
                className={clsx(
                  "w-full bg-[#0f0a1f] border rounded-xl px-4 py-4 text-white text-2xl font-semibold text-center focus:outline-none transition-colors",
                  requestedAmount ? "border-purple-900/50 bg-[#0f0a1f]/50" : "border-purple-800 focus:border-amber-500"
                )}
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 font-medium">AEDc</span>
            </div>
          </div>

          {address && pointsAvailable >= 100 && parseFloat(amount || '0') > 0 && (
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 flex items-start space-x-3 rtl:space-x-reverse cursor-pointer" onClick={() => setUsePoints(!usePoints)}>
              <input 
                type="checkbox" 
                checked={usePoints} 
                onChange={(e) => setUsePoints(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-amber-500 text-amber-500 focus:ring-amber-500 focus:ring-offset-[#1a1429] bg-transparent"
              />
              <div className="flex-1">
                <p className="text-amber-400 font-medium flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 rtl:ml-1" /> Redeem Points
                </p>
                <p className="text-xs text-amber-200/70 mt-1">
                  Use {pointsToRedeem} pts to save {applicableDiscount} AEDc. Your balance: {pointsAvailable} pts.
                </p>
              </div>
            </div>
          )}

          {usePoints && applicableDiscount > 0 && (
            <div className="flex justify-between items-center text-sm border-t border-purple-900/50 pt-4">
               <span className="text-gray-400">Original Amount:</span>
               <span className="text-gray-400 line-through">{amount} AEDc</span>
            </div>
          )}

          <div className="flex justify-between items-center text-lg font-bold border-t border-purple-900/50 pt-4">
             <span className="text-white">Total to Pay:</span>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
               {finalAmount.toFixed(2)} AEDc
             </span>
          </div>

          {status === 'error' && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={status === 'approving' || status === 'processing' || !amount || parseFloat(amount) <= 0}
            className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
          >
            {status === 'approving' || status === 'processing' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 rtl:ml-2 animate-spin" />
                {status === 'approving' ? 'Approving AEDc...' : 'Processing Payment...'}
              </>
            ) : !address ? (
              <>
                <WalletIcon className="w-5 h-5 mr-2 rtl:ml-2" />
                {t('wallet.connect')}
              </>
            ) : (
              t('payment.confirm')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
