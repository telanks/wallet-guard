import { JsonRpcProvider } from 'ethers';


const MAX_UINT256 = BigInt(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);

export function isInfiniteAllowance(value: bigint): boolean {
  // 使用 90% MAX_UINT 作为工程兜底
  return value > (MAX_UINT256 * 9n) / 10n;
}


export async function isContract(
  provider: JsonRpcProvider,
  address: string
): Promise<boolean> {
  const code = await provider.getCode(address);
  return code !== '0x';
}

export function formatAllowance(raw: string) {
  try {
    const n = BigInt(raw);
    if (n > 2n ** 255n) return '∞ Unlimited';
    if (n > 10n ** 18n) return '> 1 Token';
    return n.toString();
  } catch {
    return raw;
  }
}