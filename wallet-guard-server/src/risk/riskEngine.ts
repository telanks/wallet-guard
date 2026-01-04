// src/risk/riskEngine.ts

import { RiskLevel, RiskResult } from './rules';
import { isInfiniteAllowance,formatAllowance } from './utils';

export function evaluateRisk(params: {
  spender: string;
  isContract: boolean;
  isKnownSpender: boolean;
  allowance: bigint;
}): RiskResult {
  const reasons: string[] = [];

  if (!params.isContract) {
    reasons.push('Spender is EOA (non-contract address)');
  }


  if (!params.isKnownSpender) {
    reasons.push('Spender not in whitelist');
  }

  if (isInfiniteAllowance(params.allowance)) {
    reasons.push('Infinite approval detected');
  }

  if (reasons.length === 0) {
    return { level: RiskLevel.SAFE, reasons };
  }

  if (
    reasons.includes('Infinite approval detected') ||
    reasons.includes('Spender is EOA (non-contract address)')
  ) {
    return { level: RiskLevel.DANGER, reasons };
  }

  return { level: RiskLevel.WARNING, reasons };
}