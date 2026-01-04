import { app } from './index';

import {linkInfo} from '../config/wallet';
import { startAllowanceScanner } from '../scanners/allowanceScanner';
import { startApprovalListener } from '../listeners/approvalListener';

import { getOwnerWhitelist } from '../config/spenders';

import { WebSocketProvider } from 'ethers';



// 1️⃣ 读取环境变量
const RPC_URL = process.env.BSC_TEST_WS_RPC;
const BSC_HTTP_RPC = process.env.BSC_TEST_HTTP_RPC;

// BSC 上的 USDT

const BSC_TEST_USDC_ADDRESS = '0x78F623e9408Cc8caC5a64B1623cdDd793fdFeB57';


app.post('/wallet/setOwner', (req, res) => { 
  linkInfo.owner = req.body.owner;
  console.log('🔗 Connected to wallet:', linkInfo.owner);

  res.json({ success: true, message: 'Connection successful' });

  const WATCH_ADDRESS = linkInfo.owner;

  const KNOWN_SPENDERS = getOwnerWhitelist(WATCH_ADDRESS!);

  // startAllowanceScanner({
  //   rpcUrl: BSC_HTTP_RPC!,
  //   tokenAddress: BSC_TEST_USDC_ADDRESS,
  //   owner: WATCH_ADDRESS!,
  //   spenders: KNOWN_SPENDERS,
  //   intervalMs: 15_000,
  // });

  const wsProvider = new WebSocketProvider(RPC_URL!);

  startApprovalListener({
    wsProvider,
    tokenAddress: BSC_TEST_USDC_ADDRESS,
    watchAddress: WATCH_ADDRESS!,
  });
});