'use client';

import { use } from 'react';
import React from 'react';
import { useAccount, useAccountCoins, useAccountTransactions } from '@/hooks/use-account';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatTimeAgo, truncateAddress, formatMoveAmount } from '@/lib/utils/format';
import { getTokenSymbol } from '@/lib/utils/token';
import { getTransactionTypeLabel } from '@/lib/utils/transaction-types';
import { ArrowLeft, Wallet, Coins, Activity, Copy, Check, X } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModulesTab } from '@/components/account/modules-tab';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center ml-2 px-2 py-1 text-xs rounded hover:bg-accent transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 mr-1" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 mr-1" />
          Copy
        </>
      )}
    </button>
  );
}

// Helper to extract transfer amount from transaction events
function getTransferAmount(txn: Record<string, unknown>): { amount: string; asset: string } | null {
  const events = (txn.events as Array<unknown>) || [];
  const gasUsed = txn.gas_used as string | undefined;
  const gasUnitPrice = txn.gas_unit_price as string | undefined;

  // Calculate gas fee
  const gasFee = gasUsed && gasUnitPrice ? BigInt(gasUsed) * BigInt(gasUnitPrice) : BigInt(0);

  // Look for transfer/deposit/withdraw events
  for (const e of events) {
    const event = e as Record<string, unknown>;
    const type = String(event.type || '').toLowerCase();
    const data = event.data as Record<string, unknown> | undefined;

    if (type.includes('withdraw') || type.includes('deposit') || type.includes('transfer')) {
      const amount = String(data?.amount || '0');
      if (amount !== '0') {
        const coinType = String(data?.coin_type || event.type || '');
        const asset = getTokenSymbol(coinType);

        // If it's a transfer, show transfer amount + gas
        const transferAmount = BigInt(amount);
        const total = transferAmount > gasFee ? transferAmount : gasFee;

        return { amount: total.toString(), asset };
      }
    }
  }

  // If no transfer found, just show gas fee
  if (gasFee > 0) {
    return { amount: gasFee.toString(), asset: 'MOVE' };
  }

  return null;
}

export default function AccountPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const { data: accountInfo, isLoading: accountLoading, error: accountError } = useAccount(address);
  const { data: coins, isLoading: coinsLoading } = useAccountCoins(address);
  const { data: transactions, isLoading: txnsLoading } = useAccountTransactions(address, { limit: 25 });

  if (accountLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (accountError || !accountInfo) {
    return (
      <div className="space-y-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </Link>
        <Card className="border-destructive/50">
          <CardContent className="p-12 text-center">
            <X className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Account Not Found</h2>
            <p className="text-muted-foreground">
              The account with address <code className="text-sm bg-muted px-2 py-1 rounded break-all">{address}</code> could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const account = accountInfo as Record<string, unknown>;
  const sequenceNumber = account.sequence_number as string | undefined;

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
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Account Details</h1>
          <Badge variant="outline" className="bg-primary/10">
            <Wallet className="h-3 w-3 mr-1" />
            Address
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground font-mono break-all">
          {address}
          <CopyButton text={address} />
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {coinsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {coins && Array.isArray(coins) && coins.length > 0
                  ? formatMoveAmount((coins[0] as Record<string, unknown>).amount as string)
                  : '0'}{' '}
                <span className="text-lg text-muted-foreground">MOVE</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sequence Number</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {sequenceNumber ? Number(sequenceNumber).toLocaleString() : '0'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sequenceNumber ? Number(sequenceNumber).toLocaleString() : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tokens */}
      {coins && Array.isArray(coins) && coins.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coins.slice(0, 10).map((coin, index) => {
                  const coinData = coin as Record<string, unknown>;
                  const coinType = String(coinData.asset_type || coinData.coin_type || 'Unknown');
                  const amount = coinData.amount as string;
                  const symbol = getTokenSymbol(coinType);

                  return (
                    <TableRow key={index} className="border-border/30">
                      <TableCell className="font-medium">{symbol}</TableCell>
                      <TableCell className="text-right font-mono">{formatMoveAmount(amount)}</TableCell>
                      <TableCell className="text-right">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{truncateAddress(coinType, 8, 8)}</code>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {txnsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transactions && Array.isArray(transactions) && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead>Hash</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 15).map((txn) => {
                  const txnData = txn as Record<string, unknown>;
                  const hash = txnData.hash as string;
                  const success = txnData.success as boolean;
                  const type = txnData.type as string | undefined;
                  const timestamp = txnData.timestamp as number;
                  const version = txnData.version as number;
                  const transferInfo = getTransferAmount(txnData);
                  const typeInfo = type ? getTransactionTypeLabel(type) : null;

                  return (
                    <TableRow key={version} className="border-border/30">
                      <TableCell>
                        <Link
                          href={`/tx/${hash}`}
                          className="text-primary hover:underline font-mono text-sm"
                        >
                          {truncateAddress(hash, 12, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {typeInfo ? (
                          <Badge variant="outline" className={`text-xs ${typeInfo.color} border`}>
                            {typeInfo.label}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {type?.split('::').pop()?.replace(/_/g, ' ') || 'Transaction'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {transferInfo ? (
                          <span>{formatMoveAmount(transferInfo.amount)} {transferInfo.asset}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {success ? (
                          <span className="text-green-500 text-sm">Success</span>
                        ) : (
                          <span className="text-red-500 text-sm">Failed</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatTimeAgo(timestamp)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <p>No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="modules" className="mt-6">
          <ModulesTab address={address} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
