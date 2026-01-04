import { useState } from 'react';
import type {
  ApiScanResponse,
  ApiScanResultItem,
  ApiScanSummary,
  ApiRiskLevel,
} from '../types/risk';

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: string;
}

interface ScanPanelProps {
  owner: string | null;
}

export function ScanPanel({ owner }: ScanPanelProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApiScanResultItem[]>([]);
  const [summary, setSummary] = useState<ApiScanSummary | null>(null);
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function scan() {
    if (!owner) {
      setError('Add the address you trust to start using. First, connect your wallet and then scan the authorization record.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:3001/scanner/spenders/${owner}`,
        {
          method: 'GET',
        },
      );

      if (!res.ok) throw new Error('Scan failed');

      const data: ApiScanResponse = await res.json();
      setResults(data.results || []);
      setSummary(data.summary || null);
      setToken(data.token || null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Scan failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const total = summary?.total ?? results.length;
  const riskyCount = summary?.risky ?? 0;
  const infiniteCount = summary?.infinite ?? 0;

  return (
    <div className="p-6 border border-gray-700 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white mb-1">
            <span className="text-2xl">🔍</span>
            Authorization risk scanning
          </h2>
          <p className="text-sm text-gray-400">
          One-click scan the token authorization records of the current wallet to identify high-risk authorization addresses.          </p>
        </div>

        <button
          onClick={scan}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:from-blue-700 active:to-blue-600 rounded-lg transition-all duration-200 font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              <span>SCANNING...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>⚡</span>
              <span>One-click scan all authorizations</span>
            </span>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Scan statistics overview */}
      <div className="mb-4 grid grid-cols-3 gap-3 text-sm">
        <div className="px-3 py-2 rounded-lg bg-gray-800/70 border border-gray-700 flex items-center justify-between">
          <span className="text-gray-300">Total authorization</span>
          <span className="font-semibold text-white">{total}</span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-red-900/30 border border-red-700 flex items-center justify-between">
          <span className="text-red-300">high-risk</span>
          <span className="font-semibold text-red-300">{riskyCount}</span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-yellow-900/30 border border-yellow-600 flex items-center justify-between">
          <span className="text-yellow-200">Unlimited authorization</span>
          <span className="font-semibold text-yellow-200">
            {infiniteCount}
          </span>
        </div>
      </div>

      {/* Result list */}
      <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {loading && total === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Scanning the authorization records...
          </div>
        ) : total === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded-lg">
            <div className="text-4xl mb-2">🛡️</div>
            <div className="text-sm">No scan results yet.</div>
            <div className="text-xs text-gray-600 mt-1">
            Click on the "One-click Scan All Authorizations" button at the top right to start analyzing the risks.
            </div>
          </div>
        ) : (
          results.map((r, i) => (
            <RiskCard key={`${r.spender}-${i}`} result={r} token={token} />
          ))
        )}
      </div>
    </div>
  );
}

interface RiskCardProps {
  result: ApiScanResultItem;
  token: TokenInfo | null;
}

function RiskCard({ result, token }: RiskCardProps) {
  const level: ApiRiskLevel = result.risk?.level ?? 'SAFE';

  const color =
    level === 'DANGER'
      ? 'border-red-500'
      : level === 'WARNING'
      ? 'border-yellow-400'
      : 'border-green-500';

  const badgeColor =
    level === 'DANGER'
      ? 'bg-red-600/20 text-red-300 border-red-500/60'
      : level === 'WARNING'
      ? 'bg-yellow-500/10 text-yellow-200 border-yellow-400/60'
      : 'bg-green-600/20 text-green-300 border-green-500/60';

  const riskLabelMap: Record<string, string> = {
    DANGER: 'high-risk',
    WARNING: 'Medium risk',
    SAFE: 'safe',
  };

  return (
    <div
      className={`p-4 border-l-4 ${color} bg-gray-800/80 rounded-lg shadow-sm hover:shadow-md transition`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-gray-300 break-all">
              {result.spender}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${badgeColor}`}
            >
              {riskLabelMap[level] || level}
            </span>
          </div>

          <div className="mt-2 text-gray-300 text-xs sm:text-sm flex flex-wrap gap-2">
            <span>
              🪙{' '}
              <span className="font-mono">
                {token ? `${token.symbol} (${token.name})` : 'Unknown token'}
              </span>
            </span>
            <span className="opacity-60">|</span>
            <span>
               💵 Unlimited：
              <span
                className={
                  result.isInfinite ? 'text-green-red' : 'text-green-400'
                }
              >
                {result.isInfinite ? '✅YES' : '❌NO'}
              </span>
            </span>
            <span>
              💰 Authorization limit ：
              <span className="font-mono">{result.allowanceReadable}</span>
            </span>
            <span className="opacity-60">|</span>
            <span>{result.isContract ? 'Contract Address' : 'External account（EOA）'}</span>
            <span className="opacity-60">|</span>
            <span>
             🟢 WhiteList：
              <span
                className={
                  result.isWhitelisted ? 'text-green-400' : 'text-red-400'
                }
              >
                {result.isWhitelisted ? '✅YES' : '❌NO'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {result.risk?.reasons?.length > 0 && (
        <ul className="mt-2 list-disc list-inside text-gray-400 text-xs space-y-1">
          {result.risk.reasons.map((reason, i) => (
            <li key={i}>{reason}</li>
          ))}
        </ul>
      )}
    </div>
  );
}