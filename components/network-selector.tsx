'use client';

import { useState } from 'react';
import { useNetwork } from '@/providers/network-provider';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { NetworkType } from '@/lib/config';
import { Settings } from 'lucide-react';

export function NetworkSelector() {
  const { network, switchNetwork, currentNetworkType } = useNetwork();
  const [customUrl, setCustomUrl] = useState('');
  const [customIndexer, setCustomIndexer] = useState('');
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);

  const handleNetworkSwitch = (networkType: NetworkType) => {
    switchNetwork(networkType);
  };

  const handleCustomNetwork = () => {
    // For now, just switch to local - in future, allow custom URLs
    switchNetwork('local');
    setIsCustomDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={currentNetworkType === 'mainnet' ? 'default' : 'secondary'}
        className="font-medium"
      >
        {network.displayName}
      </Badge>

      <div className="flex gap-1">
        <Button
          size="sm"
          variant={currentNetworkType === 'mainnet' ? 'default' : 'outline'}
          onClick={() => handleNetworkSwitch('mainnet')}
        >
          Mainnet
        </Button>
        <Button
          size="sm"
          variant={currentNetworkType === 'testnet' ? 'default' : 'outline'}
          onClick={() => handleNetworkSwitch('testnet')}
        >
          Testnet
        </Button>

        {/* Custom Network Dialog */}
        <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant={currentNetworkType === 'local' ? 'default' : 'outline'}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Custom Network</DialogTitle>
              <DialogDescription>
                Configure a custom network endpoint for local development or private networks.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Node URL</label>
                <Input
                  placeholder="http://localhost:8080/v1"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Indexer URL (optional)</label>
                <Input
                  placeholder="http://localhost:8090/v1/graphql"
                  value={customIndexer}
                  onChange={(e) => setCustomIndexer(e.target.value)}
                />
              </div>
              <div className="pt-2 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Or use default local network:
                </p>
                <div className="bg-muted p-3 rounded-md text-sm font-mono">
                  <div>Node: http://localhost:8080/v1</div>
                  <div>Indexer: http://localhost:8090/v1/graphql</div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCustomDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCustomNetwork}>Use Local Network</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
