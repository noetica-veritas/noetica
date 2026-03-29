# NOETICA — NOET Token Reward Scheme

> *Complete specification for the NOET on-chain reward system on COTI Testnet*

---

## Token Overview

| Property | Value |
|---|---|
| Name | NOETICA Token |
| Symbol | NOET |
| Network | COTI Testnet (Chain ID: 7082400) |
| Standard | ERC-20 |
| Total Supply | 10,000,000 NOET |
| Decimals | 18 |

---

## Token Distribution

```
Total Supply: 10,000,000 NOET
├── Reward Pool     5,000,000 (50%) — minted on demand as users earn
├── Team / Ops      3,000,000 (30%) — vested 12 months, 6-month cliff
└── Liquidity       2,000,000 (20%) — DEX / Bancor liquidity
```

The reward pool is **not pre-minted** — tokens are minted at the moment a user earns them, keeping supply deflationary until earned.

---

## Reward Actions & Amounts

### Daily Actions (reset every UTC midnight)

| Action | NOET | Condition | On-chain |
|---|---|---|---|
| Journal Entry | +10 | Write ≥ 10 words | `claimJournalReward()` |
| Mood Check-in | +5 | Log once per day | `claimMoodReward()` |
| **Daily Maximum** | **150** | Anti-abuse cap | enforced in contract |

### Streak Bonuses (one-time per milestone)

| Milestone | NOET | Condition | On-chain |
|---|---|---|---|
| 3-Day Streak | +25 | Journal 3 consecutive days | `claimStreakReward(3)` |
| 7-Day Streak | +75 | Journal 7 consecutive days | `claimStreakReward(7)` |
| 30-Day Legend | +300 | Journal 30 consecutive days | `claimStreakReward(30)` |

### One-time Rewards

| Action | NOET | Condition | On-chain |
|---|---|---|---|
| First Session | +20 | Connect wallet + first message | `claimFirstSession()` |

---

## Example User Journey (First Month)

```
Day 1   Journal (+10) + Mood (+5) + First Session (+20) = 35 NOET
Day 2   Journal (+10) + Mood (+5)                       = 15 NOET
Day 3   Journal (+10) + Mood (+5) + 3-Day Streak (+25)  = 40 NOET
...
Day 7   Journal (+10) + Mood (+5) + 7-Day Streak (+75)  = 90 NOET
...
Day 30  Journal (+10) + Mood (+5) + 30-Day Legend (+300) = 315 NOET

≈ Total at 30 days (daily only): ~450 NOET
  + Streak bonuses:              +400 NOET
  + First session:               + 20 NOET
  ─────────────────────────────────────────
  Total Month 1:                 ~870 NOET
```

---

## Anti-Abuse Mechanisms

| Mechanism | Implementation |
|---|---|
| Daily cap | 150 NOET max per wallet per UTC day |
| Streak cooldown | Streak bonus claimable max once per 7 days |
| First session | Tracked per address, claimable once ever |
| Reward pool cap | Contract reverts when 5,000,000 NOET exhausted |
| Minter restriction | Only `NOETRewards` contract can call mint functions |

---

## Smart Contract Architecture

```
User Wallet
     │
     ▼
NOETRewards.sol ─── claimJournalReward()
  (access gate)  ─── claimMoodReward()
  (cooldowns)    ─── claimStreakReward(days)
  (eligibility)  ─── claimFirstSession()
     │
     ▼
NOETToken.sol ──── _mintReward(user, amount, type)
  (ERC-20)     ──── enforces daily cap
  (capped pool) ─── emits RewardMinted event
```

---

## Future Governance (Post-Launch)

- NOET holders can vote on reward amounts
- Proposal threshold: 1,000 NOET
- Voting period: 7 days
- Quorum: 5% of circulating supply

---

## COTI Network Info

| | |
|---|---|
| Chain ID | 7082400 |
| RPC | https://testnet.coti.io/rpc |
| Explorer | https://testnet.cotiscan.io |
| Faucet | https://faucet.coti.io |
