export function ConnectHint() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 text-center shadow-lg">
        <div className="text-3xl mb-4">🔐</div>

        <h2 className="text-xl font-bold mb-3">
          Connect Your Wallet
        </h2>

        <p className="text-gray-400 mb-6">
          Wallet Guardian needs read-only access to scan
          approvals and detect risks.
        </p>

        <div className="text-sm text-gray-500">
          No transactions · No signatures · Safe to use
        </div>
      </div>
    </div>
  );
}
