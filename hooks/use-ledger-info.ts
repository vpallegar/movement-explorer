import { useQuery } from '@tanstack/react-query';
import { useNetwork } from '@/providers/network-provider';

export function useLedgerInfo() {
  const { client, network } = useNetwork();

  return useQuery({
    queryKey: ['ledger-info', network.name],
    queryFn: () => client.getLedgerInfo(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}
