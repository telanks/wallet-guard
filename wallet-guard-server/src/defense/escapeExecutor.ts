import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import { ERC20_ABI } from '../utils/abi';
import { getDefenseGas } from './gasStrategy';

interface EscapeOptions {
  rpcUrl: string;
  tokenAddress: string;
  fromPrivateKey: string;
  safeAddress: string;
}

export async function escapeERC20(options: EscapeOptions) {
  const { rpcUrl, tokenAddress, fromPrivateKey, safeAddress } = options;

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(fromPrivateKey, provider);

  const token = new Contract(tokenAddress, ERC20_ABI, wallet);

  const owner = await wallet.getAddress();
  console.log('🛡️ [ESCAPE] Triggered');
  console.log('👤 From:', owner);
  console.log('🏦 To (SAFE):', safeAddress);
  console.log('🪙 Token:', tokenAddress);

  const balance: bigint = await token.balanceOf(owner);

  if (balance === 0n) {
    console.log('ℹ️ No balance, skip escape');
    return;
  }

  console.log('💰 Balance:', balance.toString());

  // 高优先级 gas 策略
  const gas = await getDefenseGas(provider);

  try {
    const tx = await token.transfer(safeAddress, balance, {
      ...gas,
    });

    console.log('🚀 Escape tx sent');
    console.log('🔗 TxHash:', tx.hash);

    const receipt = await tx.wait();
    console.log('✅ Escape confirmed in block', receipt.blockNumber);
  } catch (err) {
    console.error('❌ Escape failed', err);
  }
}
