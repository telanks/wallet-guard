import { useEffect, useState } from 'react';
import { WhitelistPanel } from './components/WhitelistPanel';
import { ConnectHint } from './components/ConnectHint';
import { connectMetaMask } from './wallet/metamask';
import { ScanPanel } from './components/ScanPanel';
import {RiskEventsPanel} from './components/RiskEventsPanel';
import {ApprovalTestPanel} from './components/ApprovalTestPanel';




const BSC_TESTNET_CHAIN_ID = '0x61'; // 97

export default function App() {

    const [account, setAccount] = useState<string | null>(null);
  
    /** ✅ 白名单：全局唯一来源 */
    const [whitelist, setWhitelist] = useState<string[]>([]);
  
    /** ✅ 从后端拉取白名单 */
    async function fetchWhitelist(owner: string) {
      try {
        const res = await fetch(`http://localhost:3001/whitelist/${owner}`);
        const data = await res.json();
        setWhitelist(data.spenders || []);
      } catch (e) {
        console.error('Failed to fetch whitelist', e);
        setWhitelist([]);
      }
    }

  // 1️⃣ 手动点击连接 MetaMask
  async function connectWallet() {
    try {
      const { address } = await connectMetaMask();
      setAccount(address);
      await fetch(`http://localhost:3001/wallet/setOwner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner: address }),
      });
      await fetchWhitelist(address);
    } catch (err: any) {
      alert(err?.message || 'MetaMask connection fail');
    }
  }

  function disconnectWallet() {
    setAccount(null);
    setWhitelist([]);
  }

  // 2️⃣ 页面加载时，检查是否已连接钱包
  useEffect(() => {
    async function checkConnectedAccount() {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        fetchWhitelist(accounts[0]); 
      }
    }

    checkConnectedAccount();
  }, []);

  // 3️⃣ 监听账户变化
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        setWhitelist([]);

      } else {
        setAccount(accounts[0]);
        fetchWhitelist(accounts[0]); 
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener(
        'accountsChanged',
        handleAccountsChanged
      );
    };
  }, []);

  // 4️⃣ 监听链变化（只允许 BSC Testnet）
  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = (chainId: string) => {
      if (chainId !== BSC_TESTNET_CHAIN_ID) {
        alert('请切换到 Binance Smart Chain Testnet');
        setAccount(null);
        setWhitelist([]);
      }
    };

    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener(
        'chainChanged',
        handleChainChanged
      );
    };
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-black text-gray-100 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-black">
        {Array.from({ length: 100 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="absolute top-6 right-6 z-20">
        {account ? (
          <div className="flex items-center gap-3">
            <span className="text-base text-green-400 font-medium">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <button
              onClick={disconnectWallet}
              className="text-sm px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-red-400 transition font-medium min-w-[100px]"
              style={{ color: 'oklch(63.7% 0.237 25.331)' }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            onClick={connectWallet}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 !text-green-400 rounded-lg transition duration-200 text-base font-medium min-w-[120px] shadow-lg"
            style={{ color: 'oklch(84.1% 0.238 128.85)' }}
          >
            Connect Wallet
          </button>
        )}
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[90vh]">
        <header className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-2">
            🛡 Wallet Guardian <span className="text-sm text-gray-400">(Beta)</span>
          </h1>
          <p className="text-lg text-gray-400 text-center max-w-2xl mb-8">
          Protect the security of your digital assets, conduct real-time scanning of token authorization risks, and intelligently manage the whitelist.
          </p>
        </header>

        {/* Main */}
        <main className="max-w-5xl mx-auto w-full mt-12">
          {!account ? (
            <ConnectHint />
          ) : (
            <div className="space-y-8">
              <WhitelistPanel
                owner={account}
                whitelist={whitelist}
                onRefresh={() => fetchWhitelist(account)}
              />

              <ApprovalTestPanel
                owner={account}
                whitelist={whitelist}
              />

              <ScanPanel
                owner={account}
                whitelist={whitelist}
              />

              <RiskEventsPanel
                owner={account}
              />
            </div>
          )}
        </main>
      </div>
      
    </div>
  );
}