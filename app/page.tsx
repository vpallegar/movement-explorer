'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/search-bar';
import { TransactionFiltersComponent, TransactionFilters } from '@/components/transaction-filters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useLedgerInfo } from '@/hooks/use-ledger-info';
import { useTransactions } from '@/hooks/use-transactions';
import { useAnalytics } from '@/hooks/use-analytics';
import { formatTimeAgo, formatTimestamp, truncateAddress } from '@/lib/utils/format';
import { Activity, Blocks, Clock, TrendingUp, Users, FileCode, UserCog } from 'lucide-react';
import Link from 'next/link';

// Transaction type enumeration
const TransactionTypeName = {
  BlockMetadata: 'block_metadata_transaction',
  Genesis: 'genesis_transaction',
  User: 'user_transaction',
  Pending: 'pending_transaction',
  StateCheckpoint: 'state_checkpoint_transaction',
  Validator: 'validator_transaction',
  BlockEpilogue: 'block_epilogue_transaction',
} as const;

// Helper to get user-friendly transaction type
function getTransactionTypeLabel(type: string): { label: string; color: string } {
  // Check for system transaction types first
  switch (type) {
    case TransactionTypeName.BlockMetadata:
      return { label: 'Block Metadata', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    case TransactionTypeName.Genesis:
      return { label: 'Genesis', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' };
    case TransactionTypeName.StateCheckpoint:
      return { label: 'State Checkpoint', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    case TransactionTypeName.Validator:
      return { label: 'Validator', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    case TransactionTypeName.BlockEpilogue:
      return { label: 'Block Epilogue', color: 'bg-stone-500/10 text-stone-400 border-stone-500/20' };
    case TransactionTypeName.Pending:
      return { label: 'Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
  }

  // For user transactions, check the function name
  const lowerType = type.toLowerCase();

  if (lowerType.includes('transfer') || lowerType.includes('coin::transfer')) {
    return { label: 'Transfer', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
  }
  if (lowerType.includes('stake') || lowerType.includes('delegation_pool')) {
    return { label: 'Staking', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
  }
  if (lowerType.includes('swap')) {
    return { label: 'Swap', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
  }
  if (lowerType.includes('nft') || lowerType.includes('token::')) {
    return { label: 'NFT', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' };
  }
  if (lowerType.includes('script')) {
    return { label: 'Script', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };
  }
  if (lowerType.includes('publish')) {
    return { label: 'Deploy', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
  }

  return { label: 'User', color: 'bg-sky-500/10 text-sky-500 border-sky-500/20' };
}

export default function HomePage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const { data: ledgerInfo, isLoading: ledgerLoading } = useLedgerInfo();
  const { data: transactions, isLoading: txnsLoading } = useTransactions({ limit: 50 });
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  // Get analytics metrics
  const peakTPS = analytics?.max_tps_15_blocks_in_past_30_days?.[0]?.max_tps_15_blocks_in_past_30_days;
  const totalAccounts = analytics?.total_accounts?.[0]?.total_accounts;
  const totalContracts = analytics?.cumulative_deployers?.[0]?.cumulative_contracts_deployed;
  const totalDeployers = analytics?.cumulative_deployers?.[0]?.cumulative_contract_deployers;

  // Use peak TPS from analytics, or show placeholder
  const tps = peakTPS ? Math.round(peakTPS).toLocaleString() : '—';

  // Filter transactions based on active filters
  const filteredTransactions = transactions?.filter((txn) => {
    if (filters.type && txn.type !== filters.type) return false;
    if (filters.success !== undefined && 'success' in txn && txn.success !== filters.success) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-6">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Movement Network Explorer
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore transactions, addresses, and tokens on the Movement blockchain
        </p>

        {/* Search Bar */}
        <div className="pt-4 max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Block Height</CardTitle>
            <Blocks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {ledgerLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {ledgerInfo?.block_height ? Number(ledgerInfo.block_height).toLocaleString() : '—'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Latest block
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {ledgerLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {ledgerInfo?.ledger_version ? Number(ledgerInfo.ledger_version).toLocaleString() : '—'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All-time transaction count
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Peak TPS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{tps}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Peak transactions per second
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Latest Block</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {ledgerLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {ledgerInfo?.ledger_timestamp ? formatTimeAgo(ledgerInfo.ledger_timestamp) : '—'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last block time
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Stats - Show only if data is available */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {totalAccounts ? totalAccounts.toLocaleString() : '—'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total accounts created
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Deployed Contracts</CardTitle>
              <FileCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {totalContracts ? totalContracts.toLocaleString() : '—'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total contracts deployed
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contract Deployers</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {totalDeployers ? totalDeployers.toLocaleString() : '—'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unique contract deployers
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="space-y-4">
        <TransactionFiltersComponent filters={filters} onFiltersChange={setFilters} />

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle>Latest Transactions</CardTitle>
              <Link
                href="/transactions"
                className="text-sm text-primary hover:underline font-medium"
              >
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {txnsLoading ? (
              <div className="space-y-0">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="p-4 border-b border-border/30 last:border-0">
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredTransactions && filteredTransactions.length > 0 ? (
              <div className="divide-y divide-border/30">
                {filteredTransactions.slice(0, 15).map((txn) => {
                // Skip pending transactions and transactions without success/timestamp for display
                if (!('success' in txn) || !('timestamp' in txn)) return null;
                const typeInfo = txn.type ? getTransactionTypeLabel(txn.type) : { label: 'Transaction', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
                const timestamp = txn.timestamp as string;

                return (
                  <Link
                    key={txn.version}
                    href={`/tx/${txn.hash}`}
                    className="block p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-primary font-medium">
                            {truncateAddress(txn.hash, 12, 8)}
                          </span>
                          <Badge variant="outline" className={`text-xs ${typeInfo.color} border`}>
                            {typeInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Version {txn.version.toLocaleString()}</span>
                          <span>•</span>
                          <span>{formatTimestamp(timestamp)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-medium">
                          {txn.success ? (
                            <span className="text-green-500">Success</span>
                          ) : (
                            <span className="text-red-500">Failed</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(timestamp)}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <p>No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
