/**
 * Utility functions for formatting blockchain data
 */

import { KNOWN_ADDRESSES } from '../config';

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Format MOVE token amount (8 decimals)
 */
export function formatMoveAmount(amount: number | string | bigint, decimals = 8): string {
  const num = typeof amount === 'bigint' ? Number(amount) : Number(amount);
  const divisor = Math.pow(10, decimals);
  const value = num / divisor;

  if (value === 0) return '0';
  if (value < 0.00000001) return '<0.00000001';

  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  }
  return num.toLocaleString();
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number | string): string {
  const date = new Date(Number(timestamp) / 1000); // Convert microseconds to milliseconds
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format time ago (e.g., "2 mins ago")
 */
export function formatTimeAgo(timestamp: number | string): string {
  const now = Date.now();
  const date = new Date(Number(timestamp) / 1000);
  const seconds = Math.floor((now - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Get known address name or return truncated address
 */
export function getAddressName(address: string): string {
  return KNOWN_ADDRESSES[address] || truncateAddress(address);
}

/**
 * Format transaction type for display
 */
export function formatTransactionType(type: string): string {
  // Remove "0x1::" prefix and snake_case to Title Case
  const cleaned = type.replace(/^0x1::/, '').replace(/_/g, ' ');
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}
