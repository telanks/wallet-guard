import { JsonRpcProvider } from 'ethers';

export async function getDefenseGas(provider: JsonRpcProvider) {
  const fee = await provider.getFeeData();

  // BSC / EVM 通用“抢跑保命”策略
  return {
    maxFeePerGas: fee.maxFeePerGas
      ? fee.maxFeePerGas * 2n
      : undefined,
    maxPriorityFeePerGas: fee.maxPriorityFeePerGas
      ? fee.maxPriorityFeePerGas * 2n
      : undefined,
    gasLimit: 100_000n,
  };
}
