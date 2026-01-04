import { BrowserProvider } from 'ethers';
import { ensureBscTestnet } from './ensureBscTestnet';

export async function connectMetaMask() {
  if (!window.ethereum || !window.ethereum.isMetaMask) {
    throw new Error('未检测到 MetaMask');
  }

  // 1️⃣ 请求账户授权
  await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  // 2️⃣ 确保在 BSC Testnet
  await ensureBscTestnet();

  // 3️⃣ 再创建 provider（很关键，必须在切链之后）
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return {
    provider,
    signer,
    address,
  };
}
