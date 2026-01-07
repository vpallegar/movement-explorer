/**
 * Comprehensive search utilities for Movement blockchain explorer
 */

import { MovementClient } from '../api/client';

export interface SearchResult {
  label: string;
  to: string | null;
  type: 'account' | 'transaction' | 'block' | 'object' | 'token' | 'fungible_asset' | 'unknown';
  image?: string;
}

export const NotFoundResult: SearchResult = {
  label: 'No Results',
  to: null,
  type: 'unknown',
};

/**
 * Check if string is a valid account address
 */
export function isValidAccountAddress(address: string): boolean {
  // Must start with 0x and be valid hex
  if (!address.startsWith('0x')) return false;
  const hex = address.slice(2);
  if (!/^[0-9a-fA-F]+$/.test(hex)) return false;
  // Aptos addresses can be 1-64 hex chars (with leading zeros optional)
  return hex.length > 0 && hex.length <= 64;
}

/**
 * Check if string is numeric
 */
export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Check if string is 32-byte hex (64 chars + 0x)
 */
export function is32ByteHex(value: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}

/**
 * Check if string is valid Move struct type
 */
export function isValidStruct(value: string): boolean {
  // Format: 0xaddress::module::struct or 0xaddress::module::struct<Type>
  return /^0x[0-9a-fA-F]+::\w+::\w+(<.*>)?$/.test(value);
}

/**
 * Try to standardize an address
 */
export function tryStandardizeAddress(address: string): string | null {
  if (!address.startsWith('0x')) {
    address = '0x' + address;
  }

  if (!isValidAccountAddress(address)) {
    return null;
  }

  // Pad to 64 characters (excluding 0x)
  const hex = address.slice(2);
  return '0x' + hex.padStart(64, '0');
}

/**
 * Search for transaction by hash or version
 */
export async function searchTransaction(
  query: string,
  client: MovementClient
): Promise<SearchResult | null> {
  try {
    const txn = await client.getTransaction(query);
    if (txn) {
      return {
        label: `Transaction ${query}`,
        to: `/tx/${query}`,
        type: 'transaction',
      };
    }
  } catch (error) {
    // Not a transaction
  }
  return null;
}

/**
 * Search for block by height or version
 */
export async function searchBlock(
  query: string,
  client: MovementClient
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const num = parseInt(query);

  // Try as block height
  try {
    await client.getBlockByHeight({ blockHeight: BigInt(num), options: { withTransactions: false } });
    results.push({
      label: `Block ${num}`,
      to: `/block/${num}`,
      type: 'block',
    });
  } catch (error) {
    // Not a valid block height
  }

  return results;
}

/**
 * Search for account by address
 */
export async function searchAccount(
  query: string,
  client: MovementClient
): Promise<SearchResult | null> {
  const address = tryStandardizeAddress(query);
  if (!address) return null;

  try {
    await client.getAccount(address);
    return {
      label: `Account ${address}`,
      to: `/account/${address}`,
      type: 'account',
    };
  } catch (error) {
    // Not an account
  }
  return null;
}

/**
 * Perform comprehensive search
 */
export async function performSearch(
  searchText: string,
  client: MovementClient
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const isValidAddr = isValidAccountAddress(searchText);
  const isNumber = isNumeric(searchText);
  const is32Hex = is32ByteHex(searchText);

  if (isNumber) {
    // Could be block height, transaction version
    const blockResults = await searchBlock(searchText, client);
    results.push(...blockResults);

    const txResult = await searchTransaction(searchText, client);
    if (txResult) results.push(txResult);
  } else if (is32Hex) {
    // Could be transaction hash OR address
    const txResult = await searchTransaction(searchText, client);
    if (txResult) results.push(txResult);

    const accountResult = await searchAccount(searchText, client);
    if (accountResult) results.push(accountResult);
  } else if (isValidAddr) {
    // Only address
    const accountResult = await searchAccount(searchText, client);
    if (accountResult) results.push(accountResult);
  }

  if (results.length === 0) {
    results.push(NotFoundResult);
  }

  return results.filter((r): r is SearchResult => r !== null);
}
