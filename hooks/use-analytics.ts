'use client';

import { useQuery } from '@tanstack/react-query';
import { useNetwork } from '@/providers/network-provider';

const ANALYTICS_URLS: Record<string, string> = {
  mainnet: 'https://storage.googleapis.com/explorer_stats/chain_stats_mainnet_v2.json',
  testnet: 'https://storage.googleapis.com/explorer_stats/chain_stats_bardock_v2.json',
};

export type DailyActiveUserData = {
  daily_active_user_count: number;
  date: string;
};

export type DailyAvgGasData = {
  avg_gas_unit_price: string;
  date: string;
};

export type DailyGasCostData = {
  gas_cost: string;
  date: string;
};

export type DailyContractDeployerData = {
  distinct_deployers: number;
  date: string;
};

export type DailyContractData = {
  daily_contract_deployed: number;
  date: string;
};

export type DailyPeakTPSData = {
  max_tps_15_blocks: number;
  date: string;
};

export type DailyNewAccountData = {
  new_account_count: number;
  date: string;
};

export type DailyUserTxnData = {
  num_user_transactions: number;
  date: string;
};

export type MonthlyActiveUserData = {
  mau_signer_30: number;
  date: string;
};

export type TotalDeployers = {
  cumulative_contract_deployers: number;
  cumulative_contracts_deployed: number;
};

export type TotalAccounts = {
  total_accounts: number;
};

export type NodeCountData = {
  date: string;
  approx_nodes: number;
};

export type AnalyticsData = {
  daily_active_users: DailyActiveUserData[];
  daily_average_gas_unit_price: DailyAvgGasData[];
  daily_gas_from_user_transactions: DailyGasCostData[];
  daily_contract_deployers: DailyContractDeployerData[];
  daily_deployed_contracts: DailyContractData[];
  daily_max_tps_15_blocks: DailyPeakTPSData[];
  daily_new_accounts_created: DailyNewAccountData[];
  daily_user_transactions: DailyUserTxnData[];
  mau_signers: MonthlyActiveUserData[];
  max_tps_15_blocks_in_past_30_days: {
    max_tps_15_blocks_in_past_30_days: number;
  }[];
  cumulative_deployers: TotalDeployers[];
  total_accounts: TotalAccounts[];
  latest_node_count: NodeCountData[];
};

export function useAnalytics() {
  const { currentNetworkType } = useNetwork();

  return useQuery({
    queryKey: ['analytics', currentNetworkType],
    queryFn: async () => {
      const url = ANALYTICS_URLS[currentNetworkType];
      if (!url) {
        return null;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      return data as AnalyticsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!ANALYTICS_URLS[currentNetworkType],
  });
}
