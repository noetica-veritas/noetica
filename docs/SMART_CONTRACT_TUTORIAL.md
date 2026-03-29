# Tutorial: Deploy NOET Token to COTI Testnet

> *Complete step-by-step guide for GitHub Codespace*

---

## Prerequisites

- Node.js 20+ (Codespace has it built-in)
- MetaMask installed in your browser
- COTI Testnet wallet with some COTI (from faucet)

---

## Step 1 — Setup Environment

```bash
# In your Codespace terminal:
cp .env.example .env
```

Open `.env` and fill in:
```env
DEPLOYER_PRIVATE_KEY=your_metamask_private_key_here
VITE_AI_API_KEY=your_nous_research_api_key
```

> **How to get your MetaMask private key:**
> MetaMask → Account → ⋮ Menu → Account Details → Show Private Key
> ⚠ Use a dedicated deployer wallet, not your main wallet.

---

## Step 2 — Get Testnet COTI

1. Open https://faucet.coti.io
2. Enter your wallet address
3. Request testnet COTI
4. Wait ~30 seconds for confirmation

---

## Step 3 — Install Dependencies

```bash
npm install
```

This installs:
- `hardhat` — Solidity development framework
- `@openzeppelin/contracts` — Secure ERC-20 base
- `@nomicfoundation/hardhat-toolbox` — Testing + deployment tools
- `ethers` — Blockchain interaction library
- `vite` — Frontend dev server

---

## Step 4 — Review the Contracts

### `contracts/NOETToken.sol`
The ERC-20 token with:
- Capped supply (10M NOET)
- Reward pool (5M NOET, minted on demand)
- Daily reward limits per user (150 NOET max)
- Streak tracking on-chain
- Access control (only `NOETRewards` can mint rewards)

### `contracts/NOETRewards.sol`
The user-facing contract:
- Users call this directly to claim rewards
- Handles cooldowns and eligibility checks
- Forwards to `NOETToken` for actual minting

---

## Step 5 — Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 2 Solidity files successfully
```

If you see errors, check:
- Node version: `node --version` (needs v18+)
- OpenZeppelin installed: `ls node_modules/@openzeppelin`

---

## Step 6 — Deploy to COTI Testnet

```bash
npm run deploy:testnet
```

Expected output:
```
╔══════════════════════════════════════════════╗
║    NOETICA — Smart Contract Deployment       ║
║    COTI Testnet (Chain ID: 7082400)          ║
╚══════════════════════════════════════════════╝

Deployer : 0xYourAddress...
Balance  : 0.5 COTI

Deploying NOETToken...
✓ NOETToken deployed : 0xTokenAddress...
Deploying NOETRewards...
✓ NOETRewards deployed: 0xRewardsAddress...
Authorizing NOETRewards as minter...
✓ Minter authorized

── Token Stats ───────────────────────────────
Name          : NOETICA Token
Symbol        : NOET
Max Supply    : 10000000.0 NOET
Reward Pool   : 5000000.0 NOET
Deployer Bal  : 5000000.0 NOET

✓ Saved to deployment.json

╔══════════════════════════════════════════════╗
║  Update your .env with these values:         ║
╠══════════════════════════════════════════════╣
║  VITE_NOET_TOKEN_ADDRESS=0x...
║  VITE_NOET_REWARDS_ADDRESS=0x...
╚══════════════════════════════════════════════╝
```

---

## Step 7 — Update .env with Contract Addresses

Open `.env` and add the deployed addresses:

```env
VITE_NOET_TOKEN_ADDRESS=0xYourTokenAddress
VITE_NOET_REWARDS_ADDRESS=0xYourRewardsAddress
```

---

## Step 8 — Verify on Explorer

1. Open https://testnet.cotiscan.io
2. Paste your token address
3. You should see:
   - Contract creation transaction
   - 5,000,000 NOET minted to your deployer wallet
   - Token name: "NOETICA Token"
   - Symbol: "NOET"

---

## Step 9 — Add NOET to MetaMask

1. MetaMask → Tokens → Import Token
2. Paste your `VITE_NOET_TOKEN_ADDRESS`
3. Symbol: NOET | Decimals: 18
4. Confirm

---

## Step 10 — Run the App

```bash
npm run dev
```

Open in browser → Connect wallet → Interact with AI → Earn NOET on-chain! 🎉

---

## Troubleshooting

| Error | Fix |
|---|---|
| `insufficient funds` | Get more COTI from faucet.coti.io |
| `network does not support ENS` | Normal on COTI — safe to ignore |
| `unknown account` | Check DEPLOYER_PRIVATE_KEY in .env |
| `cannot find module hardhat` | Run `npm install` again |
| Compiled but deploy fails | Check RPC is accessible: `curl https://testnet.coti.io/rpc` |

---

## Contract Addresses (fill after deploy)

| Contract | Address |
|---|---|
| NOETToken | *(see deployment.json after deploy)* |
| NOETRewards | *(see deployment.json after deploy)* |

---

## Security Reminders

- ✅ Never commit `.env` to git
- ✅ Use a dedicated deployer wallet
- ✅ `deployment.json` is in `.gitignore`
- ✅ API key only in `.env`, never in source code
- ✅ Vault key only on user's device, never on server
