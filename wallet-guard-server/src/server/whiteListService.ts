

import { app } from './index';
import { DYNAMIC_WHITELIST_MAP } from '../config/spenders';



// 获取白名单
app.get('/whitelist/:owner', (req, res) => {
  const owner = req.params.owner.toLowerCase();
  const list = DYNAMIC_WHITELIST_MAP.get(owner);
  res.json(list ? Array.from(list) : []);
});

// 添加白名单
app.post('/whitelist/:owner', (req, res) => {
  const owner = req.params.owner.toLowerCase();
  const { address } = req.body;
  if (!address) return res.status(400).send('Missing address');

  let set = DYNAMIC_WHITELIST_MAP.get(owner);
  if (!set) {
    set = new Set();
    DYNAMIC_WHITELIST_MAP.set(owner, set);
  }
  if (set.has(address)) return res.status(400).send('Address already in whitelist');
  set.add(address.toLowerCase());
  res.json({ success: true });
  printWhitelist();
});

// 删除白名单
app.delete('/whitelist/:owner/:address', (req, res) => {
  const owner = req.params.owner.toLowerCase();
  const address = req.params.address.toLowerCase();
  const set = DYNAMIC_WHITELIST_MAP.get(owner);
  if (set) set.delete(address);
  res.json({ success: true });
  printWhitelist();
});

function printWhitelist() {
  console.log('Current whitelist:');
  for (const [owner, list] of DYNAMIC_WHITELIST_MAP.entries()) {
    console.log(`  ${owner}: ${Array.from(list).join(', ')}`);
  }
}