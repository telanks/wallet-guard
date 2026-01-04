import { app } from './index';
import { Contract, JsonRpcProvider } from 'ethers';
import { ERC20_ABI } from '../utils/abi';
import { formatUnits } from 'ethers';


import { evaluateRisk } from '../risk/riskEngine';
import { isContract } from '../risk/utils';
import { getOwnerWhitelist } from '../config/spenders';

const BSC_HTTP_RPC = process.env.BSC_TEST_HTTP_RPC!;
const tokenAddress = process.env.DEFULT_TOKEN_ADDRESS!;



interface TokenMeta {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

interface RiskResult {
  level: 'SAFE' | 'WARNING' | 'DANGER';
  reasons: string[];
}

interface ScanResult {
  spender: string;
  allowance: string;
  allowanceReadable: string; 
  isInfinite: boolean;       
  isContract: boolean;
  isWhitelisted: boolean;
  risk: RiskResult;
}

interface ScanSummary {
  total: number;
  risky: number;
  infinite: number;
}

interface ScanResponse {
  owner: string;
  token: TokenMeta;
  scannedAt: number;
  summary: ScanSummary;
  results: ScanResult[];
}

// ===== Route =====

app.get('/scanner/spenders/:owner', async (req, res) => {
  try {
    const provider = new JsonRpcProvider(BSC_HTTP_RPC);
    const token = new Contract(tokenAddress, ERC20_ABI, provider);

    const tokenMeta: TokenMeta = {
      address: tokenAddress,
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      decimals: 18,
    };

    try {
      tokenMeta.symbol = await token.symbol();
      tokenMeta.name = await token.name();
      //tokenMeta.decimals = await token.decimals();
    } catch {}

    const owner = req.params.owner.toLowerCase();
    const whitelist = getOwnerWhitelist(owner);

    const results: ScanResult[] = [];
    const summary: ScanSummary = { total: 0, risky: 0, infinite: 0 };

    for (const spender of whitelist) {
      const allowance: bigint = await token.allowance(owner, spender);
      if (allowance === 0n) continue;

      const contractFlag = await isContract(provider, spender);

      const risk = evaluateRisk({
        spender,
        isContract: contractFlag,
        isKnownSpender: true,
        allowance,
      });

      summary.total++;
      if (risk.level !== 'SAFE') summary.risky++;
      if (allowance > 2n ** 255n) summary.infinite++;

      const MAX_UINT_256 = 2n ** 256n - 1n;

      const isInfinite = allowance >= MAX_UINT_256 / 2n;

      let allowanceReadable = isInfinite
  ? 'UNLIMIT'
  : formatUnits(allowance, 6);

      results.push({
        spender,
        allowance: allowance.toString(),
        allowanceReadable,
        isInfinite,
        isContract: contractFlag,
        isWhitelisted: true,
        risk,
      });
    }

    const response: ScanResponse = {
      owner,
      token: tokenMeta,
      scannedAt: Date.now(),
      summary,
      results,
    };

    
    const jsonString = JSON.stringify(response, (_, value) =>typeof value === 'bigint' ? value.toString() : value);
    return res.json(JSON.parse(jsonString));

  } catch (err) {
    console.error('SCAN ERROR:', err);
    res.status(500).json({ error: 'SCAN_FAILED' });
  }
});
