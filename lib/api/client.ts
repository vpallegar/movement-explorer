/**
 * Movement SDK client wrapper using Aptos SDK for blockchain interactions
 */

import { Aptos, AptosConfig, Network, InputViewFunctionData } from '@aptos-labs/ts-sdk';
import { NetworkConfig } from '../config';

export class MovementClient {
  private client: Aptos;
  public network: NetworkConfig;

  constructor(network: NetworkConfig) {
    this.network = network;

    const config = new AptosConfig({
      network: Network.CUSTOM,
      fullnode: network.nodeUrl,
      indexer: network.indexerUrl,
    });

    this.client = new Aptos(config);
  }

  // Account methods
  async getAccount(address: string) {
    return this.client.getAccountInfo({ accountAddress: address });
  }

  async getAccountResources(address: string) {
    return this.client.getAccountResources({ accountAddress: address });
  }

  async getAccountModules(address: string) {
    return this.client.getAccountModules({ accountAddress: address });
  }

  async getAccountTransactions(address: string, options?: { start?: number; limit?: number }) {
    return this.client.getAccountTransactions({
      accountAddress: address,
      options: {
        offset: options?.start,
        limit: options?.limit || 25,
      },
    });
  }

  async getAccountCoinsData(address: string) {
    return this.client.getAccountCoinsData({ accountAddress: address });
  }

  // Transaction methods
  async getTransaction(txnHash: string) {
    return this.client.getTransactionByHash({ transactionHash: txnHash });
  }

  async getTransactionByVersion(version: number) {
    return this.client.getTransactionByVersion({ ledgerVersion: version });
  }

  async getTransactions(options?: { start?: number; limit?: number }) {
    return this.client.getTransactions({
      options: {
        offset: options?.start,
        limit: options?.limit || 25,
      },
    });
  }

  // Block methods
  async getBlockByHeight(options: { blockHeight: bigint | number; options?: { withTransactions?: boolean } }) {
    return this.client.getBlockByHeight(options);
  }

  async getBlockByVersion(version: number, withTransactions?: boolean) {
    return this.client.getBlockByVersion({
      ledgerVersion: version,
      options: { withTransactions },
    });
  }

  // Chain info
  async getLedgerInfo() {
    return this.client.getLedgerInfo();
  }

  async getChainId() {
    return this.client.getChainId();
  }

  // Indexer queries (GraphQL)
  async queryIndexer<T extends object = object>(query: string, variables?: Record<string, unknown>): Promise<T> {
    return this.client.queryIndexer<T>({
      query: {
        query,
        variables,
      },
    });
  }

  // View function
  async view<T extends unknown[]>(payload: InputViewFunctionData): Promise<T> {
    return this.client.view<T>({ payload });
  }
}

// Singleton instances for each network
let mainnetClient: MovementClient | null = null;
let testnetClient: MovementClient | null = null;

export function getClient(network: NetworkConfig): MovementClient {
  if (network.name === 'mainnet') {
    if (!mainnetClient) {
      mainnetClient = new MovementClient(network);
    }
    return mainnetClient;
  } else if (network.name === 'testnet') {
    if (!testnetClient) {
      testnetClient = new MovementClient(network);
    }
    return testnetClient;
  } else {
    // For local or custom networks, create new instance
    return new MovementClient(network);
  }
}
