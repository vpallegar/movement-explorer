'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { NetworkConfig, NETWORKS, DEFAULT_NETWORK, NetworkType } from '@/lib/config';
import { getClient, MovementClient } from '@/lib/api/client';
import { useSearchParams } from 'next/navigation';

interface NetworkContextType {
  network: NetworkConfig;
  client: MovementClient;
  switchNetwork: (network: NetworkType) => void;
  currentNetworkType: NetworkType;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

const NETWORK_STORAGE_KEY = 'movement_network';

function getInitialNetwork(): NetworkType {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return DEFAULT_NETWORK;
  }

  // First priority: URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const networkParam = urlParams.get('network');
  if (networkParam && (networkParam === 'mainnet' || networkParam === 'testnet' || networkParam === 'local')) {
    return networkParam as NetworkType;
  }

  // Second priority: localStorage
  try {
    const stored = localStorage.getItem(NETWORK_STORAGE_KEY);
    if (stored && (stored === 'mainnet' || stored === 'testnet' || stored === 'local')) {
      return stored as NetworkType;
    }
  } catch (error) {
    console.error('Failed to read network from localStorage:', error);
  }

  // Default fallback
  return DEFAULT_NETWORK;
}

export function NetworkProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [currentNetworkType, setCurrentNetworkType] = useState<NetworkType>(DEFAULT_NETWORK);
  const [network, setNetwork] = useState<NetworkConfig>(NETWORKS[DEFAULT_NETWORK]);
  const [client, setClient] = useState<MovementClient>(() => getClient(NETWORKS[DEFAULT_NETWORK]));

  // Initialize network on mount
  useEffect(() => {
    const initialNetwork = getInitialNetwork();
    if (initialNetwork !== DEFAULT_NETWORK) {
      switchNetwork(initialNetwork);
    }
  }, []);

  // Watch for URL changes
  useEffect(() => {
    const networkParam = searchParams?.get('network');
    if (networkParam && (networkParam === 'mainnet' || networkParam === 'testnet' || networkParam === 'local')) {
      const networkType = networkParam as NetworkType;
      if (networkType !== currentNetworkType) {
        switchNetwork(networkType);
      }
    }
  }, [searchParams, currentNetworkType]);

  const switchNetwork = useCallback((networkType: NetworkType) => {
    const newNetwork = NETWORKS[networkType];
    setCurrentNetworkType(networkType);
    setNetwork(newNetwork);
    setClient(getClient(newNetwork));

    // Persist to localStorage
    try {
      localStorage.setItem(NETWORK_STORAGE_KEY, networkType);
    } catch (error) {
      console.error('Failed to save network to localStorage:', error);
    }

    // Update URL without reload if not mainnet
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (networkType === 'mainnet') {
        url.searchParams.delete('network');
      } else {
        url.searchParams.set('network', networkType);
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return (
    <NetworkContext.Provider value={{ network, client, switchNetwork, currentNetworkType }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
}
