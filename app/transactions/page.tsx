'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/use-transactions';
import { TransactionFiltersComponent, TransactionFilters } from '@/components/transaction-filters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo, formatTimestamp, truncateAddress } from '@/lib/utils/format';
import { getTransactionTypeLabel } from '@/lib/utils/transaction-types';
import { ArrowLeft, Activity } from 'lucide-react';
import Link from 'next/link';

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const { data: transactions, isLoading } = useTransactions({ limit: 100 });

  // Filter transactions based on active filters
  const filteredTransactions = transactions?.filter((txn) => {
    if (filters.type && txn.type !== filters.type) return false;
    if (filters.success !== undefined && 'success' in txn && txn.success !== filters.success) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </Link>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Latest Transactions</h1>
      </div>

      {/* Filters */}
      <TransactionFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {/* Transactions List */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="border-b border-border/50">
          <CardTitle>
            Recent Transactions
            {filteredTransactions && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredTransactions.length} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="p-4 border-b border-border/30 last:border-0">
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="divide-y divide-border/30">
              {filteredTransactions.map((txn) => {
                // Skip pending transactions and transactions without success/timestamp for display
                if (!('success' in txn) || !('timestamp' in txn)) return null;
                const typeInfo = txn.type
                  ? getTransactionTypeLabel(txn.type)
                  : { label: 'Transaction', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
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
  );
}
