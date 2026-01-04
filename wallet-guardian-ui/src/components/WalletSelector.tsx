interface WalletSelectorProps {
  onSelect: (wallet: 'metamask' | 'okx') => void;
}

export function WalletSelector({ onSelect }: WalletSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-80">
        <h2 className="text-lg font-bold mb-4">
          Select Wallet
        </h2>

        <button
          onClick={() => onSelect('metamask')}
          className="w-full mb-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-3"
        >
          🦊 MetaMask
        </button>

        <button
          onClick={() => onSelect('okx')}
          className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-3"
        >
          🟦 OKX Wallet
        </button>
      </div>
    </div>
  );
}
