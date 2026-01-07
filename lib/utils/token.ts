/**
 * Token utilities for Movement blockchain
 */

/**
 * Get display name for a token
 * AptosCoin is the native token on Movement, so we display it as MOVE
 */
export function getTokenDisplayName(name: string | undefined, symbol: string | undefined): string {
  if (!name && !symbol) return 'Unknown';

  // AptosCoin is our native MOVE token
  if (name === 'AptosCoin' || symbol === 'APT') {
    return 'MOVE';
  }

  return symbol || name || 'Unknown';
}

/**
 * Get token symbol from coin type
 */
export function getTokenSymbol(coinType: string | undefined): string {
  if (!coinType) return 'MOVE';

  // Movement blockchain uses MOVE as native token (AptosCoin)
  if (
    coinType.includes('aptos_coin') ||
    coinType.includes('AptosCoin') ||
    coinType.includes('move_coin') ||
    coinType.includes('MoveCoin') ||
    coinType.includes('0x1::aptos_coin::AptosCoin') ||
    coinType === '0x1::aptos_coin::AptosCoin'
  ) {
    return 'MOVE';
  }

  // Extract custom token symbol (e.g., "USDC" from "0x123::usdc::USDC")
  const parts = coinType.split('::');
  if (parts.length >= 3) {
    const symbol = parts[parts.length - 1];
    return symbol.replace(/Coin$/, '').toUpperCase();
  }

  return 'MOVE'; // Default to MOVE for Movement blockchain
}

/**
 * Check if a coin type is the native MOVE token
 */
export function isNativeMoveToken(coinType: string): boolean {
  return (
    coinType === '0x1::aptos_coin::AptosCoin' ||
    coinType.includes('aptos_coin') ||
    coinType.includes('AptosCoin')
  );
}
