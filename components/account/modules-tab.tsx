'use client';

import React, { useState } from 'react';
import { useAccountModules } from '@/hooks/use-account-modules';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileCode, Package, Eye, Loader2, Play, Wallet as WalletIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNetwork } from '@/providers/network-provider';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

interface ModulesTabProps {
  address: string;
}

export function ModulesTab({ address }: ModulesTabProps) {
  const { data: modules, isLoading } = useAccountModules(address);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!modules || (Array.isArray(modules) && modules.length === 0)) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No modules found for this account</p>
        </CardContent>
      </Card>
    );
  }

  const modulesArray = Array.isArray(modules) ? modules : [];

  // Group modules by package (extract from module name)
  const packageGroups: Record<string, typeof modulesArray> = {};
  modulesArray.forEach((module: any) => {
    const abi = module.abi;
    if (abi) {
      const moduleName = abi.name;
      // Use the module name as package name for now
      // In a real implementation, you'd extract package info from metadata
      const packageName = abi.address || 'default';
      if (!packageGroups[packageName]) {
        packageGroups[packageName] = [];
      }
      packageGroups[packageName].push(module);
    }
  });

  return (
    <Tabs defaultValue="packages" className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
        <TabsTrigger value="packages">
          <Package className="h-4 w-4 mr-2" />
          Packages
        </TabsTrigger>
        <TabsTrigger value="code">
          <FileCode className="h-4 w-4 mr-2" />
          Code
        </TabsTrigger>
        <TabsTrigger value="view">
          <Eye className="h-4 w-4 mr-2" />
          View
        </TabsTrigger>
        <TabsTrigger value="run">
          <Play className="h-4 w-4 mr-2" />
          Run
        </TabsTrigger>
      </TabsList>

      <TabsContent value="packages" className="mt-6">
        <PackagesView modules={modulesArray} address={address} />
      </TabsContent>

      <TabsContent value="code" className="mt-6">
        <CodeView
          modules={modulesArray}
          selectedModule={selectedModule}
          setSelectedModule={setSelectedModule}
        />
      </TabsContent>

      <TabsContent value="view" className="mt-6">
        <ViewFunctionsTab modules={modulesArray} address={address} />
      </TabsContent>

      <TabsContent value="run" className="mt-6">
        <RunFunctionsTab modules={modulesArray} address={address} />
      </TabsContent>
    </Tabs>
  );
}

