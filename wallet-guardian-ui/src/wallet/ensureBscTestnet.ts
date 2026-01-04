import { BSC_TESTNET } from './networks';

export async function ensureBscTestnet() {
  if (!window.ethereum) {
    throw new Error('未检测到钱包');
  }

  const currentChainId = await window.ethereum.request({
    method: 'eth_chainId',
  });

  if (currentChainId === BSC_TESTNET.chainId) {
    return;
  }

  try {
    // 尝试直接切链
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_TESTNET.chainId }],
    });
  } catch (switchError: any) {
    // 如果链不存在（MetaMask 4902 错误）
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BSC_TESTNET],
      });
    } else {
      throw switchError;
    }
  }
}
