import { useQuery } from '@tanstack/react-query';
import { useNetwork } from '@/providers/network-provider';

export function useAccount(address: string | null) {
  const { client, network } = useNetwork();

  return useQuery({
    queryKey: ['account', address, network.name],
    queryFn: () => client.getAccount(address!),
    enabled: !!address,
  });
}

export function useAccountCoins(address: string | null) {
  const { client, network } = useNetwork();

  return useQuery({
    queryKey: ['account-coins', address, network.name],
    queryFn: () => client.getAccountCoinsData(address!),
    enabled: !!address,
  });
}

export function useAccountTransactions(
  address: string | null,
  options?: { start?: number; limit?: number }
) {
  const { client, network } = useNetwork();

  return useQuery({
    queryKey: ['account-transactions', address, network.name, options?.start, options?.limit],
    queryFn: () => client.getAccountTransactions(address!, options),
    enabled: !!address,
  });
}
