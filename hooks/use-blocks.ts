'use client';

import { useQuery } from '@tanstack/react-query';
import { useNetwork } from '@/providers/network-provider';

export interface Block {
  block_height: string;
  block_hash: string;
  block_timestamp: string;
  first_version: string;
  last_version: string;
  transactions?: unknown[];
}

export function useBlocks(options?: { start?: number; limit?: number }) {
  const { client } = useNetwork();
  const limit = options?.limit ?? 30;
  const start = options?.start;

  return useQuery({
    queryKey: ['blocks', start, limit],
    queryFn: async () => {
      // Get the latest ledger info to determine the starting block height
      const ledgerInfo = await client.getLedgerInfo();
      const currentBlockHeight = BigInt(ledgerInfo.block_height);

      // Use the start parameter if provided, otherwise use current block height
      const startHeight = start !== undefined ? BigInt(start) : currentBlockHeight;

      // Fetch blocks in parallel for better performance
      const blockPromises = [];
      for (let i = BigInt(0); i < BigInt(limit); i++) {
        const blockHeight = startHeight - i;
        if (blockHeight >= BigInt(0)) {
          blockPromises.push(
            client.getBlockByHeight({
              blockHeight,
              options: { withTransactions: false }, // Don't fetch transactions for performance
            })
          );
        }
      }

      const blocks = await Promise.all(blockPromises);
      return blocks as Block[];
    },
    staleTime: 10000, // 10 seconds
  });
}

export function useBlock(blockHeight: string) {
  const { client } = useNetwork();

  return useQuery({
    queryKey: ['block', blockHeight],
    queryFn: async () => {
      const block = await client.getBlockByHeight({
        blockHeight: BigInt(blockHeight),
        options: { withTransactions: true },
      });
      return block as Block;
    },
    staleTime: 60000, // 1 minute
  });
}
