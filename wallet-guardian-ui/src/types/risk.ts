// 旧的风险等级类型（如果后续其他地方还用得到，可以保留）
export type RiskLevel = 'SAFE' | 'MEDIUM' | 'HIGH';

// 扫描 API 返回的风险等级
export type ApiRiskLevel = 'SAFE' | 'WARNING' | 'DANGER' | string;

export interface ApiRiskDetail {
  level: ApiRiskLevel;
  reasons: string[];
}

export interface ApiScanResultItem {
  spender: string;
  allowance: string;
  allowanceReadable: string;
  isInfinite: boolean; 
  isContract: boolean;
  isWhitelisted: boolean;
  risk: ApiRiskDetail;
}

export interface ApiScanSummary {
  total: number;
  risky: number;
  infinite: number;
}

export interface ApiScanResponse {
  owner: string;
  token: string;
  summary: ApiScanSummary;
  results: ApiScanResultItem[];
}


export interface RiskEvent {
  type: 'APPROVAL';
  owner: string;
  token: string;
  spender: string;
  value: string;
  isInfinite: boolean;
  riskLevel: 'SAFE' | 'WARNING' | 'DANGER';
  reasons: string[];
  txHash: string;
  timestamp: number;
}

