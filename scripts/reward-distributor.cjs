/**
 * NOETICA — Reward Distributor
 * Auto-sends NOET tokens to users when they interact
 * Run as: node scripts/reward-distributor.cjs
 * 
 * Setup:
 *   1. Add DEPLOYER_PRIVATE_KEY to .env
 *   2. Add NOET_TOKEN_ADDRESS to .env
 *   3. Run: node scripts/reward-distributor.cjs
 */

const { ethers } = require('ethers')
const https = require('https')
require('dotenv').config()

// ── Config ──────────────────────────────────────
const TOKEN_ADDRESS = process.env.VITE_NOET_TOKEN_ADDRESS
const RPC_URL = 'https://testnet.coti.io/rpc'
const DECIMALS = 6

// Reward amounts (in NOET)
const REWARDS = {
  journal:    10,
  mood:        5,
  streak_3:   25,
  streak_7:   75,
  streak_30: 300,
  first:      20,
  daily_max: 150,
}

// Minimal ERC20 ABI
const ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
]

// ── State ──────────────────────────────────────
const dailyLimits = {} // { address: { date, claimed } }

// ── Provider ────────────────────────────────────
function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL)
}

function getWallet() {
  if (!process.env.DEPLOYER_PRIVATE_KEY) throw new Error('DEPLOYER_PRIVATE_KEY not set in .env')
  return new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, getProvider())
}

function getContract() {
  return new ethers.Contract(TOKEN_ADDRESS, ABI, getWallet())
}

// ── Daily limit check ────────────────────────────
function checkDailyLimit(address, amount) {
  const today = new Date().toDateString()
  if (!dailyLimits[address] || dailyLimits[address].date !== today) {
    dailyLimits[address] = { date: today, claimed: 0 }
  }
  const remaining = REWARDS.daily_max - dailyLimits[address].claimed
  const actual = Math.min(amount, remaining)
  if (actual <= 0) return 0
  dailyLimits[address].claimed += actual
  return actual
}

// ── Core reward function ─────────────────────────
async function sendReward(address, type) {
  if (!TOKEN_ADDRESS || TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
    console.log('[NOETICA] No contract address — simulating reward only')
    return { success: true, simulated: true, amount: REWARDS[type] || 0 }
  }

  const baseAmount = REWARDS[type]
  if (!baseAmount) throw new Error(`Unknown reward type: ${type}`)

  const actual = checkDailyLimit(address, baseAmount)
  if (actual <= 0) {
    return { success: false, reason: 'daily_limit_reached', limit: REWARDS.daily_max }
  }

  try {
    const contract = getContract()
    const amount = ethers.parseUnits(actual.toString(), DECIMALS)
    
    console.log(`[NOETICA] Sending ${actual} NOET → ${address} (${type})`)
    const tx = await contract.transfer(address, amount)
    await tx.wait()
    console.log(`[NOETICA] ✓ Tx: ${tx.hash}`)

    return {
      success: true,
      amount: actual,
      type,
      txHash: tx.hash,
      address,
    }
  } catch (err) {
    console.error(`[NOETICA] Transfer failed:`, err.message)
    throw err
  }
}

// ── Check deployer balance ───────────────────────
async function checkBalance() {
  try {
    const wallet = getWallet()
    const contract = getContract()
    const bal = await contract.balanceOf(wallet.address)
    const formatted = ethers.formatUnits(bal, DECIMALS)
    console.log(`[NOETICA] Deployer NOET balance: ${formatted} NOET`)
    console.log(`[NOETICA] Deployer address: ${wallet.address}`)
    return parseFloat(formatted)
  } catch (err) {
    console.error('[NOETICA] Balance check failed:', err.message)
    return 0
  }
}

// ── HTTP Server (simple reward API) ─────────────
const PORT = process.env.REWARD_PORT || 3001

const server = https.createServer ? require('http').createServer : require('http').createServer
const http = require('http')

http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(200); res.end(); return
  }

  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type':'application/json'})
    res.end(JSON.stringify({ status: 'ok', service: 'NOETICA Reward Distributor' }))
    return
  }

  // Reward endpoint: POST /reward
  if (req.url === '/reward' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', async () => {
      try {
        const { address, type, secret } = JSON.parse(body)

        // Simple auth
        if (secret !== process.env.REWARD_SECRET) {
          res.writeHead(401, {'Content-Type':'application/json'})
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }

        if (!address || !type) {
          res.writeHead(400, {'Content-Type':'application/json'})
          res.end(JSON.stringify({ error: 'Missing address or type' }))
          return
        }

        const result = await sendReward(address, type)
        res.writeHead(200, {'Content-Type':'application/json'})
        res.end(JSON.stringify(result))
      } catch (err) {
        res.writeHead(500, {'Content-Type':'application/json'})
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  res.writeHead(404); res.end()
}).listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   NOETICA Reward Distributor — Running       ║
║   Port: ${PORT}                                  ║
╚══════════════════════════════════════════════╝
  `)
  checkBalance()
})

module.exports = { sendReward, checkBalance, REWARDS }
