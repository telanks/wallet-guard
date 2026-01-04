import 'dotenv/config';
import { WebSocketProvider } from 'ethers';
import { startApprovalListener } from './listeners/approvalListener';
import { startAllowanceScanner } from './scanners/allowanceScanner';
import { getOwnerWhitelist } from './config/spenders';

import {linkInfo} from './config/wallet';

// 导入服务器服务以注册API路由
import './server/whiteListService';
import './server/allowanceScannerService';
import './server/walletService';


import { startWsServer } from './ws/wsServer';




// 1️⃣ 读取环境变量
const RPC_URL = process.env.BSC_TEST_WS_RPC;
const BSC_HTTP_RPC = process.env.BSC_TEST_HTTP_RPC;

// BSC 上的 USDT

const BSC_TEST_USDC_ADDRESS = '0x78F623e9408Cc8caC5a64B1623cdDd793fdFeB57';



//const WATCH_ADDRESS = linkInfo.owner;
//if (!RPC_URL) throw new Error('❌ BSC_WS_RPC not set');
//if (!WATCH_ADDRESS) throw new Error('❌ WATCH_ADDRESS not set');
// console.log(`-------------------------------------------`);

// console.log('🛡️ Wallet Guard started');
// console.log('👀 Watching address:', WATCH_ADDRESS);

// // 2️⃣ 初始化 Provider
// const provider = new WebSocketProvider(RPC_URL);

async function main() {

  console.log(`-------------------------------------------`);

  console.log('🛡️ Wallet Guard started');

  
  startWsServer(3002);

  // const blockNumber = await provider.getBlockNumber();

  // console.log('✅ Connected to BSC_TEST');
  // console.log('⛓️ Current block:', blockNumber);

  // // 3️⃣ 启动 Approval 监听
  // startApprovalListener({
  //   provider,
  //   tokenAddress: BSC_TEST_USDC_ADDRESS,
  //   watchAddress: WATCH_ADDRESS!,
  // });

  // const KNOWN_SPENDERS = getOwnerWhitelist(WATCH_ADDRESS!);

  // // 4️⃣ 启动 Allowance 扫描
  // startAllowanceScanner({
  //   rpcUrl: BSC_HTTP_RPC!,
  //   tokenAddress: BSC_TEST_USDC_ADDRESS,
  //   owner: WATCH_ADDRESS!,
  //   spenders: KNOWN_SPENDERS,
  //   intervalMs: 15_000,
  // });
  
}

main().catch(console.error);
