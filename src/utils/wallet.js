/**
 * NOETICA — Wallet Module v2
 * Mobile-first: WalletConnect v2 + deep links + browser extension
 */
import { Cfg } from './config.js'

export const REWARDS_ABI = [
  'function claimJournalReward() external',
  'function claimMoodReward() external',
  'function claimStreakReward(uint256 streakDays) external',
  'function claimFirstSession() external',
  'function canClaimJournal(address) view returns (bool)',
  'function canClaimMood(address) view returns (bool)',
]

export const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
]

const COTI_CHAIN = {
  chainId: '0x6C0360',
  chainName: 'COTI Testnet',
  nativeCurrency: { name: 'COTI', symbol: 'COTI', decimals: 18 },
  rpcUrls: ['https://testnet.coti.io/rpc'],
  blockExplorerUrls: ['https://testnet.cotiscan.io'],
}

let _provider = null
let _signer = null
let _address = null
let _wcProvider = null

export const getAddress = () => _address
export const getSigner = () => _signer
export const isConnected = () => Boolean(_address)
export const isMobile = () => /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent)
export const hasInjected = () => typeof window.ethereum !== 'undefined'

export function connectWallet() {
  return new Promise((resolve, reject) => showPicker(resolve, reject))
}

function showPicker(resolve, reject) {
  document.getElementById('noetica-wallet-picker')?.remove()

  const mobile = isMobile()
  const inj = hasInjected()

  const overlay = document.createElement('div')
  overlay.id = 'noetica-wallet-picker'
  overlay.setAttribute('style', [
    'position:fixed;inset:0;z-index:99999',
    'display:flex;align-items:flex-end;justify-content:center',
    'background:rgba(2,2,6,.88);backdrop-filter:blur(12px)',
    'padding-bottom:env(safe-area-inset-bottom,0px)',
    'animation:wpFadeIn .2s ease',
  ].join(';'))

  const ICON_MM = `<svg width="32" height="32" viewBox="0 0 212 189" xmlns="http://www.w3.org/2000/svg"><path d="M201.8 17.3L119.5 79l15.5-36.7 66.8-25z" fill="#E2761B"/><path d="M10 17.3l81.6 62.3L76.8 42.3 10 17.3z" fill="#E4761B"/><path d="M172.5 133.1l-21.8 33.5 46.7 12.8 13.4-45.6-38.3-.7zM1.5 133.8l13.3 45.6 46.7-12.8-21.8-33.5-38.2.7z" fill="#E4761B"/><path d="M58.8 81.8L46.8 100.8l46.4 2.1-1.6-49.8-32.8 28.7zM153 81.8l-33.4-28.4-1.1 50.5 46.4-2.1L153 81.8z" fill="#E4761B"/><path d="M61.5 166.6l27.9-13.5-24.1-18.8-3.8 32.3zM122.6 153.1l27.9 13.5-3.8-32.3-24.1 18.8z" fill="#E4761B"/></svg>`
  const ICON_TW = `<svg width="32" height="32" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#3375BB"/><path d="M20 7L9 11.5V20c0 6.4 4.8 12 11 14 6.2-2 11-7.6 11-14v-8.5L20 7z" fill="white" fill-opacity=".95"/><path d="M15 20.5l4 4 7-8" stroke="#3375BB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  const ICON_WC = `<svg width="32" height="32" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#3B99FC"/><path d="M10.5 20c0-5.2 4.3-9.5 9.5-9.5s9.5 4.3 9.5 9.5" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M13.5 23.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="20" cy="27" r="2.5" fill="white"/></svg>`
  const ICON_LINK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`

  const wallets = []

  if (inj) {
    const name = window.ethereum?.isTrust ? 'Trust Wallet' : window.ethereum?.isMetaMask ? 'MetaMask' : 'Browser Wallet'
    const icon = window.ethereum?.isTrust ? ICON_TW : ICON_MM
    wallets.push({ name, icon, sub: 'Connected wallet in browser', fn: () => doInjected(resolve, reject, overlay) })
  }

  if (mobile && !inj) {
    wallets.push({ name: 'MetaMask', icon: ICON_MM, sub: 'Open in MetaMask app', fn: () => doDeepLink('metamask', resolve, reject, overlay) })
    wallets.push({ name: 'Trust Wallet', icon: ICON_TW, sub: 'Open in Trust Wallet', fn: () => doDeepLink('trust', resolve, reject, overlay) })
  }

  wallets.push({ name: 'WalletConnect', icon: ICON_WC, sub: 'Scan QR with any wallet', fn: () => doWalletConnect(resolve, reject, overlay), divider: wallets.length > 0 })

  if (!mobile && !inj) {
    wallets.push({ name: 'Install MetaMask', icon: ICON_MM, sub: 'Get the browser extension', fn: () => { window.open('https://metamask.io/download/', '_blank'); close(overlay, null) } })
  }

  const rows = wallets.map((w, i) => `
    <button class="wp-row" data-idx="${i}" style="width:100%;display:flex;align-items:center;gap:14px;padding:14px 16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;cursor:pointer;margin-bottom:9px;color:#fff;text-align:left;transition:all .18s;${w.divider ? 'margin-top:16px' : ''}">
      ${w.icon}
      <div style="flex:1">
        <div style="font-size:15px;font-weight:500;color:#fff;margin-bottom:2px">${w.name}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.35)">${w.sub}</div>
      </div>
      ${ICON_LINK}
    </button>
    ${w.divider ? '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;margin-top:6px"><div style="flex:1;height:1px;background:rgba(255,255,255,.06)"></div><span style="font-size:11px;color:rgba(255,255,255,.2);letter-spacing:.08em">OR</span><div style="flex:1;height:1px;background:rgba(255,255,255,.06)"></div></div>' : ''}
  `).join('')

  const card = document.createElement('div')
  card.style.cssText = 'width:100%;max-width:420px;background:#0d0d18;border:1px solid rgba(255,255,255,.1);border-radius:22px 22px 0 0;padding:28px 20px 32px;animation:wpSlide .32s cubic-bezier(.16,1,.3,1)'
  card.innerHTML = `
    <style>
      @keyframes wpFadeIn{from{opacity:0}to{opacity:1}}
      @keyframes wpSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}
      .wp-row:hover,.wp-row:active{background:rgba(255,255,255,.09)!important;border-color:rgba(255,255,255,.16)!important}
    </style>
    <div style="width:36px;height:4px;background:rgba(255,255,255,.12);border-radius:2px;margin:0 auto 22px"></div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:400;color:#fff;text-align:center;margin-bottom:4px">Connect Wallet</div>
    <div style="font-size:13px;color:rgba(255,255,255,.35);text-align:center;margin-bottom:22px">Choose your wallet to continue</div>
    ${rows}
    <button id="wp-cancel" style="width:100%;padding:13px;background:none;border:none;color:rgba(255,255,255,.3);font-size:13px;cursor:pointer;border-radius:10px;margin-top:4px">Cancel</button>
  `

  overlay.appendChild(card)
  document.body.appendChild(overlay)

  // Bind wallet buttons
  card.querySelectorAll('.wp-row').forEach(btn => {
    btn.addEventListener('click', () => wallets[+btn.dataset.idx].fn())
  })

  card.querySelector('#wp-cancel').addEventListener('click', () => {
    close(overlay, null)
    reject({ code: 4001, message: 'User cancelled' })
  })

  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      close(overlay, null)
      reject({ code: 4001 })
    }
  })
}

function close(overlay) {
  overlay?.remove()
  document.getElementById('noetica-wallet-picker')?.remove()
}

async function doInjected(resolve, reject, overlay) {
  close(overlay)
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    _address = accounts[0]
    await setupProvider(window.ethereum)
    await switchToCOTI(window.ethereum)
    listenEvents(window.ethereum)
    resolve(_address)
  } catch (e) { reject(e) }
}

function doDeepLink(type, resolve, reject, overlay) {
  close(overlay)
  const url = window.location.href
  const deepLink = type === 'metamask'
    ? `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
    : `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(url)}`
  window.location.href = deepLink
  setTimeout(() => {
    if (hasInjected()) doInjected(resolve, reject, null)
    else reject(new Error(`Open this page inside the ${type === 'metamask' ? 'MetaMask' : 'Trust Wallet'} app browser`))
  }, 1500)
}

