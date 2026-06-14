/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { WalletProvider } from './contexts/WalletContext';
import Header from './components/Header';
import Home from './pages/Home';
import MerchantDashboard from './pages/MerchantDashboard';
import CustomerPayment from './pages/CustomerPayment';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <LanguageProvider>
      <WalletProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#0f0a1f] text-gray-100 font-sans selection:bg-purple-500/30">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/merchant" element={<MerchantDashboard />} />
                <Route path="/pay/:merchantAddress" element={<CustomerPayment />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </WalletProvider>
    </LanguageProvider>
  );
}

