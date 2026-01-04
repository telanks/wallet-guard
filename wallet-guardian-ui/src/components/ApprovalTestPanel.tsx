import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const USDC_BSC_TESTNET = '0x78F623e9408Cc8caC5a64B1623cdDd793fdFeB57';

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
];

const AMOUNT_OPTIONS = [
  {
    label: '1 USDC',
    value: '1',
    active: '!bg-green-600 !text-black border-green-400',
    inactive: 'bg-black border-green-600 !text-green-400 hover:bg-green-900/40',
  },
  {
    label: '10 USDC',
    value: '10',
    active: '!bg-yellow-400 !text-black border-yellow-300',
    inactive: 'bg-black border-yellow-500 !text-yellow-400 hover:bg-yellow-900/40',
  },
  {
    label: '10,000 USDC',
    value: '10000',
    active: '!bg-orange-500 !text-black border-orange-400',
    inactive: 'bg-black border-orange-600 !text-orange-400 hover:bg-orange-900/40',
  },
  {
    label: 'Unlimited',
    value: 'infinite',
    active: '!bg-red-600 !text-white border-red-400',
    inactive: 'bg-black border-red-600 !text-red-400 hover:bg-red-900/40',
  },
];



interface Props {
  owner: string;
}

type Mode = 'whitelist' | 'manual';
type ApprovalAmount = '1' | '10' | '10000' | 'infinite';

export function ApprovalTestPanel({ owner }: Props) {
  const [mode, setMode] = useState<Mode>('whitelist');
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [spender, setSpender] = useState('');
  const [amount, setAmount] = useState<ApprovalAmount>('infinite');
  const [loading, setLoading] = useState(false);

  // ======================
  // Fetch Whitelist
  // ======================
  async function fetchWhitelist() {
    try {
      const res = await fetch(`http://localhost:3001/whitelist/${owner}`);
      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : data?.spenders ?? [];

      setWhitelist(list);

      if (list.length > 0) {
        setSpender(list[0]);
      } else {
        setSpender('');
      }
    } catch (e) {
      console.error('Failed to load whitelist', e);
    }
  }

  useEffect(() => {
    if (mode === 'whitelist' && owner) {
      fetchWhitelist();
    }
  }, [mode, owner]);


  async function grantApproval() {
    if (!window.ethereum || !spender) return;

    try {
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const token = new ethers.Contract(
        USDC_BSC_TESTNET,
        ERC20_ABI,
        signer
      );

      let approveValue: bigint;

      if (amount === 'infinite') {
        approveValue = ethers.MaxUint256;
      } else {
        // USDC has 6 decimals
        approveValue = ethers.parseUnits(amount, 6);
      }

      const tx = await token.approve(spender, approveValue);
      await tx.wait();

      alert('✅ Approval successful. Authorization event detected.');
    } catch (e: any) {
      alert(e?.message || 'Authorization failed');
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="rounded-xl border border-red-800 bg-gradient-to-b from-red-950 to-black p-6">
      {/* Header */}
      <h2 className="text-xl font-semibold text-red-400 flex items-center gap-2">
        ⚠ Authorization Test
      </h2>

      {/* Token Info */}
      <p className="mt-2 text-sm text-gray-300">
        Token:{' '}
        <span className="text-yellow-400 font-medium">
          USDC (BSC Testnet)
        </span>
      </p>

      {/* Mode Switch */}
      <div className="flex gap-6 mt-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={mode === 'whitelist'}
            onChange={() => setMode('whitelist')}
          />
          WhiteList
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={mode === 'manual'}
            onChange={() => setMode('manual')}
          />
          Input
        </label>
      </div>

      {/* Spender */}
      <div className="mt-4">
        {mode === 'whitelist' ? (
          <select
            className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
            value={spender}
            onChange={(e) => setSpender(e.target.value)}
          >
            {whitelist.length === 0 && (
              <option value="">No whitelisted addresses</option>
            )}
            {whitelist.map((addr) => (
              <option key={addr} value={addr}>
                {addr}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
            placeholder="Input spender address"
            value={spender}
            onChange={(e) => setSpender(e.target.value)}
          />
        )}
      </div>

      {/* Approval Amount */}
      <div className="mt-4">
        <p className="text-sm text-gray-300 mb-2">Approval Amount</p>

        <div className="grid grid-cols-4 gap-3 mt-2">
          {AMOUNT_OPTIONS.map((opt) => {
            const active = amount === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAmount(opt.value as any)}
                className={`
                  py-2 rounded-lg border text-sm font-bold
                  transition-all duration-150
                  ${active ? opt.active : opt.inactive}
                `}
              >
                {opt.label}
              </button>
            );
          })}
        </div>


      </div>

      {/* Action */}
      <button
        onClick={grantApproval}
        disabled={loading || !spender}
        className="
          w-full mt-6 py-3 rounded-lg font-semibold text-base
          bg-gradient-to-r from-red-600 to-red-700
          hover:from-red-700 hover:to-red-800
          text-white
          shadow-lg shadow-red-900/40
          disabled:from-gray-600 disabled:to-gray-700
          disabled:text-gray-300
          disabled:cursor-not-allowed
          transition-all
        "
      >
        {loading
          ? 'Authorizing...'
          : amount === 'infinite'
          ? '⚠ Grant Unlimited Approval'
          : `Grant ${amount} USDC Approval`}
      </button>

      {/* Note */}
      <p className="mt-3 text-xs text-gray-400">
        This panel is used to simulate ERC20 approvals for risk detection testing.
      </p>
    </div>
  );
}
