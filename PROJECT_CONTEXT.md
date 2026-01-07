# Movement Explorer - Project Context

## Overview

This is a **new, user-friendly blockchain explorer** for the Movement Network, designed to provide an **Etherscan-like UX** for the Movement blockchain (built on Move language infrastructure).

The project was created to replace the existing developer-focused explorer with a cleaner, more accessible interface for end users.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component Library**: Movement Design System (`@movementlabsxyz/movement-design-system`)
- **UI Components**: shadcn/ui + Movement custom components
- **State Management**: React Query (TanStack Query) v5
- **Blockchain SDK**: Aptos Labs TS SDK v5 (`@aptos-labs/ts-sdk`) for Movement blockchain interactions
- **Icons**: Lucide React

---

## Project Structure

```
explorer-movement/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page (stats + recent txns)
│   ├── globals.css               # Global styles + Movement design system imports
│   ├── tx/                       # Transaction detail pages (to be built)
│   ├── address/                  # Address/account pages (to be built)
│   └── block/                    # Block detail pages (to be built)
│
├── components/                   # React components
│   ├── header.tsx                # Navigation header
│   ├── search-bar.tsx            # Universal search component
│   ├── network-selector.tsx      # Network switcher (mainnet/testnet/custom)
│   └── ui/                       # shadcn/ui components
│
├── hooks/                        # Custom React hooks
│   ├── use-ledger-info.ts        # Fetch chain ledger info
│   ├── use-transactions.ts       # Fetch transactions
│   └── use-account.ts            # Fetch account data
│
├── lib/                          # Core library code
│   ├── config.ts                 # Network configuration (mainnet/testnet/local)
│   ├── api/
│   │   └── client.ts             # MovementClient wrapper using Aptos SDK
│   └── utils/
│       └── format.ts             # Formatting utilities (addresses, timestamps, MOVE amounts)
│
├── providers/                    # React Context providers
│   ├── query-provider.tsx        # React Query client provider
│   └── network-provider.tsx      # Network state management (network switching)
│
├── .env.local                    # Environment variables (network URLs)
└── package.json                  # Dependencies
```

---

## Key Features Implemented

### 1. Network Management
- **Mainnet**: `https://mainnet.movementnetwork.xyz/v1`
- **Testnet (Bardock)**: `https://testnet.movementnetwork.xyz/v1`
- **Custom/Local**: User-configurable endpoints (via dialog)
- Network switcher in header with visual badge

### 2. Home Page
- **Network Statistics Cards**:
  - Block height
  - Total transactions (ledger version)
  - Latest block time
  - Chain ID
- **Recent Transactions List**:
  - Shows last 10 transactions
  - Transaction hash, type, status (success/failed)
  - Time ago display
  - Links to transaction detail pages

### 3. Search Functionality
- **Smart search bar** that detects:
  - Transaction hashes (66 chars starting with 0x)
  - Account addresses (0x prefix, variable length)
  - Block heights (numeric)
  - ANS names (fallback to address)

### 4. API Integration
- **MovementClient** class uses Aptos SDK for Movement blockchain interactions
- **React Query hooks** for caching and data fetching
- **Dual data sources**: REST API + GraphQL Indexer
- **Singleton client instances** per network

### 5. Design System
- Movement Design System integrated via CSS imports
- Component styles: `@movementlabsxyz/movement-design-system/component-styles`
- Theme: `@movementlabsxyz/movement-design-system/theme`
- Storybook docs: https://movement-design-system-docs-git-shadcn-movement-labs.vercel.app

---

## What's Working

✅ Next.js 15 project setup with TypeScript
✅ Movement design system integrated
✅ Network configuration (mainnet/testnet/local)
✅ API client using Aptos SDK v5 for Movement blockchain
✅ React Query data fetching
✅ Home page with live network stats
✅ Recent transactions display
✅ Universal search bar
✅ Network switcher with custom network dialog
✅ Responsive layout with header/footer

---

## What's Next (To Build)

