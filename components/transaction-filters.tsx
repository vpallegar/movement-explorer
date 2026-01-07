'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { X, Filter } from 'lucide-react';
import { TransactionTypeName } from '@/lib/utils/transaction-types';

export interface TransactionFilters {
  type?: string;
  success?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

const transactionTypes = [
  { value: TransactionTypeName.User, label: 'User' },
  { value: TransactionTypeName.BlockMetadata, label: 'Block Metadata' },
  { value: TransactionTypeName.StateCheckpoint, label: 'State Checkpoint' },
  { value: TransactionTypeName.Validator, label: 'Validator' },
  { value: TransactionTypeName.BlockEpilogue, label: 'Block Epilogue' },
  { value: TransactionTypeName.Genesis, label: 'Genesis' },
];

export function TransactionFiltersComponent({ filters, onFiltersChange }: TransactionFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleTypeToggle = (type: string) => {
    onFiltersChange({
      ...filters,
      type: filters.type === type ? undefined : type,
    });
  };

  const handleSuccessToggle = (success: boolean) => {
    onFiltersChange({
      ...filters,
      success: filters.success === success ? undefined : success,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.type || filters.success !== undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {(filters.type ? 1 : 0) + (filters.success !== undefined ? 1 : 0)}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Transaction Type Filter */}
            <div>
              <div className="text-sm font-medium mb-2">Transaction Type</div>
              <div className="flex flex-wrap gap-2">
                {transactionTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={filters.type === type.value ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleTypeToggle(type.value)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <div className="text-sm font-medium mb-2">Status</div>
              <div className="flex gap-2">
                <Badge
                  variant={filters.success === true ? 'default' : 'outline'}
                  className="cursor-pointer bg-green-500/20 text-green-300 hover:bg-green-500/30"
                  onClick={() => handleSuccessToggle(true)}
                >
                  Success
                </Badge>
                <Badge
                  variant={filters.success === false ? 'default' : 'outline'}
                  className="cursor-pointer bg-red-500/20 text-red-300 hover:bg-red-500/30"
                  onClick={() => handleSuccessToggle(false)}
                >
                  Failed
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.type && (
            <Badge variant="secondary" className="gap-2">
              Type: {transactionTypes.find((t) => t.value === filters.type)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleTypeToggle(filters.type!)}
              />
            </Badge>
          )}
          {filters.success !== undefined && (
            <Badge variant="secondary" className="gap-2">
              Status: {filters.success ? 'Success' : 'Failed'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleSuccessToggle(filters.success!)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
