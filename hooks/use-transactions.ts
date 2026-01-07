import { useQuery } from '@tanstack/react-query';
import { useNetwork } from '@/providers/network-provider';

export function useTransactions(options?: { start?: number; limit?: number }) {
  const { client, network } = useNetwork();

  return useQuery({
    queryKey: ['transactions', network.name, options?.start, options?.limit],
    queryFn: () => client.getTransactions(options),
  });
}

export function useTransaction(txnHash: string | null) {
  const { client, network } = useNetwork();

  return useQuery({
    queryKey: ['transaction', txnHash, network.name],
    queryFn: () => client.getTransaction(txnHash!),
    enabled: !!txnHash,
  });
}
