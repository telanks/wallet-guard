/**
 * Dynamic whitelist map - Stores the set of whitelist addresses corresponding to each owner
 */
export const DYNAMIC_WHITELIST_MAP = new Map<string, Set<string>>();

/**
 * Obtain the whitelist set for a specific owner
 */
export function getOwnerWhitelist(owner: string): Set<string> {
  const lowerOwner = owner.toLowerCase();
  if (!DYNAMIC_WHITELIST_MAP.has(lowerOwner)) {
    DYNAMIC_WHITELIST_MAP.set(lowerOwner, new Set<string>());
  }
  return DYNAMIC_WHITELIST_MAP.get(lowerOwner)!;
}

/**
 * Update the whitelist for a specific owner
 */
export function updateOwnerWhitelist(owner: string, whitelist: string[]) {
  const lowerOwner = owner.toLowerCase();
  const whitelistSet = new Set(whitelist.map(addr => addr.toLowerCase()));
  DYNAMIC_WHITELIST_MAP.set(lowerOwner, whitelistSet);
}

/**
 * Check whether the address is on the whitelist of the specific owner.
 */
export function isKnownSpenderForOwner(spender: string, owner: string): boolean {
  const lowerSpender = spender.toLowerCase();
  const lowerOwner = owner.toLowerCase();
  
  if (DYNAMIC_WHITELIST_MAP.has(lowerOwner)) {
    const ownerWhitelist = DYNAMIC_WHITELIST_MAP.get(lowerOwner)!;
    return ownerWhitelist.has(lowerSpender);
  }
  
  return false;
}



/**
 *Known safe Spender whitelist
* ⚠️ The addresses listed here are generally regarded as low-risk.
 */
// export const KNOWN_SPENDERS: string[] = [
//   // PancakeSwap v2 Router
//   '0x10ED43C718714eb63d5aA57B78B54704E256024E',

//   // PancakeSwap v3 Router
//   '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',

//    // HASH GAME
//   '0x26b43E5bE5B325d5113AbedC706113084d374F7F',
// ];


// export const KNOWN_SPENDERS_SET = new Set(
//   KNOWN_SPENDERS.map(addr => addr.toLowerCase())
// );