function PackagesView({ modules, address }: { modules: any[]; address: string }) {
  return (
    <div className="grid gap-4">
      {modules.map((module: any, index: number) => {
        const abi = module.abi;
        if (!abi) return null;

        return (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold font-mono">{abi.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      {abi.address}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {abi.exposed_functions?.length || 0} functions
                  </Badge>
                </div>

                {abi.friends && abi.friends.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Friends:</p>
                    <div className="space-y-1">
                      {abi.friends.map((friend: string, i: number) => (
                        <p key={i} className="text-xs font-mono text-muted-foreground">
                          {friend}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {abi.exposed_functions && abi.exposed_functions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Functions:</p>
                    <div className="flex flex-wrap gap-2">
                      {abi.exposed_functions.slice(0, 10).map((fn: any, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {fn.name}
                        </Badge>
                      ))}
                      {abi.exposed_functions.length > 10 && (
                        <Badge variant="secondary" className="text-xs">
                          +{abi.exposed_functions.length - 10} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CodeView({
  modules,
  selectedModule,
  setSelectedModule,
}: {
  modules: any[];
  selectedModule: string | null;
  setSelectedModule: (name: string) => void;
}) {
  // Auto-select first module if none selected
  React.useEffect(() => {
    if (!selectedModule && modules.length > 0 && modules[0].abi) {
      setSelectedModule(modules[0].abi.name);
    }
  }, [modules, selectedModule, setSelectedModule]);

  const selected = modules.find((m: any) => m.abi?.name === selectedModule);

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {/* Sidebar */}
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3">Select Module</p>
          <div className="space-y-1">
            {modules.map((module: any, index: number) => {
              const abi = module.abi;
              if (!abi) return null;

              return (
                <Button
                  key={index}
                  variant={selectedModule === abi.name ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left font-mono text-xs"
                  onClick={() => setSelectedModule(abi.name)}
                >
                  {abi.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Code Display */}
      <Card className="lg:col-span-3">
        <CardContent className="p-6">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold font-mono">{selected.abi.name}</h3>
                <Badge>{selected.abi.exposed_functions?.length || 0} functions</Badge>
              </div>

              {/* Bytecode */}
              <div>
                <p className="text-sm font-medium mb-2">Bytecode</p>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs font-mono">{selected.bytecode || 'No bytecode available'}</pre>
                </div>
              </div>

              {/* Source Code (if available) */}
              {selected.source_code && (
                <div>
                  <p className="text-sm font-medium mb-2">Source Code</p>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">
                    <pre className="text-xs font-mono">{selected.source_code}</pre>
                  </div>
                </div>
              )}

              {/* ABI */}
              <div>
                <p className="text-sm font-medium mb-2">ABI (JSON)</p>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto max-h-[400px] overflow-y-auto">
                  <pre className="text-xs font-mono">{JSON.stringify(selected.abi, null, 2)}</pre>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Select a module to view its code
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ViewFunctionsTab({ modules, address }: { modules: any[]; address: string }) {
  const [selectedFunction, setSelectedFunction] = useState<{ module: string; fn: any } | null>(null);

  // Extract all view functions from all modules
  const viewFunctions: Array<{ moduleName: string; fn: any }> = [];
  modules.forEach((module: any) => {
    if (module.abi && module.abi.exposed_functions) {
      module.abi.exposed_functions.forEach((fn: any) => {
        if (fn.is_view) {
          viewFunctions.push({ moduleName: module.abi.name, fn });
        }
      });
    }
  });

  if (viewFunctions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No view functions found in deployed modules</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {/* Sidebar */}
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3">Select Function</p>
          <div className="space-y-3">
            {Object.entries(
              viewFunctions.reduce((acc, item) => {
                if (!acc[item.moduleName]) {
                  acc[item.moduleName] = [];
                }
                acc[item.moduleName].push(item.fn);
                return acc;
              }, {} as Record<string, any[]>)
            ).map(([moduleName, fns]) => (
              <div key={moduleName}>
                <p className="text-xs font-semibold text-muted-foreground mb-1">{moduleName}</p>
                <div className="space-y-1">
                  {fns.map((fn: any, i: number) => (
                    <Button
                      key={i}
                      variant={
                        selectedFunction?.module === moduleName && selectedFunction?.fn.name === fn.name
                          ? 'secondary'
                          : 'ghost'
                      }
                      className="w-full justify-start text-left font-mono text-xs"
                      onClick={() => setSelectedFunction({ module: moduleName, fn })}
                    >
                      {fn.name}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Function Call Form */}
      <Card className="lg:col-span-3">
        <CardContent className="p-6">
          {selectedFunction ? (
            <ViewFunctionForm
              address={address}
              moduleName={selectedFunction.module}
              fn={selectedFunction.fn}
            />
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Select a view function to call
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ViewFunctionForm({
  address,
  moduleName,
  fn,
}: {
  address: string;
  moduleName: string;
  fn: any;
}) {
  const { client } = useNetwork();
  const [typeArgs, setTypeArgs] = useState<string[]>(
    new Array(fn.generic_type_params?.length || 0).fill('')
  );
  const [args, setArgs] = useState<string[]>(new Array(fn.params?.length || 0).fill(''));
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Prepare the view request
      const payload = {
        function: `${address}::${moduleName}::${fn.name}`,
        typeArguments: typeArgs.filter((t) => t.trim() !== ''),
        functionArguments: args.filter((a) => a.trim() !== ''),
      };

      // Call the view function
      const response = await client.client.view({ payload });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to call view function');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold font-mono mb-2">{fn.name}</h3>
        <p className="text-sm text-muted-foreground font-mono">
          {address}::{moduleName}::{fn.name}
        </p>
      </div>

      {/* Type Arguments */}
      {fn.generic_type_params && fn.generic_type_params.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Type Arguments</p>
          {fn.generic_type_params.map((_: any, index: number) => (
            <Input
              key={`type-${index}`}
              placeholder={`T${index}`}
              value={typeArgs[index]}
              onChange={(e) => {
                const newTypeArgs = [...typeArgs];
                newTypeArgs[index] = e.target.value;
                setTypeArgs(newTypeArgs);
              }}
            />
          ))}
        </div>
      )}

      {/* Function Arguments */}
      {fn.params && fn.params.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Arguments</p>
          {fn.params.map((param: string, index: number) => (
            <div key={`arg-${index}`}>
              <label className="text-xs text-muted-foreground">{param}</label>
              <Input
                placeholder={param}
                value={args[index]}
                onChange={(e) => {
                  const newArgs = [...args];
                  newArgs[index] = e.target.value;
                  setArgs(newArgs);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Calling...
          </>
        ) : (
          'Call Function'
        )}
      </Button>

      {/* Result Display */}
      {result && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Result</p>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2 text-destructive">Error</p>
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-xs font-medium mb-2">Instructions:</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Vector arguments can be provided as JSON arrays (e.g., ["0x1", "0x2"])</li>
          <li>Numbers and booleans should not have quotes in JSON format</li>
          <li>Addresses must start with 0x</li>
        </ul>
      </div>
    </form>
  );
}

function RunFunctionsTab({ modules, address }: { modules: any[]; address: string }) {
  const [selectedFunction, setSelectedFunction] = useState<{ module: string; fn: any } | null>(null);

  // Extract all entry functions from all modules
  const entryFunctions: Array<{ moduleName: string; fn: any }> = [];
  modules.forEach((module: any) => {
    if (module.abi && module.abi.exposed_functions) {
      module.abi.exposed_functions.forEach((fn: any) => {
        if (fn.is_entry) {
          entryFunctions.push({ moduleName: module.abi.name, fn });
        }
      });
    }
  });

  if (entryFunctions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No entry functions found in deployed modules</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {/* Sidebar */}
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3">Select Function</p>
          <div className="space-y-3">
            {Object.entries(
              entryFunctions.reduce((acc, item) => {
                if (!acc[item.moduleName]) {
                  acc[item.moduleName] = [];
                }
                acc[item.moduleName].push(item.fn);
                return acc;
              }, {} as Record<string, any[]>)
            ).map(([moduleName, fns]) => (
              <div key={moduleName}>
                <p className="text-xs font-semibold text-muted-foreground mb-1">{moduleName}</p>
                <div className="space-y-1">
                  {fns.map((fn: any, i: number) => (
                    <Button
                      key={i}
                      variant={
                        selectedFunction?.module === moduleName && selectedFunction?.fn.name === fn.name
                          ? 'secondary'
                          : 'ghost'
                      }
                      className="w-full justify-start text-left font-mono text-xs"
                      onClick={() => setSelectedFunction({ module: moduleName, fn })}
                    >
                      {fn.name}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Function Call Form */}
      <Card className="lg:col-span-3">
        <CardContent className="p-6">
          {selectedFunction ? (
            <RunFunctionForm
              address={address}
              moduleName={selectedFunction.module}
              fn={selectedFunction.fn}
            />
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Select an entry function to run
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RunFunctionForm({
  address,
  moduleName,
  fn,
}: {
  address: string;
  moduleName: string;
  fn: any;
}) {
  const { connected, account, signAndSubmitTransaction, connect } = useWallet();
  const [typeArgs, setTypeArgs] = useState<string[]>(
    new Array(fn.generic_type_params?.length || 0).fill('')
  );
  const [args, setArgs] = useState<string[]>(
    new Array(fn.params?.filter((p: string) => p !== 'signer' && p !== '&signer').length || 0).fill('')
  );
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter out signer params
  const fnParams = fn.params?.filter((p: string) => p !== 'signer' && p !== '&signer') || [];
  const hasSigner = fnParams.length !== fn.params?.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Prepare the transaction payload
      const payload = {
        data: {
          function: `${address}::${moduleName}::${fn.name}`,
          typeArguments: typeArgs.filter((t) => t.trim() !== ''),
          functionArguments: args.filter((a) => a.trim() !== ''),
        },
      };

      // Submit transaction
      const response = await signAndSubmitTransaction(payload);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to submit transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold font-mono mb-2">{fn.name}</h3>
        <p className="text-sm text-muted-foreground font-mono">
          {address}::{moduleName}::{fn.name}
        </p>
      </div>

      {/* Wallet Connection Status */}
      {!connected ? (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <WalletIcon className="h-5 w-5 text-yellow-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Wallet Not Connected</p>
              <p className="text-xs text-muted-foreground mt-1">
                You need to connect a wallet to run entry functions
              </p>
            </div>
            <Button type="button" onClick={connect} variant="outline">
              Connect Wallet
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <WalletIcon className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Wallet Connected</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {account?.address}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Signer Info */}
      {hasSigner && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Signer</p>
          <Input
            value={account?.address || 'Not connected'}
            disabled
            className="font-mono text-xs"
          />
        </div>
      )}

      {/* Type Arguments */}
      {fn.generic_type_params && fn.generic_type_params.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Type Arguments</p>
          {fn.generic_type_params.map((_: any, index: number) => (
            <Input
              key={`type-${index}`}
              placeholder={`T${index}`}
              value={typeArgs[index]}
              onChange={(e) => {
                const newTypeArgs = [...typeArgs];
                newTypeArgs[index] = e.target.value;
                setTypeArgs(newTypeArgs);
              }}
            />
          ))}
        </div>
      )}

      {/* Function Arguments */}
      {fnParams.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Arguments</p>
          {fnParams.map((param: string, index: number) => (
            <div key={`arg-${index}`}>
              <label className="text-xs text-muted-foreground">{param}</label>
              <Input
                placeholder={param}
                value={args[index]}
                onChange={(e) => {
                  const newArgs = [...args];
                  newArgs[index] = e.target.value;
                  setArgs(newArgs);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={loading || !connected} className="w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting Transaction...
          </>
        ) : (
          'Run Function'
        )}
      </Button>

      {/* Result Display */}
      {result && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2 text-green-500">Transaction Submitted</p>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Transaction Hash</p>
              <Link
                href={`/tx/${result.hash}`}
                className="text-xs font-mono text-primary hover:underline break-all"
              >
                {result.hash}
              </Link>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Full Response</p>
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2 text-destructive">Error</p>
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-xs font-medium mb-2">Instructions:</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Connect your wallet to run entry functions</li>
          <li>Entry functions modify blockchain state and require gas fees</li>
          <li>Vector arguments can be provided as JSON arrays (e.g., ["0x1", "0x2"])</li>
          <li>Numbers and booleans should not have quotes in JSON format</li>
          <li>Addresses must start with 0x</li>
        </ul>
      </div>
    </form>
  );
}
