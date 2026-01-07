'use client';

import { useQuery } from '@tanstack/react-query';

const COINGECKO_API_ENDPOINT = 'https://api.coingecko.com/api/v3/simple/price';

/**
 * Fetches the USD price for a cryptocurrency using its CoinGecko ID.
 *
 * Common CoinGecko IDs:
 * - "movement" : Movement (MOVE)
 * - "bitcoin": Bitcoin (BTC)
 * - "ethereum": Ethereum (ETH)
 * - "solana": Solana (SOL)
 *
 * Complete list: https://api.coingecko.com/api/v3/coins/list
 */
export async function getTokenPrice(coinId: string = 'movement'): Promise<number | null> {
  const query = {
    ids: coinId,
    vs_currencies: 'usd',
  };

  const queryString = new URLSearchParams(query);
  const url = `${COINGECKO_API_ENDPOINT}?${queryString}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return Number(data[coinId]?.usd);
  } catch (error) {
    console.error(`Error fetching ${coinId} price from CoinGecko:`, error);
    return null;
  }
}

/**
 * React Query hook to fetch token price from CoinGecko
 */
export function useTokenPrice(coinId: string = 'movement') {
  return useQuery({
    queryKey: ['token_price', coinId],
    queryFn: () => getTokenPrice(coinId),
    staleTime: 60000, // 1 minute
    enabled: !!coinId,
  });
}

/**
 * Fetch multiple token prices at once
 */
export async function getMultipleTokenPrices(coinIds: string[]): Promise<Record<string, number | null>> {
  if (coinIds.length === 0) return {};

  const query = {
    ids: coinIds.join(','),
    vs_currencies: 'usd',
  };

  const queryString = new URLSearchParams(query);
  const url = `${COINGECKO_API_ENDPOINT}?${queryString}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      return {};
    }

    const data = await response.json();
    const result: Record<string, number | null> = {};

    coinIds.forEach((coinId) => {
      result[coinId] = data[coinId]?.usd ?? null;
    });

    return result;
  } catch (error) {
    console.error('Error fetching token prices from CoinGecko:', error);
    return {};
  }
}

/**
 * React Query hook to fetch multiple token prices
 */
export function useMultipleTokenPrices(coinIds: string[]) {
  return useQuery({
    queryKey: ['token_prices', coinIds.join(',')],
    queryFn: () => getMultipleTokenPrices(coinIds),
    staleTime: 60000, // 1 minute
    enabled: coinIds.length > 0,
  });
}
