/**
 * NOETICA — Wallet v3
 * Flow: Browser → pilih wallet → wallet app konfirmasi → kembali ke browser
 * Pakai WalletConnect v2 (QR / deep link) sebagai primary di mobile
 */
import { Cfg } from './config.js'

export const REWARDS_ABI = [
  'function claimJournalReward() external',
  'function claimMoodReward() external',
  'function claimStreakReward(uint256 streakDays) external',
  'function claimFirstSession() external',
]
export const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
]

const COTI = {
  chainId:'0x6C0360', chainName:'COTI Testnet',
  nativeCurrency:{name:'COTI',symbol:'COTI',decimals:18},
  rpcUrls:['https://testnet.coti.io/rpc'],
  blockExplorerUrls:['https://testnet.cotiscan.io'],
}

let _address=null, _signer=null, _provider=null, _wc=null

export const getAddress  = ()=>_address
export const getSigner   = ()=>_signer
export const isConnected = ()=>Boolean(_address)
export const isMobile    = ()=>/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
export const hasInjected = ()=>Boolean(window.ethereum)

// ─── MAIN ENTRY ─────────────────────────────────────────────────────────────
export function connectWallet(){
  return new Promise((ok,fail)=>_showPicker(ok,fail))
}

// ─── PICKER UI ──────────────────────────────────────────────────────────────
function _showPicker(ok, fail){
  document.getElementById('_wlt-picker')?.remove()

  const mobile = isMobile()
  const inj    = hasInjected()

  // ── Wallet options list ──
  const wallets = []

  // 1. Injected (MetaMask extension / in-app browser)
  if(inj){
    const name = window.ethereum?.isTrust ? 'Trust Wallet'
               : window.ethereum?.isMetaMask ? 'MetaMask'
               : 'Connected Wallet'
    wallets.push({
      id:'injected', name, sub:'Continue with browser wallet',
      icon:_iconMM(), fn:()=>_doInjected(ok,fail,overlay)
    })
  }

  // 2. WalletConnect — primary untuk mobile (buka wallet app untuk konfirmasi)
  wallets.push({
    id:'wc', name:'WalletConnect', sub:'Scan QR atau buka via wallet app',
    icon:_iconWC(), divider:wallets.length>0,
    fn:()=>_doWC(ok,fail,overlay)
  })

  // 3. Deep links untuk mobile tanpa injected
  if(mobile && !inj){
    wallets.push({id:'mm',  name:'MetaMask',    sub:'Buka di app MetaMask',    icon:_iconMM(), fn:()=>_doDeep('mm',ok,fail,overlay)})
    wallets.push({id:'tw',  name:'Trust Wallet',sub:'Buka di app Trust Wallet',icon:_iconTW(), fn:()=>_doDeep('tw',ok,fail,overlay)})
  }

  // 4. Install prompt untuk desktop tanpa wallet
  if(!mobile && !inj){
    wallets.push({id:'install',name:'Install MetaMask',sub:'Pasang extension untuk desktop',icon:_iconMM(),fn:()=>{window.open('https://metamask.io/download/','_blank');_close(overlay)}})
  }

  // ── Build DOM ──
  const overlay = document.createElement('div')
  overlay.id = '_wlt-picker'
  overlay.style.cssText=[
    'position:fixed;inset:0;z-index:99999',
    'display:flex;align-items:flex-end;justify-content:center',
    'background:rgba(0,0,0,.78);backdrop-filter:blur(10px)',
    'padding-bottom:env(safe-area-inset-bottom,0px)',
    'animation:_wpFI .22s ease',
  ].join(';')

  const card = document.createElement('div')
  card.style.cssText=[
    'width:100%;max-width:440px',
    'background:#0d0d18;border:1px solid rgba(255,255,255,.1)',
    'border-radius:22px 22px 0 0;padding:24px 20px 28px',
    'animation:_wpSU .3s cubic-bezier(.16,1,.3,1)',
  ].join(';')

  card.innerHTML=`
<style>
@keyframes _wpFI{from{opacity:0}to{opacity:1}}
@keyframes _wpSU{from{transform:translateY(100%)}to{transform:none}}
._wr{width:100%;display:flex;align-items:center;gap:13px;padding:13px 15px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
  border-radius:14px;cursor:pointer;margin-bottom:8px;color:#fff;
  text-align:left;transition:all .18s}
._wr:hover,._wr:active{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.15)}
._wn{font-size:15px;font-weight:500;color:#fff;display:block;margin-bottom:2px}
._ws{font-size:12px;color:rgba(255,255,255,.38);display:block}
._wdiv{display:flex;align-items:center;gap:10px;margin:10px 0 8px}
._wdiv::before,._wdiv::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.07)}
._wdiv span{font-size:11px;color:rgba(255,255,255,.22);letter-spacing:.08em}
</style>
<div style="width:34px;height:4px;border-radius:2px;background:rgba(255,255,255,.12);margin:0 auto 20px"></div>
<div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:400;color:#fff;text-align:center;margin-bottom:4px">Connect Wallet</div>
<div style="font-size:13px;color:rgba(255,255,255,.35);text-align:center;margin-bottom:20px">Pilih wallet untuk terhubung</div>
<div id="_wlt-list"></div>
<button id="_wlt-cancel" style="width:100%;padding:12px;background:none;border:none;color:rgba(255,255,255,.28);font-size:13px;cursor:pointer;border-radius:10px;margin-top:2px">Batal</button>
`
  overlay.appendChild(card)
  document.body.appendChild(overlay)

  // Render wallet buttons
  const list = card.querySelector('#_wlt-list')
  wallets.forEach(w=>{
    if(w.divider){
      const d=document.createElement('div'); d.className='_wdiv'; d.innerHTML='<span>atau</span>'; list.appendChild(d)
    }
    const btn=document.createElement('button'); btn.className='_wr'
    btn.innerHTML=`${w.icon}<div style="flex:1"><span class="_wn">${w.name}</span><span class="_ws">${w.sub}</span></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`
    btn.addEventListener('click',w.fn)
    list.appendChild(btn)
  })

  overlay.addEventListener('click',e=>{if(e.target===overlay){_close(overlay);fail({code:4001})}})
  card.querySelector('#_wlt-cancel').addEventListener('click',()=>{_close(overlay);fail({code:4001,message:'User cancelled'})})
}

