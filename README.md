# Movement Explorer

A modern, user-friendly blockchain explorer for the Movement Network, built with Next.js 15 and the Movement Design System.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Visit http://localhost:3000 to view the explorer.

## Features

- ✅ Real-time network statistics (block height, transactions, chain info)
- ✅ Recent transactions feed
- ✅ Universal search (addresses, transactions, blocks)
- ✅ Network switching (Mainnet/Testnet/Custom)
- ✅ Movement Design System integration
- ✅ Responsive, mobile-friendly UI

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Movement Design System** (@movementlabsxyz/movement-design-system)
- **React Query** (TanStack Query)
- **Aptos SDK v5** (@aptos-labs/ts-sdk) - for Movement blockchain interactions
- **Tailwind CSS**

## Project Structure

```
explorer-movement/
├── app/              # Next.js pages (App Router)
├── components/       # React components
├── hooks/            # React Query hooks
├── lib/              # Core logic (API client, config, utils)
├── providers/        # React Context providers
└── .env.local        # Environment variables
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_MAINNET_URL=https://mainnet.movementnetwork.xyz/v1
NEXT_PUBLIC_TESTNET_URL=https://testnet.movementnetwork.xyz/v1
NEXT_PUBLIC_MAINNET_INDEXER=https://indexer.mainnet.movementnetwork.xyz/v1/graphql
NEXT_PUBLIC_TESTNET_INDEXER=https://hasura.testnet.movementnetwork.xyz/v1/graphql
NEXT_PUBLIC_DEFAULT_NETWORK=mainnet
```

## What's Next

See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for detailed documentation, including:
- Full architecture overview
- API patterns and examples
- Feature roadmap
- Migration guide from old explorer
- Common issues and solutions

## Development

```bash
# Add new shadcn/ui components
pnpm dlx shadcn@latest add <component-name>

# Lint code
pnpm lint
```

## Documentation

- **Project Context**: [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)
- **Movement Design System**: https://movement-design-system-docs-git-shadcn-movement-labs.vercel.app
- **Aptos SDK Documentation**: https://aptos.dev/sdks/ts-sdk/ (used for Movement blockchain)

## License

MIT
