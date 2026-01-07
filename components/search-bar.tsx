'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useNetwork } from '@/providers/network-provider';
import { performSearch, SearchResult } from '@/lib/utils/search';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const { client } = useNetwork();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        try {
          const searchResults = await performSearch(query.trim(), client);
          setResults(searchResults);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [query, client]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const firstResult = results.find((r) => r.to !== null);
    if (firstResult?.to) {
      router.push(firstResult.to);
      setShowResults(false);
      setQuery('');
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.to) {
      router.push(result.to);
      setShowResults(false);
      setQuery('');
    }
  };

  return (
    <div ref={searchRef} className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSearch} className="w-full">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
            )}
            <Input
              type="text"
              placeholder="Search by Address / Txn Hash / Block / Account / Token"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setShowResults(true);
              }}
              className="pl-10 h-12 text-base"
            />
          </div>
          <Button type="submit" size="lg" className="px-8">
            Search
          </Button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleResultClick(result)}
              disabled={!result.to}
              className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-0 ${
                !result.to ? 'cursor-default text-muted-foreground' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                {result.image && (
                  <img src={result.image} alt="" className="w-6 h-6 rounded-full" />
                )}
                <div>
                  <div className="text-sm font-medium">{result.label}</div>
                  <div className="text-xs text-muted-foreground capitalize">{result.type}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