function _close(el){ el?.remove(); document.getElementById('_wlt-picker')?.remove() }

// ─── CONNECT METHODS ─────────────────────────────────────────────────────────

// Injected (browser extension / in-app browser)
async function _doInjected(ok, fail, overlay){
  _close(overlay)
  try{
    const accs = await window.ethereum.request({method:'eth_requestAccounts'})
    _address = accs[0]
    await _setup(window.ethereum)
    await _addCOTI(window.ethereum)
    _listen(window.ethereum)
    ok(_address)
  }catch(e){ fail(e) }
}

// WalletConnect v2 — buka wallet app untuk konfirmasi, lalu kembali ke browser
async function _doWC(ok, fail, overlay){
  _close(overlay)
  _showStatus('Membuka WalletConnect...')
  try{
    const {EthereumProvider} = await import('https://esm.sh/@walletconnect/ethereum-provider@2.17.0')
    _wc = await EthereumProvider.init({
      projectId: 'b56e18d47c72ab683b10814b3f267c34',
      chains: [1],
      optionalChains: [7082400, 56, 137],
      showQrModal: true,
      metadata:{
        name:'NOETICA',
        description:'Private AI mental wellness on COTI Network',
        url: window.location.origin,
        icons:[`${window.location.origin}/icons/icon-192.png`],
      },
      qrModalOptions:{
        themeMode:'dark',
        themeVariables:{
          '--wcm-z-index':'99998',
          '--wcm-accent-color':'#00e5c8',
          '--wcm-background-color':'#0d0d18',
          '--wcm-font-family':'"DM Sans",sans-serif',
        }
      }
    })
    // WalletConnect akan:
    // 1. Tampilkan QR code di browser
    // 2. User scan dengan wallet app (atau klik deep link)
    // 3. Wallet app terbuka → user approve → kembali ke browser otomatis
    await _wc.enable()
    const accs = _wc.accounts
    if(!accs?.length) throw new Error('No accounts returned')
    _address = accs[0]
    await _setup(_wc)
    try{ await _wc.request({method:'wallet_addEthereumChain',params:[COTI]}) }catch{}
    _wc.on('accountsChanged', a=>{
      _address=a[0]||null
      window.dispatchEvent(new CustomEvent('wallet:changed',{detail:{address:_address}}))
    })
    _hideStatus()
    ok(_address)
  }catch(e){
    _hideStatus()
    if(e?.code===4001||e?.message?.includes('rejected')||e?.message?.includes('cancel')){
      fail({code:4001})
    }else{
      // Fallback: tampilkan manual deep link
      _showFallback(ok,fail)
    }
  }
}

