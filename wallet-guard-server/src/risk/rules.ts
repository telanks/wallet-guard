// src/risk/rules.ts

export enum RiskLevel {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  DANGER = 'DANGER',
}

export interface RiskResult {
  level: RiskLevel;
  reasons: string[];
}
