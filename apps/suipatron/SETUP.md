# SuiPatron Frontend Setup

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
# Copy the example file
cp .env.example .env.local
```

### 3. Deploy Smart Contract (if not already deployed)
```bash
cd ../../packages/blockchain/contracts
sui move build
sui client publish --gas-budget 200000000
```

**Save these IDs from the publish output:**
- **Package ID**: Look for "PackageID" or in "Published Objects"
- **Platform ID**: Look for "Platform" in "Created Objects"

### 4. Update .env.local

Open `apps/suipatron/.env.local` and update:

```bash
NEXT_PUBLIC_PACKAGE_ID=0x<your-package-id-here>
NEXT_PUBLIC_PLATFORM_ID=0x<your-platform-id-here>
```

### 5. Start Development Server
```bash
npm run dev
```

Open http://localhost:3001

---

## Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUI_NETWORK` | SUI network (testnet/mainnet) | ✅ Yes |
| `NEXT_PUBLIC_PACKAGE_ID` | Your deployed package ID | ✅ Yes |
| `NEXT_PUBLIC_PLATFORM_ID` | Platform shared object ID | ✅ Yes |

## Optional Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_ENOKI_PUBLIC_KEY` | Enoki zkLogin public key | For zkLogin |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | For zkLogin |
| `ENOKI_API_KEY` | Enoki server secret | For zkLogin |
| `NEXT_PUBLIC_SEAL_KEY_SERVER_OBJECT_IDS` | SEAL key servers | Has defaults |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | For indexer |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server key | For indexer |

---

## Finding Your Contract IDs

After running `sui client publish`:

```
╭─────────────────────────────────────────────────────────────────────╮
│ Object Changes                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ Created Objects:                                                    │
│  ┌──                                                                │
│  │ ObjectID: 0xabcd1234... ← This is your Platform ID             │
│  │ Sender: 0x...                                                   │
│  │ Owner: Shared                                                   │
│  │ ObjectType: 0x1234...::suipatron::Platform                     │
│  └──                                                                │
├─────────────────────────────────────────────────────────────────────┤
│ Published Objects:                                                  │
│  ┌──                                                                │
│  │ PackageID: 0x1234... ← This is your Package ID                 │
│  │ Version: 1                                                      │
│  └──                                                                │
╰─────────────────────────────────────────────────────────────────────╯
```

Copy these IDs to your `.env.local` file.

---

## Testing the Setup

1. **Start the dev server**: `npm run dev`
2. **Open**: http://localhost:3001/explore
3. **Expected**: Empty state "No Creators Yet"
4. **Create a profile**: Go to /dashboard → "Become a Creator"
5. **Expected**: Profile appears in /explore

---

## Troubleshooting

### "Network Variable Not Found"
- Make sure `.env.local` exists
- Restart dev server after changing env vars

### "Package ID is undefined"
- Check that `NEXT_PUBLIC_PACKAGE_ID` is set in `.env.local`
- Make sure the prefix is `NEXT_PUBLIC_` (required for Next.js)

### "No creators showing up"
- Verify contract is deployed
- Check Package ID is correct
- Check browser console for errors
- Click "Refresh" button on explore page

### "Transaction failed"
- Make sure Platform ID is correct
- Ensure you have SUI in your wallet
- Check SUI Explorer for error details
