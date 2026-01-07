'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { NetworkConfig, NETWORKS, DEFAULT_NETWORK, NetworkType } from '@/lib/config';
import { getClient, MovementClient } from '@/lib/api/client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

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
  const router = useRouter();
  const pathname = usePathname();
  const [currentNetworkType, setCurrentNetworkType] = useState<NetworkType>(DEFAULT_NETWORK);
  const [network, setNetwork] = useState<NetworkConfig>(NETWORKS[DEFAULT_NETWORK]);
  const [client, setClient] = useState<MovementClient>(() => getClient(NETWORKS[DEFAULT_NETWORK]));
  // Track if we initiated the network change to avoid reacting to our own URL updates
  const isInternalChange = useRef(false);

  // Initialize network on mount
  useEffect(() => {
    const initialNetwork = getInitialNetwork();
    if (initialNetwork !== DEFAULT_NETWORK) {
      isInternalChange.current = true;
      switchNetwork(initialNetwork);
    }
  }, []);

  // Watch for external URL changes (e.g., browser back/forward)
  useEffect(() => {
    // Skip if this was triggered by our own switchNetwork call
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    const networkParam = searchParams?.get('network');
    if (networkParam && (networkParam === 'mainnet' || networkParam === 'testnet' || networkParam === 'local')) {
      const networkType = networkParam as NetworkType;
      if (networkType !== currentNetworkType) {
        // External URL change - update state without updating URL again
        const newNetwork = NETWORKS[networkType];
        setCurrentNetworkType(networkType);
        setNetwork(newNetwork);
        setClient(getClient(newNetwork));
        try {
          localStorage.setItem(NETWORK_STORAGE_KEY, networkType);
        } catch (error) {
          console.error('Failed to save network to localStorage:', error);
        }
      }
    } else if (!networkParam && currentNetworkType !== 'mainnet') {
      // URL has no network param, default to mainnet
      const newNetwork = NETWORKS['mainnet'];
      setCurrentNetworkType('mainnet');
      setNetwork(newNetwork);
      setClient(getClient(newNetwork));
      try {
        localStorage.setItem(NETWORK_STORAGE_KEY, 'mainnet');
      } catch (error) {
        console.error('Failed to save network to localStorage:', error);
      }
    }
  }, [searchParams]);

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

    // Update URL using Next.js router
    isInternalChange.current = true;
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (networkType === 'mainnet') {
      params.delete('network');
    } else {
      params.set('network', networkType);
    }
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [searchParams, pathname, router]);

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
