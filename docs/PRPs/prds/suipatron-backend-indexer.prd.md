# PRD: SuiPatron Backend Indexer and Creator APIs

**Product Requirement Document** — Event indexer and GET /api/creators, GET /api/creator/:id for creator discovery.

**Created:** February 2025  
**Status:** Draft  
**Related:** [suipatron/01-product-breakdown-and-roadmap.md](../../suipatron/01-product-breakdown-and-roadmap.md), [SCOPE.md](../../SCOPE.md) Section 12

---

## Goal

Build a backend indexer that reads SuiPatron events from the SUI chain (ProfileCreated, ContentPublished, AccessPurchased, etc.) and writes normalized data to a store. Expose GET /api/creators and GET /api/creator/:id so the frontend can load creator lists and profile pages from the API instead of querying RPC from the browser. This improves scalability, avoids RPC rate limits, and reduces latency for discovery.

**Business Value:**
- Marketplace remains fast as creator count grows
- Reduces dependency on client-side RPC

**User Value:**
- Faster Explore page; stable creator list; no timeout or rate-limit errors

---

## Context

### Related Documentation
- [SCOPE.md](../../SCOPE.md) Section 12 (Event & Indexer Design)
- [architecture/ARCHITECTURE-DESIGN.md](../../architecture/ARCHITECTURE-DESIGN.md)
- [IMPLEMENTATION_STATUS.md](../../IMPLEMENTATION_STATUS.md) — Contract API, events

### Dependencies
- **Requires:** Contract deployed (A9); Package ID, Platform ID
- **Blocks:** Explore page can use API instead of RPC
- **Related:** PTB builders (P3–P4), Frontend integration

### PBS Task IDs
- A10 (sponsor endpoint), A12 (event indexer), A9 (deploy)

---

## Requirements

### Functional Requirements
1. Indexer process (cron or long-running) queries SUI chain for ProfileCreated, ProfileUpdated, ContentPublished, AccessPurchased, EarningsWithdrawn
2. Store creator profiles and content metadata (profile_id, owner, name, bio, price, content_count, total_supporters, etc.)
3. GET /api/creators — list creators with pagination (limit, cursor)
4. GET /api/creator/:id — get single creator profile + content list

### Non-Functional Requirements
- **Performance:** API response < 500ms p95
- **Security:** API read-only; indexer uses RPC only (no private keys)
- **Scalability:** Indexer and store scale to 10k+ creators

### Acceptance Criteria
- [ ] Indexer writes ProfileCreated events; ProfileUpdated, ContentPublished update existing rows
- [ ] GET /api/creators returns paginated creators
- [ ] GET /api/creator/:id returns profile + content list
- [ ] Frontend can use API for Explore and Creator Profile pages

---

## Implementation Phases

| # | Phase | Description | Status | Depends | Plan |
|---|-------|-------------|--------|---------|------|
| 1 | Indexer + store schema | Define schema (creators, content), indexer script that queries events and upserts | pending | - | - |
| 2 | API endpoints | GET /api/creators, GET /api/creator/:id with pagination | pending | 1 | - |

---

## Technical Considerations

### Integration Points
- SUI RPC queryEvents API
- Vercel serverless or cron
- In-memory, KV store (Vercel KV), or Supabase

### Gotchas & Constraints
- Events use package ID — filter by package and move event type
- Cursor for incremental indexing (last processed event)
- Idempotent upserts by profile_id / content_id

---

**Last Updated:** February 2025