// Deep link — redirect ke wallet app, setelah approve kembali ke browser
function _doDeep(type, ok, fail, overlay){
  _close(overlay)
  const url = window.location.href
  const link = type==='mm'
    ? `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
    : `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(url)}`
  // Buka wallet app — setelah approve, wallet app redirect kembali ke browser
  window.location.href = link
  // Saat user kembali, window.ethereum sudah tersedia
  setTimeout(()=>{
    if(hasInjected()) _doInjected(ok,fail,null)
    else fail(new Error('Buka halaman ini di dalam app MetaMask atau Trust Wallet'))
  },1800)
}

// ─── FALLBACK ─────────────────────────────────────────────────────────────────
function _showFallback(ok, fail){
  document.getElementById('_wlt-picker')?.remove()
  const el=document.createElement('div')
  el.id='_wlt-picker'
  el.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.88);backdrop-filter:blur(12px);padding:20px'
  const url=encodeURIComponent(window.location.href)
  el.innerHTML=`
  <div style="width:100%;max-width:380px;background:#0d0d18;border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:26px;text-align:center">
    <div style="font-family:'Cormorant Garamond',serif;font-size:22px;color:#fff;margin-bottom:6px">Buka di Wallet App</div>
    <div style="font-size:13px;color:rgba(255,255,255,.4);margin-bottom:18px;line-height:1.6">Setelah approve di wallet app, kamu akan kembali ke NOETICA otomatis</div>
    <div style="background:rgba(0,229,200,.06);border:1px solid rgba(0,229,200,.18);border-radius:10px;padding:10px 14px;margin-bottom:18px;font-family:monospace;font-size:11px;color:#00e5c8;word-break:break-all;text-align:left">${window.location.href}</div>
    <a href="https://metamask.app.link/dapp/${window.location.host}" style="display:block;padding:13px;background:#F6851B;color:#fff;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;margin-bottom:9px">Buka di MetaMask →</a>
    <a href="https://link.trustwallet.com/open_url?coin_id=60&url=${url}" style="display:block;padding:13px;background:#3375BB;color:#fff;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;margin-bottom:14px">Buka di Trust Wallet →</a>
    <button onclick="document.getElementById('_wlt-picker')?.remove()" style="padding:11px 20px;background:none;border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.35);border-radius:10px;cursor:pointer;font-size:13px">Batal</button>
  </div>`
  document.body.appendChild(el)
  el.addEventListener('click',e=>{if(e.target===el){el.remove();fail({code:4001})}})
}

// ─── STATUS TOAST ──────────────────────────────────────────────────────────────
let _statusEl = null
function _showStatus(msg){
  _statusEl?.remove()
  _statusEl=document.createElement('div')
  _statusEl.style.cssText='position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#0d0d18;border:1px solid rgba(0,229,200,.2);color:#00e5c8;font-family:monospace;font-size:12px;padding:9px 18px;border-radius:20px;z-index:100000;white-space:nowrap'
  _statusEl.textContent=msg
  document.body.appendChild(_statusEl)
}
function _hideStatus(){ _statusEl?.remove(); _statusEl=null }

// ─── COTI NETWORK ─────────────────────────────────────────────────────────────
async function _addCOTI(provider){
  try{
    await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:COTI.chainId}]})
  }catch(e){
    if(e?.code===4902||e?.code===-32603){
      try{await provider.request({method:'wallet_addEthereumChain',params:[COTI]})}catch{}
    }
  }
}

// ─── ETHERS SETUP ─────────────────────────────────────────────────────────────
async function _setup(raw){
  try{
    const {ethers}=await import('ethers')
    _provider=new ethers.BrowserProvider(raw)
    _signer=await _provider.getSigner()
  }catch{}
}

function _listen(prov){
  try{
    prov.on('accountsChanged',a=>{_address=a[0]||null;window.dispatchEvent(new CustomEvent('wallet:changed',{detail:{address:_address}}))})
    prov.on('chainChanged',()=>window.location.reload())
  }catch{}
}

// ─── BALANCE & ON-CHAIN ───────────────────────────────────────────────────────
export async function getNOETBalance(address){
  if(!Cfg.hasContracts()||!address) return '0'
  try{
    const {ethers}=await import('ethers')
    const raw=_wc||window.ethereum
    if(!raw) return '0'
    const p=new ethers.BrowserProvider(raw)
    const c=new ethers.Contract(Cfg.contract.token,TOKEN_ABI,p)
    return ethers.formatUnits(await c.balanceOf(address),6)
  }catch{return '0'}
}

export async function claimOnChain(type){
  if(!_signer) return null
  try{
    const {ethers}=await import('ethers')
    const contract=new ethers.Contract('0x19bEE8b027153e6fE85c0083e5D8801336C26E1b',REWARDS_ABI,_signer)
    const map={journal:()=>contract.claimJournalReward(),mood:()=>contract.claimMoodReward(),streak_3:()=>contract.claimStreakReward(3),streak_7:()=>contract.claimStreakReward(7),streak_30:()=>contract.claimStreakReward(30),first:()=>contract.claimFirstSession()}
    const tx=await map[type]?.()
    return tx?(await tx.wait()).hash:null
  }catch{return null}
}

export const shortAddr = a=>a?a.slice(0,6)+'…'+a.slice(-4):''
export const txUrl     = h=>`${Cfg.coti.explorer}/tx/${h}`
export const mockTxHash= ()=>'0x'+Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b=>b.toString(16).padStart(2,'0')).join('')

// ─── ICONS ────────────────────────────────────────────────────────────────────
function _iconMM(){return`<svg width="32" height="32" viewBox="0 0 212 189" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0"><polygon fill="#E2761B" points="201,17 120,79 135,43"/><polygon fill="#E4761B" points="10,17 91,79 77,43"/><polygon fill="#E4761B" points="173,133 151,167 197,180 211,134"/><polygon fill="#E4761B" points="1,134 15,180 61,167 39,133"/><polygon fill="#E4761B" points="58,82 46,101 92,103 91,54"/><polygon fill="#E4761B" points="153,82 119,54 118,104 164,103"/><polygon fill="#E4761B" points="61,167 88,153 64,134"/><polygon fill="#E4761B" points="123,153 150,167 147,134"/></svg>`}
function _iconWC(){return`<svg width="32" height="32" viewBox="0 0 40 40" fill="none" style="flex-shrink:0"><rect width="40" height="40" rx="10" fill="#3B99FC"/><path d="M10 20c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M13.5 23.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="20" cy="27" r="2.5" fill="white"/></svg>`}
function _iconTW(){return`<svg width="32" height="32" viewBox="0 0 40 40" fill="none" style="flex-shrink:0"><rect width="40" height="40" rx="10" fill="#3375BB"/><path d="M20 8L9 12.5V21c0 6.4 4.8 12 11 14 6.2-2 11-7.6 11-14v-8.5L20 8z" fill="rgba(255,255,255,.95)"/><path d="M15 21l4 4 7-8" stroke="#3375BB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
