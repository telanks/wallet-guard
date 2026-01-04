import { useState, useEffect } from 'react';

interface Props {
  owner: string; 
  whitelist: string[];
  onRefresh: () => void;
}

export function WhitelistPanel({ owner,whitelist,onRefresh }: Props) {
  const [input, setInput] = useState('');
  const [list, setList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!owner) return;
    fetchWhitelist();
  }, [owner]);

  async function fetchWhitelist() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3001/whitelist/${owner}`);
      if (!res.ok) {
        throw new Error('Failed to get the whitelist');
      }
      const data = await res.json();
      setList(data || []);
    } catch (err: any) {
      console.error('Failed to fetch whitelist:', err);
      setError(err?.message || 'Failed to get the whitelist');
    } finally {
      setLoading(false);
    }
  }

  async function add() {
    const addr = input.trim().toLowerCase();
    if (!addr.startsWith('0x') || addr.length !== 42) {
      setError('Please enter a valid Ethereum address (starting with 0x, consisting of 42 characters)');
      return;
    }
    if (list.includes(addr)) {
      setError('This address is now on the whitelist.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`http://localhost:3001/whitelist/${owner}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr }),
      });

      if (!res.ok) {
        throw new Error('add whitelist failed');
      }

      setInput('');
      setSuccess('successfully');
      fetchWhitelist(); 
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to add whitelist address:', err);
      setError(err?.message || 'add whitelist failed');
    } finally {
      setLoading(false);
    }
  }

  async function remove(addr: string) {
    if (!confirm(`Confirm to delete the address ${addr.slice(0, 6)}...${addr.slice(-4)} ?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`http://localhost:3001/whitelist/${owner}/${addr}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('delete whitelist failed');
      }

      setSuccess('successfully ');
      fetchWhitelist(); // 更新列表
      // 3秒后清除成功提示
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to remove whitelist address:', err);
      setError(err?.message || 'delete whitelist failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 border border-gray-700 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-white">
          <span className="text-2xl">✅</span> WhiteList management
        </h2>
        <p className="text-sm text-gray-400">
        Manage the authorized addresses of the tokens you trust. New authorizations that are not on the whitelist will be marked as risky.        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm flex items-center gap-2">
          <span>✓</span>
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-500 hover:text-green-300"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
        Add whitelist addresses
        </label>
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                add();
              }
            }}
            placeholder="0x..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={add}
            disabled={loading || !input.trim()}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 active:from-green-700 active:to-green-600 rounded-lg transition-all duration-200 font-semibold !text-white shadow-lg hover:shadow-xl hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg border border-green-400/20"
            style={{ 
              color: '#ffffff',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2 !text-white" style={{ color: '#ffffff' }}>
                <span className="animate-spin">⏳</span>
                <span>processed...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 !text-white" style={{ color: '#ffffff' }}>
                <span>+</span>
                <span>ADD</span>
              </span>
            )}
          </button>
        </div>
      </div> 

      {/* 白名单列表 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-200">
          WhiteList ({list.length})
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
          {loading && list.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">loading...</div>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded-lg">
              <div className="text-4xl mb-2">📝</div>
              <div className="text-sm">No whitelisted addresses available.</div>
              <div className="text-xs text-gray-600 mt-1">Add the address you trust to start using.</div>
            </div>
          ) : (
            list.map((addr) => (
              <div
                key={addr}
                className="flex justify-between items-center bg-gray-800/50 hover:bg-gray-800 px-4 py-3 rounded-lg border border-gray-700 transition group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
                  <span className="font-mono text-sm text-gray-200 break-all">
                    {addr}
                  </span>
                </div>
                <button
                  onClick={() => remove(addr)}
                  disabled={loading}
                  className="ml-4 px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 active:from-red-700 active:to-red-600 rounded-lg transition-all duration-200 font-semibold text-white flex-shrink-0 shadow-md hover:shadow-lg hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: '#ffffff' }}
                >
                  DELETE
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
