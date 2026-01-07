# Movement Explorer - TODO List

## Phase 1: Core Pages (MVP)

### Transaction Detail Page (`/tx/[hash]`)
- [ ] Create `app/tx/[hash]/page.tsx`
- [ ] Display transaction metadata (type, status, timestamp, version)
- [ ] Show sender/receiver addresses with copy buttons
- [ ] Display gas used and fee paid
- [ ] Show transaction events
- [ ] Display payload/function call details
- [ ] Add success/failure status badge
- [ ] Handle loading and error states

### Address/Account Page (`/address/[address]`)
- [ ] Create `app/address/[address]/page.tsx`
- [ ] Display account balance (MOVE tokens)
- [ ] Show token holdings (coins) in table
- [ ] Display transaction history (paginated)
- [ ] Show account resources (simplified view)
- [ ] Display deployed modules (if applicable)
- [ ] Add tabs for different sections
- [ ] Handle non-existent addresses gracefully

### Block Details Page (`/block/[height]`)
- [ ] Create `app/block/[height]/page.tsx`
- [ ] Display block metadata (height, timestamp, hash)
- [ ] Show block proposer/validator
- [ ] List all transactions in block
- [ ] Display block version
- [ ] Add navigation (previous/next block)
- [ ] Handle invalid block heights

### All Transactions Page (`/transactions`)
- [ ] Create `app/transactions/page.tsx`
- [ ] Display paginated list of all transactions
- [ ] Add filters (transaction type, status)
- [ ] Implement "Load More" or pagination
- [ ] Show transaction summary cards
- [ ] Add sorting options (newest/oldest)

---

## Phase 2: Enhanced Features

### Validators Page (`/validators`)
- [ ] Create `app/validators/page.tsx`
- [ ] Display validator list with voting power
- [ ] Show commission rates
- [ ] Display validator status (active/inactive)
- [ ] Add staking interface (optional, port from old explorer)
- [ ] Show delegator counts
- [ ] Add validator map (mainnet only)

### Token/Coin Pages (`/coin/[address]`)
- [ ] Create `app/coin/[address]/page.tsx`
- [ ] Display token metadata (name, symbol, decimals)
- [ ] Show total supply
- [ ] List top holders
- [ ] Display transfer history
- [ ] Show token icon/logo (if available)

### Analytics Dashboard (`/analytics`)
- [ ] Create `app/analytics/page.tsx`
- [ ] Add TPS (transactions per second) chart
- [ ] Display daily active users (DAU) graph
- [ ] Show gas cost trends
- [ ] Display network health metrics
- [ ] Add account growth chart
- [ ] Fetch data from Google Cloud Storage (like old explorer)

---

## Phase 3: UX Enhancements

### General Improvements
- [ ] Add dark mode toggle
- [ ] Implement mobile navigation menu (hamburger)
- [ ] Add copy-to-clipboard buttons on all addresses/hashes
- [ ] Implement toast notifications (success/error)
- [ ] Create custom 404 page
- [ ] Create custom 500 error page
- [ ] Improve loading skeletons across all pages
- [ ] Add breadcrumb navigation
- [ ] Implement "back to top" button

### Search Enhancements
- [ ] Add search history (localStorage)
- [ ] Implement autocomplete/suggestions
- [ ] Add recent searches dropdown
- [ ] Handle MNS (Movement Name Service) names
- [ ] Show search type indicators

### Performance
- [ ] Implement ISR (Incremental Static Regeneration) for static pages
- [ ] Add service worker for offline support
- [ ] Optimize image loading
- [ ] Implement virtual scrolling for long lists
- [ ] Add request deduplication
- [ ] Optimize bundle size

---

## Phase 4: Advanced Features

### Smart Contract/Module Features
- [ ] Implement Move module verification
- [ ] Add module source code viewer
- [ ] Display module dependencies
- [ ] Show module functions and their signatures
- [ ] Add "Read Contract" functionality (query view functions)

### NFT Support
- [ ] Create NFT detail page
- [ ] Add NFT gallery on address pages
- [ ] Display NFT metadata and images
- [ ] Show NFT collection info
- [ ] Add NFT transfer history

### Wallet Integration (Optional)
- [ ] Add wallet connection button
- [ ] Integrate Movement-compatible wallet adapter
- [ ] Support multiple wallets (Movement-compatible wallets)
- [ ] Enable transaction signing from explorer
- [ ] Add "Write Contract" functionality (send transactions)

### Data Export
- [ ] Add CSV export for transaction lists
- [ ] Implement PDF reports for accounts
- [ ] Add API endpoint for programmatic access
- [ ] Create data visualization exports

---

## Phase 5: Developer Tools

### API & Documentation
- [ ] Create public API documentation
- [ ] Add rate limiting
- [ ] Implement API keys (optional)
- [ ] Add GraphQL playground link
- [ ] Create developer guides

### Testing
- [ ] Add unit tests for utility functions
- [ ] Implement integration tests for API client
- [ ] Add E2E tests with Playwright
- [ ] Test network switching scenarios
- [ ] Test error handling flows

### Monitoring & Analytics
- [ ] Integrate Google Analytics 4
- [ ] Add Sentry error tracking
- [ ] Implement performance monitoring
- [ ] Add user behavior tracking
- [ ] Create analytics dashboard

---

## Bug Fixes & Technical Debt

- [ ] Fix any peer dependency warnings
- [ ] Resolve TypeScript strict mode issues
- [ ] Optimize React Query cache invalidation
- [ ] Handle edge cases in address formatting
- [ ] Improve error messages for failed API calls
- [ ] Add proper TypeScript types for all API responses
- [ ] Implement retry logic for failed requests
- [ ] Add request timeout handling
- [ ] Fix accessibility issues (ARIA labels, keyboard navigation)

---

## Documentation

- [ ] Add JSDoc comments to all functions
- [ ] Create architecture diagram
- [ ] Document API client usage patterns
- [ ] Add contribution guidelines
- [ ] Create deployment guide
- [ ] Document environment variables
- [ ] Add troubleshooting guide
- [ ] Create video walkthrough

---

## Nice-to-Have Features

- [ ] Add real-time transaction notifications (WebSockets)
- [ ] Implement address bookmarks/watchlist
- [ ] Add transaction labels/notes (stored locally)
- [ ] Create customizable dashboard
- [ ] Add multi-language support (i18n)
- [ ] Implement QR code generation for addresses
- [ ] Add social sharing for transactions/accounts
- [ ] Create browser extension
- [ ] Add RSS feed for recent transactions
- [ ] Implement advanced filtering (date ranges, amount ranges)

---

## Priority Order

1. **Immediate**: Transaction detail page, Address page
2. **High**: Block details, All transactions list
3. **Medium**: Validators, Analytics, Dark mode
4. **Low**: NFTs, Wallet integration, Advanced features

---

**Last Updated**: November 22, 2025