async function doWalletConnect(resolve, reject, overlay) {
  close(overlay)
  try {
    const { EthereumProvider } = await import('https://esm.sh/@walletconnect/ethereum-provider@2.17.0')
    _wcProvider = await EthereumProvider.init({
      projectId: 'b56e18d47c72ab683b10814b3f267c34',
      chains: [1],
      optionalChains: [7082400, 56, 137],
      showQrModal: true,
      metadata: {
        name: 'NOETICA',
        description: 'Private AI mental wellness on COTI Network',
        url: window.location.origin,
        icons: [`${window.location.origin}/icons/icon-192.png`],
      },
      qrModalOptions: {
        themeMode: 'dark',
        themeVariables: {
          '--wcm-z-index': '99998',
          '--wcm-accent-color': '#00e5c8',
          '--wcm-background-color': '#0d0d18',
        }
      }
    })

    await _wcProvider.enable()
    const accounts = _wcProvider.accounts
    if (!accounts?.length) throw new Error('No accounts')
    _address = accounts[0]
    await setupProvider(_wcProvider)
    try { await _wcProvider.request({ method: 'wallet_addEthereumChain', params: [COTI_CHAIN] }) } catch {}
    _wcProvider.on('accountsChanged', a => {
      _address = a[0] || null
      window.dispatchEvent(new CustomEvent('wallet:changed', { detail: { address: _address } }))
    })
    resolve(_address)
  } catch (e) {
    if (e?.code === 4001 || e?.message?.includes('rejected') || e?.message?.includes('cancel')) {
      reject({ code: 4001 })
    } else {
      showFallback(resolve, reject)
    }
  }
}

