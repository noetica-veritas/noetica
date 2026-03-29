# NOETICA — Complete Setup Guide
### From Zero to Running on GitHub Codespace

---

## PART 1 — Create GitHub Repository

1. Go to **github.com** → click **"New repository"**
2. Repository name: `noetica`
3. Set to **Public** (required for free GitHub Pages)
4. ✅ Check **"Add a README file"**
5. Click **"Create repository"**

---

## PART 2 — Upload Project Files

### Option A — Via Codespace (Recommended)

1. On your repo page → click **`<> Code`** button
2. Tab **"Codespaces"** → **"Create codespace on main"**
3. Wait ~30 seconds for editor to open

Once Codespace is open, in the **terminal**:

```bash
# Remove the default README
rm README.md
```

Then drag & drop **all project files** into the file explorer panel on the left, keeping the folder structure:

```
noetica/
├── .devcontainer/
│   └── devcontainer.json
├── .github/
│   └── workflows/
│       └── deploy.yml
├── contracts/
│   ├── NOETToken.sol
│   └── NOETRewards.sol
├── docs/
│   ├── REWARD_SCHEME.md
│   └── SMART_CONTRACT_TUTORIAL.md
├── scripts/
│   └── deploy.js
├── src/
│   ├── main.js
│   └── utils/
│       ├── ai.js
│       ├── config.js
│       ├── crypto.js
│       └── wallet.js
├── .env.example
├── .gitignore
├── README.md
├── hardhat.config.cjs
├── index.html
├── package.json
└── vite.config.js
```

### Option B — Via Git CLI

```bash
# On your local machine:
git clone https://github.com/YOUR_USERNAME/noetica.git
cd noetica
# Copy all project files here
git add .
git commit -m "Initial NOETICA project"
git push origin main
# Then open Codespace from GitHub
```

---

## PART 3 — Configure Environment

In the Codespace terminal:

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
code .env
```

Fill in `.env`:

```env
# ── REQUIRED: Your Nous Research API key ──────────────
VITE_AI_API_KEY=your_key_from_portal_nousresearch_com

# ── REQUIRED for contract deploy: Deployer wallet ─────
DEPLOYER_PRIVATE_KEY=your_metamask_private_key

# ── Leave these as-is for COTI Testnet ────────────────
VITE_AI_MODEL=Hermes-4-70B
VITE_AI_ENDPOINT=https://inference-api.nousresearch.com/v1/chat/completions
VITE_COTI_CHAIN_ID=7082400
VITE_COTI_RPC_URL=https://testnet.coti.io/rpc
VITE_COTI_EXPLORER=https://testnet.cotiscan.io
VITE_COTI_FAUCET=https://faucet.coti.io

# ── Fill after deploying contracts (Step 6) ───────────
VITE_NOET_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
VITE_NOET_REWARDS_ADDRESS=0x0000000000000000000000000000000000000000
```

> **Where to get your Nous API key:**
> Go to https://portal.nousresearch.com/api-keys
> That is the page you already have open — copy the key named `sovereign_magnetron`

---

## PART 4 — Install & Run the App

```bash
npm install
npm run dev
```

You'll see:
```
  VITE v5.x.x ready in 500ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://0.0.0.0:5173/
```

Codespace will show a popup **"Open in Browser"** → click it → NOETICA opens! 🎉

---

## PART 5 — Test the App

1. Click **"Open My Sanctuary"**
2. Enter your name (no email needed)
3. Copy and save the generated **Vault Key**
4. Click **"Enter NOETICA"**
5. Click **"Connect Wallet"** in the top bar
   - MetaMask opens → approve connection
   - COTI Testnet is added automatically (Chain ID: 7082400)
6. Start chatting with the neural intelligence! ✓

> **Need testnet COTI?** Go to https://faucet.coti.io and request some.

---

## PART 6 — Deploy Smart Contracts (NOET Token)

This step puts the reward token on COTI Testnet.

```bash
# Compile contracts first
npm run compile
```

Expected output:
```
Compiled 2 Solidity files successfully
```

```bash
# Deploy to COTI Testnet
npm run deploy:testnet
```

This will:
1. Deploy `NOETToken.sol` → your NOET ERC-20
2. Deploy `NOETRewards.sol` → claim interface
3. Authorize `NOETRewards` to mint tokens
4. Print both contract addresses
5. Save to `deployment.json`

**After deploy, update your `.env`:**
```env
VITE_NOET_TOKEN_ADDRESS=0xAddress_from_deploy_output
VITE_NOET_REWARDS_ADDRESS=0xAddress_from_deploy_output
```

Then restart the dev server:
```bash
# Ctrl+C to stop, then:
npm run dev
```

Now when users click **"Log Mood"** or **"Save Entry"**, their rewards are claimed on-chain! ✓

---

## PART 7 — Deploy to GitHub Pages (Live URL)

### Step 7a — Add Secrets to GitHub

1. Go to your repo on GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** for each:

| Secret Name | Value |
|---|---|
| `VITE_AI_API_KEY` | Your Nous API key |
| `VITE_NOET_TOKEN_ADDRESS` | From deployment.json |
| `VITE_NOET_REWARDS_ADDRESS` | From deployment.json |

### Step 7b — Enable GitHub Pages

1. **Settings** → **Pages**
2. Source: **"GitHub Actions"**
3. Click **Save**

### Step 7c — Push to trigger deploy

```bash
git add .
git commit -m "🧠 NOETICA — AI therapist on COTI Network"
git push origin main
```

4. Go to **Actions** tab on GitHub → watch the deploy run (~2 min)
5. Your live URL: `https://YOUR_USERNAME.github.io/noetica`

---

## PART 8 — Submit to COTI Vibe Code Challenge

1. Share your live URL on **X (Twitter)**:
   ```
   🧠 NOETICA — The Private Science of Your Mind
   
   AI mental wellness on @COTINetwork
   ✅ AES-256-GCM encryption
   ✅ NOET token rewards on-chain
   ✅ Zero-knowledge vault
   
   Live: https://YOUR_USERNAME.github.io/noetica
   
   #COTINetwork #VibeCodingChallenge #Web3 #AI
   ```

2. Submit at: https://forms.gle/2Xan4qnVTo7w9itF9

---

## Quick Commands Reference

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run compile          # Compile Solidity contracts
npm run deploy:testnet   # Deploy to COTI Testnet
npm run node             # Start local Hardhat node
npm run deploy:local     # Deploy to local node
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Port 5173 not opening | Click "Ports" tab in Codespace, right-click 5173 → Open in browser |
| `npm install` fails | Try `npm install --legacy-peer-deps` |
| Contract deploy fails | Check `DEPLOYER_PRIVATE_KEY` in `.env` + get COTI from faucet |
| AI not responding | Verify `VITE_AI_API_KEY` is correct in `.env` |
| MetaMask not connecting | Ensure you're on COTI Testnet (Chain ID 7082400) |
| Build fails on GitHub Actions | Check all secrets are added in repo settings |

---

## COTI Network Details

| | |
|---|---|
| Network Name | COTI Testnet |
| Chain ID | `7082400` |
| RPC URL | `https://testnet.coti.io/rpc` |
| Explorer | `https://testnet.cotiscan.io` |
| Faucet | `https://faucet.coti.io` |
| Currency | COTI |

---

*NOETICA — Your Mind's Sanctuary. Encrypted Forever.*
