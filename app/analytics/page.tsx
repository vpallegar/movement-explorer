'use client';

import { useState } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileCode,
  UserCog,
  Activity,
  Zap,
  ArrowLeft,
  DollarSign,
  Fuel,
} from 'lucide-react';
import Link from 'next/link';
import { useNetwork } from '@/providers/network-provider';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const RANGE_OPTIONS = [
  { label: '7D', value: 7 },
  { label: '14D', value: 14 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
  { label: '1Y', value: 365 },
];

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics();
  const { currentNetworkType } = useNetwork();
  const [selectedRange, setSelectedRange] = useState(30);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </Link>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No analytics data available for this network</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract all data from analytics
  const peakTPS = analytics?.max_tps_15_blocks_in_past_30_days?.[0]?.max_tps_15_blocks_in_past_30_days;
  const totalAccounts = analytics?.total_accounts?.[0]?.total_accounts;
  const totalContracts = analytics?.cumulative_deployers?.[0]?.cumulative_contracts_deployed;
  const totalDeployers = analytics?.cumulative_deployers?.[0]?.cumulative_contract_deployers;
  const nodeCount = analytics?.latest_node_count?.[0]?.approx_nodes;

  // Daily data arrays
  const dailyActiveUsers = analytics?.daily_active_users || [];
  const dailyUserTransactions = analytics?.daily_user_transactions || [];
  const dailyPeakTPS = analytics?.daily_max_tps_15_blocks || [];
  const monthlyActiveUsers = analytics?.mau_signers || [];
  const dailyNewAccounts = analytics?.daily_new_accounts_created || [];
  const dailyDeployedContracts = analytics?.daily_deployed_contracts || [];
  const dailyContractDeployers = analytics?.daily_contract_deployers || [];
  const dailyGasConsumption = analytics?.daily_gas_from_user_transactions || [];
  const dailyAvgGasPrice = analytics?.daily_average_gas_unit_price || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Network Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive statistics for the Movement Network
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {currentNetworkType.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Range Selector */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Time Range:</span>
            {RANGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={selectedRange === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Peak TPS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {peakTPS ? Math.round(peakTPS).toLocaleString() : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Peak transactions per second (30 days)
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAccounts ? totalAccounts.toLocaleString() : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time account count
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deployed Contracts</CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalContracts ? totalContracts.toLocaleString() : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total contracts deployed
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contract Deployers</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDeployers ? totalDeployers.toLocaleString() : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique deployer addresses
            </p>
          </CardContent>
        </Card>

        {nodeCount && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Nodes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nodeCount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Approximate node count
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Daily User Transactions */}
        {dailyUserTransactions.length > 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <CardTitle className="text-base">User Transactions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyUserTransactions.slice(-selectedRange)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 10 }} hide />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Line type="monotone" dataKey="num_user_transactions" stroke="#82ca9d" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Peak TPS */}
        {dailyPeakTPS.length > 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <CardTitle className="text-base">Peak TPS</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyPeakTPS.slice(-selectedRange)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 10 }} hide />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Line type="monotone" dataKey="max_tps_15_blocks" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Monthly Active Users */}
        {monthlyActiveUsers.length > 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle className="text-base">Monthly Active Users</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyActiveUsers.slice(-selectedRange)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 10 }} hide />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Line type="monotone" dataKey="mau_signer_30" stroke="#ffc658" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Active Users */}
        {dailyActiveUsers.length > 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <CardTitle className="text-base">Daily Active Users</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyActiveUsers.slice(-selectedRange)}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 10 }} hide />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Area type="monotone" dataKey="daily_active_user_count" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily New Accounts */}
        {dailyNewAccounts.length > 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle className="text-base">New Accounts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyNewAccounts.slice(-selectedRange)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 10 }} hide />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Bar dataKey="new_account_count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Deployed Contracts */}
        {dailyDeployedContracts.length > 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                <CardTitle className="text-base">Deployed Contracts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyDeployedContracts.slice(-selectedRange)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 10 }} hide />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Bar dataKey="daily_contract_deployed" fill="#ff7c43" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Contract Deployers */}
        {dailyContractDeployers.length > 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                <CardTitle className="text-base">Contract Deployers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyContractDeployers.slice(-selectedRange)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 10 }} hide />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Line type="monotone" dataKey="distinct_deployers" stroke="#a569bd" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Gas Consumption */}
        {dailyGasConsumption.length > 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                <CardTitle className="text-base">Gas Consumption</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyGasConsumption.slice(-selectedRange)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 10 }} hide />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Line type="monotone" dataKey="gas_cost" stroke="#e74c3c" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Avg Gas Price */}
        {dailyAvgGasPrice.length > 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <CardTitle className="text-base">Avg Gas Unit Price</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyAvgGasPrice.slice(-selectedRange)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 10 }} hide />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Line type="monotone" dataKey="avg_gas_unit_price" stroke="#f39c12" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
