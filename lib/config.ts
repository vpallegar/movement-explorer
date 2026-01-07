/**
 * Network configuration for Movement blockchain
 */

export type NetworkType = 'mainnet' | 'testnet' | 'local';

export interface NetworkConfig {
  name: string;
  displayName: string;
  nodeUrl: string;
  indexerUrl: string;
  chainId: number;
}

export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    name: 'mainnet',
    displayName: 'Movement Mainnet',
    nodeUrl: process.env.NEXT_PUBLIC_MAINNET_URL || 'https://mainnet.movementnetwork.xyz/v1',
    indexerUrl: process.env.NEXT_PUBLIC_MAINNET_INDEXER || 'https://indexer.mainnet.movementnetwork.xyz/v1/graphql',
    chainId: 126,
  },
  testnet: {
    name: 'testnet',
    displayName: 'Bardock Testnet',
    nodeUrl: process.env.NEXT_PUBLIC_TESTNET_URL || 'https://testnet.movementnetwork.xyz/v1',
    indexerUrl: process.env.NEXT_PUBLIC_TESTNET_INDEXER || 'https://hasura.testnet.movementnetwork.xyz/v1/graphql',
    chainId: 177,
  },
  local: {
    name: 'local',
    displayName: 'Local Network',
    nodeUrl: 'http://localhost:8080/v1',
    indexerUrl: 'http://localhost:8090/v1/graphql',
    chainId: 4,
  },
};

export const DEFAULT_NETWORK: NetworkType =
  (process.env.NEXT_PUBLIC_DEFAULT_NETWORK as NetworkType) || 'mainnet';

// Known addresses for better UX
export const KNOWN_ADDRESSES: Record<string, string> = {
  '0x1': 'Framework',
  '0x0000000000000000000000000000000000000000000000000000000000000001': 'Framework (0x1)',
  '0x000000000000000000000000000000000000000000000000000000000000000a': 'MOVE Coin',
};

// Native token configuration
export const NATIVE_TOKEN = {
  symbol: 'MOVE',
  decimals: 8,
  name: 'Movement',
};
