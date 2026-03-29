/**
 * NOETICA — Wallet Module
 * MetaMask + COTI Testnet integration
 * Wallet connection required to interact with AI and claim rewards
 */
import { Cfg } from './config.js'

// Minimal ABI for NOETRewards contract
export const REWARDS_ABI = [
  'function claimJournalReward() external',
  'function claimMoodReward() external',
  'function claimStreakReward(uint256 streakDays) external',
  'function claimFirstSession() external',
  'function getUserClaimStatus(address user) view returns (bool,bool,bool,uint256)',
  'function canClaimJournal(address) view returns (bool)',
  'function canClaimMood(address) view returns (bool)',
]

export const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function getUserStats(address) view returns (uint256,uint256,uint32,uint256,bool,bool)',
]

let _provider = null
let _signer   = null
let _address  = null

export function getAddress()  { return _address }
export function getSigner()   { return _signer }
export function isConnected() { return Boolean(_address) }

/**
 * Connect MetaMask + switch to COTI Testnet
 * Returns wallet address
 */
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed. Please install MetaMask to continue.')
  }

  // Request accounts
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  _address = accounts[0]

  // Setup ethers provider if available
  try {
    const { ethers } = await import('ethers')
    _provider = new ethers.BrowserProvider(window.ethereum)
    _signer   = await _provider.getSigner()
  } catch {
    // ethers not bundled in dev mode — use raw provider
  }

  // Switch / add COTI Testnet
  await switchToCOTI()

  // Listen for account/chain changes
  window.ethereum.on('accountsChanged', (accs) => {
    _address = accs[0] || null
    window.dispatchEvent(new CustomEvent('wallet:changed', { detail: { address: _address } }))
  })
  window.ethereum.on('chainChanged', () => window.location.reload())

  return _address
}

/**
 * Switch MetaMask to COTI Testnet — adds it if not present
 */
export async function switchToCOTI() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: Cfg.coti.chainHex }],
    })
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId:           Cfg.coti.chainHex,
          chainName:         'COTI Testnet',
          nativeCurrency:    { name: 'COTI', symbol: 'COTI', decimals: 18 },
          rpcUrls:           [Cfg.coti.rpc],
          blockExplorerUrls: [Cfg.coti.explorer],
        }],
      })
    } else {
      throw err
    }
  }
}

/**
 * Get NOET balance for address via raw RPC (no ethers needed)
 */
export async function getNOETBalance(address) {
  if (!Cfg.hasContracts() || !address) return '0'
  try {
    const { ethers } = await import('ethers')
    const p = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(Cfg.contract.token, TOKEN_ABI, p)
    const bal = await contract.balanceOf(address)
    return ethers.formatUnits(bal, 6)

  } catch {
    return '0'
  }
}

/**
 * Claim reward on-chain via NOETRewards contract
 * @param {'journal'|'mood'|'streak_3'|'streak_7'|'streak_30'|'first'} type
 */
export async function claimOnChain(type) {
  if (!Cfg.hasContracts()) {
    console.warn('[NOETICA] Contracts not deployed yet — reward tracked locally only')
    return null
  }
  if (!_signer) throw new Error('Wallet not connected')

  try {
    const { ethers } = await import('ethers')
    const contract = new ethers.Contract(Cfg.contract.rewards, REWARDS_ABI, _signer)

    let tx
    if (type === 'journal')         tx = await contract.claimJournalReward()
    else if (type === 'mood')       tx = await contract.claimMoodReward()
    else if (type === 'streak_3')   tx = await contract.claimStreakReward(3)
    else if (type === 'streak_7')   tx = await contract.claimStreakReward(7)
    else if (type === 'streak_30')  tx = await contract.claimStreakReward(30)
    else if (type === 'first')      tx = await contract.claimFirstSession()

    const receipt = await tx.wait()
    return receipt.hash
  } catch (err) {
    console.error('[NOETICA] On-chain claim failed:', err.message)
    return null
  }
}

export function shortAddr(addr) {
  if (!addr) return ''
  return addr.slice(0, 6) + '…' + addr.slice(-4)
}

export function txUrl(hash) {
  return `${Cfg.coti.explorer}/tx/${hash}`
}

/** Simulate tx hash for local reward tracking (before contract) */
export function mockTxHash() {
  return '0x' + Array.from(crypto.getRandomValues(new Uint8Array(20)))
    .map(b => b.toString(16).padStart(2,'0')).join('')
}
