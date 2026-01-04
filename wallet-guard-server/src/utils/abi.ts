export const ERC20_ABI = [
  // Approval event
  'event Approval(address indexed owner, address indexed spender, uint256 value)',

  // allowance function
  'function allowance(address owner, address spender) view returns (uint256)',

  // symbol / decimals
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
];
