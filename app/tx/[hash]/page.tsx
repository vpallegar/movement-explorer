'use client';

import { use } from 'react';
import React from 'react';
import { useTransaction } from '@/hooks/use-transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimestamp, formatTimeAgo, truncateAddress, formatMoveAmount } from '@/lib/utils/format';
import { getTransactionTypeLabel, TransactionTypeName } from '@/lib/utils/transaction-types';
import { getTokenSymbol } from '@/lib/utils/token';
import { ArrowLeft, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

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
      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      title="Copy to clipboard"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-border/50 rounded-lg bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors text-left"
      >
        <span className="text-sm font-medium">{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// Helper to extract transfer info from events
function extractTransferInfo(events: Array<unknown>) {
  const transferEvents = events.filter((e) => {
    const event = e as Record<string, unknown>;
    const type = String(event.type || '').toLowerCase();
    return type.includes('withdraw') || type.includes('deposit') || type.includes('transfer') || type.includes('coin');
  });

  const withdraws: Array<{ address: string; amount: string; asset: string }> = [];
  const deposits: Array<{ address: string; amount: string; asset: string }> = [];


  transferEvents.forEach((e) => {
    const event = e as Record<string, unknown>;
    const type = String(event.type || '');
    const data = event.data as Record<string, unknown> | undefined;

    const amount = String(data?.amount || data?.value || '0');
    const account = String(data?.account || data?.owner || data?.sender || data?.receiver || '');

    // Try to get coin type from various possible locations
    const coinType = String(data?.coin_type || data?.asset_type || data?.token_type || '');
    const asset = getTokenSymbol(coinType || type);

    if (type.toLowerCase().includes('withdraw') || type.toLowerCase().includes('sent')) {
      if (account) {
        withdraws.push({ address: account, amount, asset });
      }
    } else if (type.toLowerCase().includes('deposit') || type.toLowerCase().includes('received')) {
      if (account) {
        deposits.push({ address: account, amount, asset });
      }
    }
  });

  const filterAndDedupe = (items: typeof withdraws) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (item.amount === '0') return false;
      const key = `${item.address}-${item.amount}-${item.asset}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  return {
    withdraws: filterAndDedupe(withdraws),
    deposits: filterAndDedupe(deposits),
  };
}

export default function TransactionPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = use(params);
  const { data: transaction, isLoading, error } = useTransaction(hash);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="space-y-4 pt-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </Link>
        <Card className="border-destructive/50">
          <CardContent className="p-12 text-center">
            <X className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Transaction Not Found</h2>
            <p className="text-muted-foreground">
              Could not find transaction with hash <code className="text-sm bg-muted px-2 py-1 rounded">{hash}</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const txData = transaction as Record<string, unknown>;
  const isSuccess = txData.success === true;
  const txnType = txData.type as string | undefined;
  const sender = txData.sender as string | undefined;
  const gasUsed = txData.gas_used as string | undefined;
  const gasUnitPrice = txData.gas_unit_price as string | undefined;
  const timestamp = txData.timestamp as number | undefined;
  const payload = txData.payload as Record<string, unknown> | undefined;
  const events = (txData.events as Array<unknown>) || [];

  // Get transaction type info
  const typeInfo = txnType ? getTransactionTypeLabel(txnType) : null;

  const { withdraws, deposits } = extractTransferInfo(events);

  // Extract function and contract information
  const functionName = payload?.function ? String(payload.function) : undefined;
  const functionParts = functionName?.split('::');
  const contractAddress = functionParts?.[0];
  const moduleName = functionParts?.[1];
  const methodName = functionParts?.[2];

  // Try to find receiver from events or payload
  let receiver: string | undefined;
  if (deposits.length > 0) {
    receiver = deposits[0].address;
  } else {
    // Try to get receiver from payload arguments
    const args = payload?.arguments as Array<unknown> | undefined;
    if (args && args.length > 0 && typeof args[0] === 'string' && args[0].startsWith('0x')) {
      receiver = args[0];
    }
  }

  // Calculate total fee
  const totalFee = gasUsed && gasUnitPrice
    ? formatMoveAmount(BigInt(gasUsed) * BigInt(gasUnitPrice))
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Explorer
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">Transaction Details</h1>
            {typeInfo && (
              <Badge variant="outline" className={`${typeInfo.color} border`}>
                {typeInfo.label}
              </Badge>
            )}
            {isSuccess ? (
              <Badge className="bg-green-500 text-white">Success</Badge>
            ) : (
              <Badge className="bg-red-500 text-white">Failed</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <code className="text-muted-foreground font-mono text-xs">{hash}</code>
            <CopyButton text={hash} />
          </div>
        </div>
        {timestamp && (
          <div className="text-right text-sm">
            <div className="text-muted-foreground">Confirmed</div>
            <div className="font-medium">{formatTimeAgo(timestamp)}</div>
            <div className="text-xs text-muted-foreground">{formatTimestamp(timestamp)}</div>
          </div>
        )}
      </div>

      {/* Key Transaction Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* For block metadata transactions */}
            {txnType === TransactionTypeName.BlockMetadata && (
              <>
                {txData.id && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Block ID</div>
                    <div className="text-sm font-mono">{String(txData.id)}</div>
                  </div>
                )}
                {txData.epoch && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Epoch</div>
                    <div className="text-sm font-mono">{String(txData.epoch)}</div>
                  </div>
                )}
                {txData.round && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Round</div>
                    <div className="text-sm font-mono">{String(txData.round)}</div>
                  </div>
                )}
              </>
            )}

            {/* For state checkpoint transactions */}
            {txnType === TransactionTypeName.StateCheckpoint && (
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground mb-1">Description</div>
                <div className="text-sm">System-generated transaction that saves the latest state of the blockchain.</div>
              </div>
            )}

            {/* For user transactions */}
            {txnType === TransactionTypeName.User && (
              <>
                {sender && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Sender</div>
                    <Link href={`/account/${sender}`} className="text-sm text-primary hover:underline font-mono">
                      {truncateAddress(sender, 12, 12)}
                    </Link>
                  </div>
                )}

                {receiver && receiver !== sender && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Receiver</div>
                    <Link href={`/account/${receiver}`} className="text-sm text-primary hover:underline font-mono">
                      {truncateAddress(receiver, 12, 12)}
                    </Link>
                  </div>
                )}

                {contractAddress && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Smart Contract</div>
                    <Link href={`/account/${contractAddress}`} className="text-sm text-primary hover:underline font-mono">
                      {truncateAddress(contractAddress, 12, 12)}
                    </Link>
                    {moduleName && methodName && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {moduleName}::{methodName}
                      </div>
                    )}
                  </div>
                )}

                {(withdraws.length > 0 || deposits.length > 0) && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Amount Transferred</div>
                    <div className="text-sm font-mono font-semibold">
                      {withdraws.length > 0 && `${formatMoveAmount(withdraws[0].amount)} ${withdraws[0].asset}`}
                      {withdraws.length === 0 && deposits.length > 0 && `${formatMoveAmount(deposits[0].amount)} ${deposits[0].asset}`}
                    </div>
                  </div>
                )}

                {totalFee && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Transaction Fee</div>
                    <div className="text-sm font-mono">{totalFee} MOVE</div>
                  </div>
                )}
              </>
            )}

            {/* For other transaction types, show basic info */}
            {txnType && txnType !== TransactionTypeName.User && txnType !== TransactionTypeName.BlockMetadata && txnType !== TransactionTypeName.StateCheckpoint && (
              <>
                {sender && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Sender</div>
                    <Link href={`/account/${sender}`} className="text-sm text-primary hover:underline font-mono">
                      {truncateAddress(sender, 12, 12)}
                    </Link>
                  </div>
                )}
                {totalFee && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Transaction Fee</div>
                    <div className="text-sm font-mono font-semibold">{totalFee} MOVE</div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transfer Summary - Show if available */}
      {(withdraws.length > 0 || deposits.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {withdraws.length > 0 && (
            <Card className="border-red-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {withdraws.map((w, i) => (
                  <div key={i} className="bg-red-500 text-white p-4 rounded-lg">
                    <div className="font-bold text-2xl font-mono mb-2">
                      {formatMoveAmount(w.amount)} {w.asset}
                    </div>
                    <div className="text-sm opacity-90">
                      <Link href={`/account/${w.address}`} className="underline font-mono">
                        {truncateAddress(w.address, 8, 6)}
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {deposits.length > 0 && (
            <Card className="border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Received</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {deposits.map((d, i) => (
                  <div key={i} className="bg-green-500 text-white p-4 rounded-lg">
                    <div className="font-bold text-2xl font-mono mb-2">
                      {formatMoveAmount(d.amount)} {d.asset}
                    </div>
                    <div className="text-sm opacity-90">
                      <Link href={`/account/${d.address}`} className="underline font-mono">
                        {truncateAddress(d.address, 8, 6)}
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Advanced Details - Collapsed by default */}
      <div className="space-y-3">
        {functionName && (
          <CollapsibleSection title="Smart Contract Call">
            <div className="space-y-3 mt-3">
              <div className="flex items-start justify-between text-sm">
                <span className="text-muted-foreground">Function</span>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                  {methodName || functionName}
                </code>
              </div>
              <div className="flex items-start justify-between text-sm">
                <span className="text-muted-foreground">Contract</span>
                <Link
                  href={`/account/${functionParts?.[0]}`}
                  className="text-xs text-primary hover:underline font-mono"
                >
                  {truncateAddress(functionParts?.[0] || '', 10, 8)}
                </Link>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {gasUsed && gasUnitPrice && (
          <CollapsibleSection title="Gas Details">
            <div className="space-y-3 mt-3">
              <div className="flex items-start justify-between text-sm">
                <span className="text-muted-foreground">Gas Used</span>
                <span className="font-mono">{Number(gasUsed).toLocaleString()} units</span>
              </div>
              <div className="flex items-start justify-between text-sm">
                <span className="text-muted-foreground">Gas Price</span>
                <span className="font-mono">{formatMoveAmount(gasUnitPrice)} MOVE</span>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {events.length > 0 && (
          <CollapsibleSection title={`Events (${events.length})`}>
            <div className="space-y-2 mt-3">
              {events.map((event, index) => {
                const eventData = event as Record<string, unknown>;
                const eventType = String(eventData.type || 'Unknown');
                const shortType = eventType.split('::').pop() || eventType;

                return (
                  <details key={index} className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground py-2">
                      Event #{index + 1}: {shortType}
                    </summary>
                    <pre className="text-xs bg-muted/50 p-3 rounded overflow-x-auto mt-2">
                      {JSON.stringify(eventData, null, 2)}
                    </pre>
                  </details>
                );
              })}
            </div>
          </CollapsibleSection>
        )}

        <CollapsibleSection title="Raw Transaction Data">
          <pre className="text-xs bg-muted/50 p-4 rounded overflow-x-auto mt-3">
            {JSON.stringify(transaction, null, 2)}
          </pre>
        </CollapsibleSection>
      </div>
    </div>
  );
}
