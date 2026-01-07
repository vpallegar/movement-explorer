import { useQuery } from '@tanstack/react-query';
import { useNetwork } from '@/providers/network-provider';

export function useAccountModules(address: string | null) {
  const { client, network } = useNetwork();

  return useQuery({
    queryKey: ['account-modules', address, network.name],
    queryFn: () => client.getAccountModules(address!),
    enabled: !!address,
  });
}