### Phase 1 - Core Pages
- [ ] **Transaction Detail Page** (`/tx/[hash]`)
  - Transaction metadata (type, status, timestamp)
  - Sender/receiver addresses
  - Gas used/fee paid
  - Events emitted
  - Payload/function details

- [ ] **Address/Account Page** (`/address/[address]`)
  - Account balance (MOVE)
  - Token holdings (coins)
  - Transaction history (paginated)
  - Resources (simplified view, not 10 tabs)
  - Module list (if applicable)

- [ ] **Block Details Page** (`/block/[height]`)
  - Block metadata (height, timestamp, proposer)
  - Transaction list in block
  - Block hash/version

- [ ] **Transactions List Page** (`/transactions`)
  - Paginated list of all transactions
  - Filters (type, status)

### Phase 2 - Advanced Features
- [ ] **Validators Page** (`/validators`)
  - Validator list with voting power
  - Staking interface (reuse from old explorer)
  - Commission rates

- [ ] **Token/Coin Pages** (`/coin/[address]`)
  - Token metadata
  - Holders list
  - Transfer history

- [ ] **Analytics Dashboard** (`/analytics`)
  - Charts (TPS, DAU, gas costs)
  - Network health metrics

### Phase 3 - UX Enhancements
- [ ] **Dark mode toggle**
- [ ] **Mobile navigation menu**
- [ ] **Copy-to-clipboard buttons** on addresses/hashes
- [ ] **Toast notifications** for user actions
- [ ] **Error pages** (404, 500)
- [ ] **Loading states** refinement
- [ ] **SEO optimization** (metadata, OpenGraph)

### Phase 4 - Advanced Features
- [ ] **Contract verification** (Move modules)
- [ ] **NFT galleries** on address pages
- [ ] **Wallet connection** (optional, for transactions)
- [ ] **API rate limiting handling**
- [ ] **Caching strategies** (ISR, SSG where applicable)

---

## Environment Variables

Located in `.env.local`:

```bash
# Network endpoints
NEXT_PUBLIC_MAINNET_URL=https://mainnet.movementnetwork.xyz/v1
NEXT_PUBLIC_TESTNET_URL=https://testnet.movementnetwork.xyz/v1
NEXT_PUBLIC_MAINNET_INDEXER=https://indexer.mainnet.movementnetwork.xyz/v1/graphql
NEXT_PUBLIC_TESTNET_INDEXER=https://hasura.testnet.movementnetwork.xyz/v1/graphql

# Default network (mainnet or testnet)
NEXT_PUBLIC_DEFAULT_NETWORK=mainnet

# Optional analytics
NEXT_PUBLIC_GA_TRACKING_ID=
```

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint

# Add shadcn/ui components
pnpm dlx shadcn@latest add <component-name>
```

---

## Key Design Decisions

### 1. Why Next.js 15 App Router?
- **Server Components** for better performance
- **Built-in routing** with file-based system
- **SEO-friendly** (important for blockchain explorers)
- **Incremental Static Regeneration** (ISR) for caching
- **Server-side rendering** for dynamic pages

### 2. Why React Query?
- **Automatic caching** and refetching
- **Stale-while-revalidate** pattern
- **Pagination support**
- **Background updates**
- **Proven pattern** from existing explorer

### 3. Why Movement Design System?
- **Brand consistency** with Movement ecosystem
- **Pre-built components** matching Movement style
- **Less custom CSS** needed
- **Theme variables** for easy customization

### 4. Single Client Instances
- **Performance**: Avoid creating multiple SDK instances
- **Connection pooling**: Reuse HTTP connections
- **State consistency**: Single source of truth per network

---

## API Patterns

### Example: Fetching Ledger Info

```typescript
// Hook (hooks/use-ledger-info.ts)
import { useQuery } from '@tanstack/react-query';
import { useNetwork } from '@/providers/network-provider';

export function useLedgerInfo() {
  const { client, network } = useNetwork();

  return useQuery({
    queryKey: ['ledger-info', network.name],
    queryFn: () => client.getLedgerInfo(),
    refetchInterval: 5000, // Refresh every 5s
  });
}

