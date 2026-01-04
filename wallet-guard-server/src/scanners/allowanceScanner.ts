import { Contract, JsonRpcProvider } from 'ethers';
import { ERC20_ABI } from '../utils/abi';

import { evaluateRisk } from '../risk/riskEngine';
import { isContract } from '../risk/utils';
import { isKnownSpenderForOwner } from '../config/spenders';



interface AllowanceScannerOptions {
  rpcUrl: string;
  tokenAddress: string;
  owner: string;
  spenders: Set<string>;
  intervalMs?: number;
}

export function startAllowanceScanner(options: AllowanceScannerOptions) {
  const {
    rpcUrl,
    tokenAddress,
    owner,
    spenders,
    intervalMs = 15_000, // 15 秒
  } = options;

  const provider = new JsonRpcProvider(rpcUrl);
  const token = new Contract(tokenAddress, ERC20_ABI, provider);

  // 本地快照
  const lastSnapshot = new Map<string, bigint>();
  
  console.log('------------------------------------------');
  console.log('🧾 Allowance scanner started');
  console.log('👤 Owner:', owner);
  console.log('🪙 Token:', tokenAddress);
  console.log('📛 Spenders:', spenders.size);

  async function scanOnce() {
    const provider = new JsonRpcProvider(rpcUrl);

    for (const spender of spenders) {
      try {
        const allowance: bigint = await token.allowance(owner, spender);
        const key = spender.toLowerCase();
        const last = lastSnapshot.get(key);

        // 第一次只记录，不告警
        if (last === undefined) {
          lastSnapshot.set(key, allowance);
          continue;
        }

        // allowance 发生变化
        if (allowance !== last) {
          console.log('🚨 [ALLOWANCE CHANGED]');
          console.log('━━━━━━━━━━━━━━━━━━━━━━');
          console.log('👤 Owner:', owner);
          console.log('📛 Spender:', spender);
          console.log('⬅️ Old:', last.toString());
          console.log('➡️ New:', allowance.toString());
          console.log('━━━━━━━━━━━━━━━━━━━━━━');

          lastSnapshot.set(key, allowance);
        }

        const isKnownSpender = isKnownSpenderForOwner(spender,owner);

        const contractFlag = await isContract(provider, spender);
        
        const risk = evaluateRisk({
          spender,
          isContract: contractFlag,
          isKnownSpender,
          allowance: allowance,
        });

        if (risk.level !== 'SAFE') {
          console.log(`🚨 [${risk.level}] ALLOWANCE RISK DETECTED`);
          console.log(`👤 Owner: ${owner}`);
          console.log(`📛 Spender: ${spender}`);
          console.log(`🪙 Allowance: ${allowance.toString()}`);
          console.log(`❗ Reasons:`);
          risk.reasons.forEach(r => console.log(`   - ${r}`));
        }

      } catch (err) {
        console.error('❌ Allowance scan error:', spender, err);
      }
    }
    
  }

  // 立即跑一次
  scanOnce();

  // 定时扫描
  //setInterval(scanOnce, intervalMs);
}
