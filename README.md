# 🧠 NOETICA — The Private Science of Your Mind

> *Built for COTI Vibe Code Challenge 2026*

[![COTI](https://img.shields.io/badge/COTI-Testnet-00e5c8?style=flat-square)](https://testnet.cotiscan.io)
[![AES](https://img.shields.io/badge/Encryption-AES--256--GCM-silver?style=flat-square)](.)
[![License](https://img.shields.io/badge/license-MIT-white?style=flat-square)](.)

The first AI mental wellness companion where your thoughts are encrypted **before** leaving your device — not even we can read them. Built on COTI Network. Zero-knowledge. On-chain rewards.

---

## Architecture

```
User Browser
  │
  ├─ AES-256-GCM (Web Crypto API) ─── All data encrypted client-side
  │
  ├─ Neural Intelligence API ──────── API key from .env only
  │    (via inference-api.nousresearch.com)
  │
  └─ COTI Testnet ─────────────────── Wallet required to interact with AI
       │
       ├─ NOETToken.sol   (ERC-20, 10M supply)
       └─ NOETRewards.sol (claim interface)
```

---

## Quick Start (Codespace)

```bash
# 1. Clone & setup
cp .env.example .env
# Fill in VITE_AI_API_KEY and DEPLOYER_PRIVATE_KEY

# 2. Install
npm install

# 3. Run app
npm run dev

# 4. Deploy contracts (optional)
npm run deploy:testnet
```

---

## Project Structure

```
noetica/
├── src/
│   ├── main.js              # Full app (UI + logic)
│   └── utils/
│       ├── config.js        # Reads from .env
│       ├── ai.js            # Neural intelligence API
│       ├── wallet.js        # COTI wallet + on-chain claims
│       └── crypto.js        # AES-256-GCM
├── contracts/
│   ├── NOETToken.sol        # ERC-20 reward token
│   └── NOETRewards.sol      # User-facing claim contract
├── scripts/
│   └── deploy.js            # Hardhat deployment
├── docs/
│   ├── REWARD_SCHEME.md     # Full reward specification
│   └── SMART_CONTRACT_TUTORIAL.md
├── .env.example             # Config template (copy to .env)
├── .gitignore               # .env never committed
├── hardhat.config.cjs       # COTI testnet config
└── vite.config.js           # Frontend build config
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| API key in `.env` | Never in UI, never in source code, never in git |
| Wallet required for AI | Ensures rewards are recorded on-chain |
| Client-side encryption | Server never sees plaintext data |
| ERC-20 on COTI | Native privacy-first blockchain for mental wellness data |
| Reward pool capped | 5M/10M supply, deflationary until earned |

---

## COTI Network

| | |
|---|---|
| Chain ID | 7082400 |
| RPC | https://testnet.coti.io/rpc |
| Explorer | https://testnet.cotiscan.io |
| Faucet | https://faucet.coti.io |

---

## Reward Scheme

See [`docs/REWARD_SCHEME.md`](docs/REWARD_SCHEME.md) for full specification.

Quick summary:
- **+10 NOET** — daily journal entry
- **+5 NOET** — daily mood check-in
- **+25/75/300 NOET** — 3/7/30-day streaks
- **+20 NOET** — first session (one-time)
- **150 NOET** — daily maximum (anti-abuse)

---

## Smart Contract Tutorial

See [`docs/SMART_CONTRACT_TUTORIAL.md`](docs/SMART_CONTRACT_TUTORIAL.md) for step-by-step deployment guide.

---

*NOETICA — Your Mind's Sanctuary. Encrypted Forever.*