function showFallback(resolve, reject) {
  const el = document.createElement('div')
  el.id = 'noetica-wallet-picker'
  el.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.88);backdrop-filter:blur(12px);padding:20px'
  const url = encodeURIComponent(window.location.href)
  el.innerHTML = `
    <div style="width:100%;max-width:380px;background:#0d0d18;border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:28px;text-align:center">
      <div style="font-family:'Cormorant Garamond',serif;font-size:22px;color:#fff;margin-bottom:8px">Open in Wallet App</div>
      <div style="font-size:13px;color:rgba(255,255,255,.4);margin-bottom:20px;line-height:1.6">Open this URL inside MetaMask or Trust Wallet browser</div>
      <div style="background:rgba(0,229,200,.06);border:1px solid rgba(0,229,200,.18);border-radius:10px;padding:10px 14px;margin-bottom:20px;font-family:monospace;font-size:11px;color:#00e5c8;word-break:break-all;text-align:left">${window.location.href}</div>
      <a href="https://metamask.app.link/dapp/${window.location.host}" style="display:block;padding:14px;background:#F6851B;color:white;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;margin-bottom:10px">Open in MetaMask</a>
      <a href="https://link.trustwallet.com/open_url?coin_id=60&url=${url}" style="display:block;padding:14px;background:#3375BB;color:white;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;margin-bottom:14px">Open in Trust Wallet</a>
      <button onclick="document.getElementById('noetica-wallet-picker')?.remove()" style="padding:12px 20px;background:none;border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.4);border-radius:10px;cursor:pointer;font-size:13px">Cancel</button>
    </div>
  `
  document.body.appendChild(el)
  el.addEventListener('click', e => { if(e.target===el){el.remove();reject({code:4001})} })
}

async function switchToCOTI(provider) {
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: COTI_CHAIN.chainId }] })
  } catch (e) {
    if (e?.code === 4902 || e?.code === -32603) {
      try { await provider.request({ method: 'wallet_addEthereumChain', params: [COTI_CHAIN] }) } catch {}
    }
  }
}

async function setupProvider(rawProvider) {
  try {
    const { ethers } = await import('ethers')
    _provider = new ethers.BrowserProvider(rawProvider)
    _signer = await _provider.getSigner()
  } catch {}
}

function listenEvents(provider) {
  try {
    provider.on('accountsChanged', a => {
      _address = a[0] || null
      window.dispatchEvent(new CustomEvent('wallet:changed', { detail: { address: _address } }))
    })
    provider.on('chainChanged', () => window.location.reload())
  } catch {}
}

export async function getNOETBalance(address) {
  if (!Cfg.hasContracts() || !address) return '0'
  try {
    const { ethers } = await import('ethers')
    const raw = _wcProvider || window.ethereum
    if (!raw) return '0'
    const p = new ethers.BrowserProvider(raw)
    const c = new ethers.Contract(Cfg.contract.token, TOKEN_ABI, p)
    return ethers.formatUnits(await c.balanceOf(address), 6)
  } catch { return '0' }
}

export async function claimOnChain(type) {
  if (!Cfg.hasContracts() || !_signer) return null
  try {
    const { ethers } = await import('ethers')
    const c = new ethers.Contract(Cfg.contract.rewards, REWARDS_ABI, _signer)
    const m = {
      journal: () => c.claimJournalReward(),
      mood: () => c.claimMoodReward(),
      streak_3: () => c.claimStreakReward(3),
      streak_7: () => c.claimStreakReward(7),
      streak_30: () => c.claimStreakReward(30),
      first: () => c.claimFirstSession(),
    }
    const tx = await m[type]?.()
    return tx ? (await tx.wait()).hash : null
  } catch { return null }
}

export const shortAddr = a => a ? a.slice(0,6)+'…'+a.slice(-4) : ''
export const txUrl = h => `${Cfg.coti.explorer}/tx/${h}`
export const mockTxHash = () => '0x'+Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b=>b.toString(16).padStart(2,'0')).join('')
