# SuiPatron Smart Contract

Move smart contract for the SuiPatron creator support platform.

## Quick Publish

Use the automated publish script that updates your frontend environment automatically:

### Windows (PowerShell)
```powershell
cd packages/blockchain/contracts
.\publish.ps1
```

### macOS/Linux or Git Bash on Windows
```bash
cd packages/blockchain/contracts
chmod +x publish.sh  # First time only
./publish.sh
```

The script will:
1. ✅ Build the contract
2. ✅ Publish to SUI Testnet
3. ✅ Extract Package ID and Platform ID
4. ✅ Update `apps/suipatron/.env.local` automatically
5. ✅ Save full output to `publish-output.txt`

## Manual Commands

### Build
```bash
sui move build
```

### Test
```bash
sui move test
```

### Publish (Manual)
```bash
sui client publish --gas-budget 200000000
```

Then manually update `apps/suipatron/.env.local`:
```
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_PLATFORM_ID=0x...
NEXT_PUBLIC_SUI_NETWORK=testnet
```

## Entry Functions

All main functions are now `public entry fun` and can be called from SUI Explorer:

- `create_profile` - Create a new creator profile
- `update_profile` - Update profile metadata
- `publish_content` - Publish encrypted content
- `purchase_access` - Buy access to a creator
- `withdraw_earnings` - Withdraw creator earnings

See the SUI Explorer at:
- https://suiscan.xyz/testnet/
- https://testnet.suivision.xyz/

## After Publishing

1. The `.env.local` file is automatically updated
2. Restart your frontend dev server:
   ```bash
   cd apps/suipatron
   npm run dev
   ```
3. Test creating a profile from `/dashboard`
4. Or test from SUI Explorer using the Package ID

## Troubleshooting

If the script fails to extract IDs:
1. Check `publish-output.txt` for the full output
2. Manually copy Package ID and Platform ID
3. Update `apps/suipatron/.env.local`

If you see "Version Mismatch" errors:
- You need to migrate existing objects to the new version
- Or create new test objects with the new contract
