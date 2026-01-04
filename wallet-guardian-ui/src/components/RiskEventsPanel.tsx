import { useEffect, useRef, useState } from 'react';

interface RiskEvent {
  owner: string;
  spender: string;
  allowance: string;
  isKnownSpender: boolean,
  token: string;
  txHash?: string;
  blockNumber?: number;
  timestamp: number;
  risk: {
    level: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reasons: string[];
  };
}

export  function RiskEventsPanel({ owner }: { owner: string }) {
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`riskEvents:${owner}`);
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch {}
    }
  }, [owner]);

  useEffect(() => {
    if (!owner) return;

    const ws = new WebSocket(
      `ws://localhost:3002?owner=${owner.toLowerCase()}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🟢 Risk WS connected');
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);

        if (data.type === 'RISK_EVENT') {
          setEvents((prev) => {
            const next = [data, ...prev].slice(0, 50);
            localStorage.setItem(
              `riskEvents:${owner}`,
              JSON.stringify(next)
            );
            return next;
          });
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    ws.onclose = () => {
      console.warn('🔴 Risk WS disconnected');
    };

    return () => {
      ws.close();
    };
  }, [owner]);

  function levelColor(level: string) {
    switch (level) {
      case 'DANGER':
        return 'bg-red-900 border-red-500 animate-pulse';
      case 'WARNING':
        return 'bg-yellow-800 border-yellow-500';
      case 'SAFE':
        return 'bg-green-600 border-green-500';
      default:
        return 'bg-gray-800 border-gray-600';
    }
  }

  return (
    <div className="p-5 border border-red-700 rounded-lg bg-black shadow-xl">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-400">
        🚨 Risk Events
      </h2>

      <p className="text-sm text-gray-400 mb-4">
        Real-time approval risks detected from on-chain activity.
      </p>

      {events.length === 0 && (
        <div className="text-gray-500 text-sm">
          No risk events detected yet.
        </div>
      )}

      <div className="space-y-3 max-h-[420px] overflow-y-auto">
        {events.map((e, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-3 ${levelColor(
              e.risk.level
            )}`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-red-300">
                {e.risk.level}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(e.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="text-xs font-mono break-all text-gray-200">
              Spender: {e.spender}
            </div>

            <div className="text-xs font-mono break-all text-gray-200">
              Token: {e.token}
            </div>

            <div className="text-xs font-mono break-all text-gray-200">
              Whitelist: {e.isKnownSpender ? '✅YES' : '❌NO'}
            </div>

            <div className="text-xs text-gray-300">
              Allowance: {formatAllowance(e.allowance,6,'USDC')}
            </div>

            <ul className="mt-2 list-disc list-inside text-xs text-red-300">
              {e.risk.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>

            {e.txHash && (
              <a
                href={`https://testnet.bscscan.com/tx/${e.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 underline mt-2 inline-block"
              >
                View Tx
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


function formatAllowance(
  raw: string,
  decimals: number,
  symbol = ''
) {
  try {
    const n = BigInt(raw);

    if (n >= 2n ** 255n) {
      return '∞ Unlimited';
    }

    const base = 10n ** BigInt(decimals);
    const integer = n / base;
    const fraction = n % base;

    const fractionStr =
      fraction === 0n
        ? ''
        : '.' +
          fraction
            .toString()
            .padStart(decimals, '0')
            .slice(0, 4);

    return `${integer}${fractionStr} ${symbol}`.trim();
  } catch {
    return raw;
  }
}

