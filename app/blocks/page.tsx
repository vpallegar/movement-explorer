'use client';

import { useBlocks } from '@/hooks/use-blocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatTimeAgo, truncateAddress } from '@/lib/utils/format';
import { ArrowLeft, Blocks as BlocksIcon } from 'lucide-react';
import Link from 'next/link';

export default function BlocksPage() {
  const { data: blocks, isLoading, error } = useBlocks({ limit: 30 });

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
        <BlocksIcon className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Latest Blocks</h1>
      </div>

      {/* Blocks Table */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="border-b border-border/50">
          <CardTitle>Recent Blocks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center text-destructive">
              <p>Error loading blocks: {error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          ) : blocks && blocks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead>Block</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">First Version</TableHead>
                  <TableHead className="text-right">Last Version</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((block) => {
                  const numTransactions = BigInt(block.last_version) - BigInt(block.first_version) + BigInt(1);
                  const timestampMicroseconds = parseInt(block.block_timestamp);

                  return (
                    <TableRow key={block.block_height} className="border-border/30">
                      <TableCell>
                        <Link
                          href={`/block/${block.block_height}`}
                          className="text-primary hover:underline font-mono font-medium"
                        >
                          {Number(block.block_height).toLocaleString()}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTimeAgo(timestampMicroseconds)}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {truncateAddress(block.block_hash, 8, 8)}
                        </code>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {numTransactions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/tx/${block.first_version}`}
                          className="text-primary hover:underline font-mono text-sm"
                        >
                          {Number(block.first_version).toLocaleString()}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/tx/${block.last_version}`}
                          className="text-primary hover:underline font-mono text-sm"
                        >
                          {Number(block.last_version).toLocaleString()}
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <p>No blocks found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
