import { Contract, WebSocketProvider, JsonRpcProvider } from 'ethers';
import { ERC20_ABI } from '../utils/abi';
import { isKnownSpenderForOwner } from '../config/spenders';
import { evaluateRisk } from '../risk/riskEngine';
import { isContract } from '../risk/utils';
import { pushToOwner } from '../ws/wsHub';

const BSC_HTTP_RPC = process.env.BSC_TEST_HTTP_RPC!;

interface ApprovalListenerOptions {
  wsProvider: WebSocketProvider;   // ⚠️ 只用于监听
  tokenAddress: string;
  watchAddress: string;
}

export function startApprovalListener({
  wsProvider,
  tokenAddress,
  watchAddress,
}: ApprovalListenerOptions) {

  const token = new Contract(tokenAddress, ERC20_ABI, wsProvider);

  const httpProvider = new JsonRpcProvider(BSC_HTTP_RPC);

  console.log('------------------------------------------');
  console.log('🔍 Approval Listener started');
  console.log('🪙 Token:', tokenAddress);
  console.log('👀 Watching owner:', watchAddress);
  console.log('------------------------------------------');

  token.on(
    'Approval',
    async (owner: string, spender: string, value: bigint, event) => {
      try {
        if (owner.toLowerCase() !== watchAddress.toLowerCase()) {
          return;
        }

        const allowance = BigInt(value);
        const isKnownSpender = isKnownSpenderForOwner(spender, owner);
        const contractFlag = await isContract(httpProvider, spender);

        const risk = evaluateRisk({
          spender,
          isContract: contractFlag,
          isKnownSpender,
          allowance,
        });


        console.log('━━━━━━━━━━━━━━━━━━━━━━');
        console.log(
          risk.level === 'SAFE'
            ? '✅ [APPROVAL SAFE]'
            : '🚨 [APPROVAL RISK]'
        );
        console.log('👤 Owner:', owner);
        console.log('📛 Spender:', spender);
        console.log('💰 Allowance:', allowance.toString());
        console.log('🧠 Risk Level:', risk.level);
        console.log('🔗 Tx:', event.log.transactionHash);
        console.log('⛓️ Block:', event.log.blockNumber);
        console.log('━━━━━━━━━━━━━━━━━━━━━━');

        pushToOwner(owner, {
          type: 'RISK_EVENT',
          owner,
          spender,
          allowance: allowance.toString(),
          isKnownSpender,
          isContract: contractFlag,
          risk,
          token: tokenAddress,
          txHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
          timestamp: Date.now(),
        });

      } catch (err) {
        console.error('Approval listener error:', err);
      }
    }
  );
}
