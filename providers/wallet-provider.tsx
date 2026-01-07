'use client';

import React, { ReactNode } from 'react';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network } from '@aptos-labs/ts-sdk';
import { useNetwork } from './network-provider';

export function WalletProvider({ children }: { children: ReactNode }) {
  const { network } = useNetwork();

  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      dappConfig={{
        network: network.name === 'mainnet' ? Network.MAINNET : Network.TESTNET,
      }}
      onError={(error) => {
        console.error('Wallet error:', error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