// Usage in component
const { data, isLoading, error } = useLedgerInfo();
```

### Example: Switching Networks

```typescript
// In a component
import { useNetwork } from '@/providers/network-provider';

const { switchNetwork } = useNetwork();

// Switch to testnet
switchNetwork('testnet');
```

---

## Differences from Old Explorer

| Feature | Old Explorer | New Explorer (This Project) |
|---------|--------------|------------------------------|
| **Framework** | React + Vite | Next.js 15 (App Router) |
| **UI Library** | Material-UI | Movement Design System + shadcn/ui |
| **Account Page** | 10+ tabs, complex | Simplified single-page view |
| **Terminology** | Technical | User-friendly terms |
| **Mobile** | Limited responsive | Fully responsive |
| **Search** | Basic | Smart type detection |
| **Network Switching** | URL param + localStorage | Context-based with dialog |
| **Target Audience** | Developers | All users (Etherscan-like) |

---

## Reusable Patterns from Old Explorer

These patterns from the existing explorer can be reused:

1. **Validator Staking UI**: Copy delegation pool logic and UI
2. **Transaction Type Display**: Classification logic for different transaction types
3. **Known Addresses Map**: Framework (0x1), MOVE coin, etc.
4. **GraphQL Queries**: For analytics and aggregate data
5. **MNS Name Resolution**: Movement Name Service lookups
6. **Gas Formatting**: Display gas units and fees

---

## Common Issues & Solutions

### Issue: SDK Version Conflicts
**Solution**: Using Aptos SDK v5 (`@aptos-labs/ts-sdk`) exclusively for Movement blockchain interactions

### Issue: Custom Endpoints Error
**Solution**: Ensure `network: Network.CUSTOM` is specified when using custom fullnode and indexer URLs

### Issue: Network State Not Persisting
**Solution**: Could add localStorage to persist network selection across page reloads

### Issue: Slow Data Fetching
**Solution**: React Query caching with 5s staleTime, background refetching

### Issue: Movement Design System Not Loading
**Solution**: Ensure imports are at TOP of `globals.css`:
```css
@import "@movementlabsxyz/movement-design-system/component-styles";
@import "@movementlabsxyz/movement-design-system/theme";
```

---

## Migration Path from Old Explorer

If migrating features from the old explorer:

1. **Copy GraphQL queries** from old `src/api/hooks/` files
2. **Reuse utility functions** from `src/utils.ts` (address formatting, etc.)
3. **Adapt transaction types** from `src/components/TransactionType.tsx`
4. **Import validator logic** from `src/pages/Validators/`
5. **Use same API endpoints** (already configured in `lib/config.ts`)

---

## Testing the App

1. **Start dev server**: `pnpm dev`
2. **Visit**: http://localhost:3000
3. **Test network switching**: Click Mainnet/Testnet/Custom buttons
4. **Test search**: Enter a transaction hash or address
5. **Check stats**: Verify block height and ledger info load

---

## Next Steps for Development

1. Build **transaction detail page** (`app/tx/[hash]/page.tsx`)
2. Build **address page** (`app/address/[address]/page.tsx`)
3. Add **copy buttons** to all addresses/hashes
4. Implement **error handling** for invalid addresses/hashes
5. Add **pagination** to transaction lists
6. Create **loading skeletons** for all pages
7. Implement **dark mode** toggle
8. Add **analytics integration** (Google Analytics)

---

## Resources

- **Movement Design System Docs**: https://movement-design-system-docs-git-shadcn-movement-labs.vercel.app
- **Aptos SDK Docs** (for Movement): https://aptos.dev/sdks/ts-sdk/
- **Next.js Docs**: https://nextjs.org/docs
- **React Query Docs**: https://tanstack.com/query/latest
- **shadcn/ui Components**: https://ui.shadcn.com

---

## Contact & Support

For questions about this project:
- Check the old explorer codebase: `../Explorer/`
- Review Aptos SDK examples
- Reference Movement design system Storybook

---

**Last Updated**: November 22, 2025
**Status**: MVP Complete - Ready for feature expansion
