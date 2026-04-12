/**
 * NOETICA — Main Application
 * Auth: Wallet-first, no vault key shown to user
 * Encryption key derived silently from wallet signature
 */
import { Cfg } from './utils/config.js'
import { encrypt, decrypt, obfuscate } from './utils/crypto.js'
import { connectWallet as _connectWallet, isConnected, shortAddr, claimOnChain, getNOETBalance, mockTxHash } from './utils/wallet.js'
import { sendToAI, getInsight, detectCrisis } from './utils/ai.js'

const LOGO_SRC = 'data:image/jpeg;base64,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';

// ═══════════════════════════════════════════
// WALLET-DERIVED ENCRYPTION
// ═══════════════════════════════════════════
async function deriveVaultKey(address) {
  // Use address-based key for consistency across all wallet types
  // This ensures vault always decrypts correctly regardless of provider
  const addr = address.toLowerCase().replace('0x','')
  // Pad or trim to exactly 32 chars for AES key
  return (addr + addr).slice(0,32)
}

async function encryptData(text, key) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv   = crypto.getRandomValues(new Uint8Array(12))
  const k    = await _deriveKey(key, salt)
  const ct   = await crypto.subtle.encrypt({name:'AES-GCM',iv}, k, new TextEncoder().encode(text))
  const out  = new Uint8Array(28 + ct.byteLength)
  out.set(salt,0); out.set(iv,16); out.set(new Uint8Array(ct),28)
  return btoa(String.fromCharCode(...out))
}

async function decryptData(b64, key) {
  const raw = new Uint8Array(atob(b64).split('').map(c=>c.charCodeAt(0)))
  const k   = await _deriveKey(key, raw.slice(0,16))
  const pt  = await crypto.subtle.decrypt({name:'AES-GCM',iv:raw.slice(16,28)}, k, raw.slice(28))
  return new TextDecoder().decode(pt)
}

async function _deriveKey(pw, salt) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), {name:'PBKDF2'}, false, ['deriveKey'])
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:150000,hash:'SHA-256'}, k, {name:'AES-GCM',length:256}, false, ['encrypt','decrypt'])
}



// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
const S = {
  name:'', vaultKey:'', address:null,
  messages:[], moods:[], entries:[],
  streak:0, bestStreak:0,
  noet:0, totalEarned:0, transactions:[],
  journaledToday:false, selMood:null, selTags:[],
  isTyping:false, tab:'chat',
  PROMPTS:[
    'What moment today made you feel most like yourself?',
    "What are you carrying right now that you haven't said out loud?",
    'If your emotions were weather today — what is the forecast?',
    'What would you tell a dear friend who felt exactly as you feel?',
    "Where in your body do you feel today's tension or calm?",
    'What small thing brought unexpected comfort recently?',
    'What does your ideal version of tomorrow look like?',
    'What are you grateful for in this exact moment?',
    'What emotion are you trying not to feel, and why?',
  ],
  get uMsgs() { return this.messages.filter(m=>m.role==='user').length }
}

async function saveVault() {
  if (!S.vaultKey||!S.address) return
  const d = {
    name:S.name, messages:S.messages.slice(-40), moods:S.moods,
    entries:S.entries, streak:S.streak, bestStreak:S.bestStreak,
    noet:S.noet, totalEarned:S.totalEarned, transactions:S.transactions.slice(0,30),
    journaledToday:S.journaledToday
  }
  const encrypted = await encryptData(JSON.stringify(d), S.vaultKey)
  localStorage.setItem(`noetica_${S.address}`, encrypted)
  // Backup noet in plaintext sessionStorage so it survives key issues
  sessionStorage.setItem(`noetica_noet_${S.address}`, String(S.noet))
  sessionStorage.setItem(`noetica_earned_${S.address}`, String(S.totalEarned))
}

async function loadVault(address, vaultKey) {
  const raw = localStorage.getItem(`noetica_${address}`)
  if (!raw) return false
  
  // Try multiple possible keys (handles migration from old key formats)
  const addr = address.toLowerCase().replace('0x','')
  const keysToTry = [
    vaultKey,
    (addr+addr).slice(0,32),                    // new consistent key
    addr.slice(0,32),                            // old fallback key
    address.toLowerCase().replace('0x','').slice(0,32), // another old format
  ]
  
  for (const key of keysToTry) {
    try {
      const d = JSON.parse(await decryptData(raw, key))
      S.name=d.name||''
      S.messages=d.messages||[]
      S.moods=d.moods||[]
      S.entries=d.entries||[]
      S.streak=d.streak||0
      S.bestStreak=d.bestStreak||0
      // Never lose rewards - take the maximum
      S.noet=Math.max(S.noet||0, d.noet||0)
      S.totalEarned=Math.max(S.totalEarned||0, d.totalEarned||0)
      S.transactions=d.transactions||[]
      S.journaledToday=S.entries.some(e=>new Date(e.ts).toDateString()===new Date().toDateString())
      // Re-save with new consistent key if we used a different key
      if (key !== vaultKey) {
        setTimeout(()=>saveVault(), 500)
      }
      return true
    } catch { continue }
  }
  
  // If all keys fail, try sessionStorage backup for rewards at least
  const backupNoet = sessionStorage.getItem(`noetica_noet_${address}`)
  const backupEarned = sessionStorage.getItem(`noetica_earned_${address}`)
  if (backupNoet) {
    S.noet = Math.max(S.noet||0, parseInt(backupNoet)||0)
    S.totalEarned = Math.max(S.totalEarned||0, parseInt(backupEarned)||0)
    console.warn('[NOETICA] Vault decrypt failed, restored rewards from session backup')
    return false
  }
  console.warn('[NOETICA] Vault decrypt failed for all keys, starting fresh')
  return false
}


// ══════════════════════════════════════════
// MOUNT
// ══════════════════════════════════════════
function mount() {
  document.getElementById('app').innerHTML = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;font-size:16px;-webkit-font-smoothing:antialiased;overflow:hidden}
body{background:#020206;color:#fff;font-family:'DM Sans',system-ui,sans-serif}
:root{
  --void:#020206;--abyss:#05050b;--surface:#0d0d18;--raised:#121222;
  --b0:rgba(255,255,255,.03);--b1:rgba(255,255,255,.07);
  --b2:rgba(255,255,255,.12);--b3:rgba(255,255,255,.22);
  --s0:#252538;--s1:#3a3a52;--s2:#575770;--s3:#787892;
  --s4:#9898b0;--s5:#c0c0d0;--s6:#e0e0ee;
  --teal:#00e5c8;--gold:rgba(255,215,100,.75);
  --fd:'Cormorant Garamond',Georgia,serif;
  --fb:'DM Sans',system-ui,sans-serif;
  --fm:'DM Mono',monospace;
  --r:10px;--rl:16px;--rxl:22px;
  --tbar:56px;--bbar:72px;
  --safe-bot:env(safe-area-inset-bottom,0px);
}
::-webkit-scrollbar{width:2px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:1px}
::selection{background:rgba(0,229,200,.2)}

/* ── BG ── */
#bg{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.orb{position:absolute;border-radius:50%;filter:blur(120px);animation:orbP ease-in-out infinite alternate}
.o1{width:700px;height:700px;top:-280px;left:50%;transform:translateX(-50%);background:radial-gradient(circle,rgba(255,255,255,.025),transparent 65%);animation-duration:20s}
.o2{width:500px;height:500px;bottom:-180px;right:-130px;background:radial-gradient(circle,rgba(0,229,200,.036),transparent 65%);animation-duration:14s;animation-delay:-6s}
.o3{width:400px;height:400px;top:30%;left:-100px;background:radial-gradient(circle,rgba(100,100,220,.028),transparent 65%);animation-duration:24s;animation-delay:-11s}
@keyframes orbP{0%{opacity:.7}50%{opacity:1;transform:scale(1.06) translate(16px,-12px)}100%{opacity:.8;transform:scale(.96) translate(-12px,8px)}}
.o1{transform-origin:center}
#gc,#nc,#pc{position:absolute;inset:0}
.scan{position:absolute;left:0;right:0;height:150px;pointer-events:none;animation:scanA 12s linear infinite}
@keyframes scanA{0%{top:-150px;opacity:0}5%{opacity:1}95%{opacity:1}100%{top:100vh;opacity:0}}
.grain{position:absolute;inset:0;opacity:.014;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px}

/* ── SCREENS ── */
.screen{position:fixed;inset:0;display:flex;flex-direction:column;z-index:10;transition:opacity .45s,transform .45s}
.screen.out{opacity:0;transform:translateY(12px);pointer-events:none}
.scenter{position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:20px;text-align:center;max-width:540px;margin:0 auto;width:100%}

/* ── LANDING ── */
.eyebrow{display:inline-flex;align-items:center;gap:7px;padding:5px 16px;border-radius:40px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);font-family:var(--fm);font-size:10px;color:var(--s3);letter-spacing:.14em;text-transform:uppercase;margin-bottom:18px;animation:fadeUp .8s .5s both}
.pdot{width:5px;height:5px;border-radius:50%;background:var(--teal);box-shadow:0 0 8px var(--teal);animation:blink 2s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
.land-h1{font-family:var(--fd);font-size:clamp(46px,10vw,92px);font-weight:300;letter-spacing:-.025em;line-height:.92;color:#fff;margin-bottom:12px;animation:fadeUp .8s .3s both}
.land-h1 em{font-style:italic;background:linear-gradient(160deg,rgba(255,255,255,.95),rgba(255,255,255,.4));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.land-tag{font-family:var(--fd);font-style:italic;font-size:clamp(13px,2vw,17px);font-weight:300;color:var(--s2);letter-spacing:.06em;margin-bottom:24px;animation:fadeUp .8s .45s both}
.land-desc{font-size:13px;color:var(--s1);line-height:1.9;max-width:390px;margin:0 auto 38px;animation:fadeUp .8s .6s both}
.land-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:40px;animation:fadeUp .8s .7s both}
.trust-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;animation:fadeUp .8s .8s both}
.tpill{font-family:var(--fm);font-size:10px;color:var(--s0);letter-spacing:.1em;padding:4px 12px;border-radius:20px;background:rgba(255,255,255,.018);border:1px solid rgba(255,255,255,.04)}
.enter-hint{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--s0);font-family:var(--fm);font-size:9px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;z-index:5;animation:hFloat 3s ease-in-out infinite}
.enter-line{width:1px;height:34px;background:linear-gradient(to bottom,transparent,var(--s0),transparent);animation:lDraw 2.4s ease-in-out infinite}
@keyframes hFloat{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(6px)}}
@keyframes lDraw{0%{transform:scaleY(0);transform-origin:top}45%{transform:scaleY(1);transform-origin:top}55%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:40px;font-family:var(--fb);font-size:13px;font-weight:500;border:none;cursor:pointer;transition:all .22s;white-space:nowrap}
.btn:disabled{opacity:.35;cursor:not-allowed}
.btn-w{background:#fff;color:var(--void);font-weight:600;box-shadow:0 4px 20px rgba(255,255,255,.1)}
.btn-w:not(:disabled):hover{background:var(--s6);box-shadow:0 8px 32px rgba(255,255,255,.18);transform:translateY(-1px)}
.btn-g{background:transparent;color:var(--s4);border:1px solid var(--b2)}
.btn-g:not(:disabled):hover{border-color:var(--b3);color:#fff;background:var(--b0)}
.btn-sm{padding:8px 18px;font-size:12px}
.btn-next{flex:1;padding:13px 20px;border-radius:40px;background:#fff;border:none;color:var(--void);font-family:var(--fb);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:7px}
.btn-next:not(:disabled):hover{background:var(--s6);box-shadow:0 4px 18px rgba(255,255,255,.14)}
.btn-next:disabled{opacity:.35;cursor:not-allowed}
.icon-btn{width:38px;height:38px;border-radius:12px;background:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;color:var(--void)}
.icon-btn:not(:disabled):hover{background:var(--s6);box-shadow:0 4px 14px rgba(255,255,255,.16)}
.icon-btn:disabled{opacity:.28;cursor:not-allowed}

/* ── ONBOARDING ── */
.onb-shell{width:100%;max-width:400px;background:var(--surface);border:1px solid var(--b1);border-radius:var(--rxl);overflow:hidden;box-shadow:0 1px 0 rgba(255,255,255,.03) inset,0 50px 100px rgba(0,0,0,.8);position:relative;z-index:5}
.onb-head{padding:28px 28px 0;text-align:center}
.onb-title{font-family:var(--fd);font-size:23px;font-weight:400;color:#fff;margin-bottom:6px}
.onb-sub{font-size:13px;color:var(--s2);line-height:1.7;margin-bottom:24px}
.onb-body{padding:0 24px 24px}
.pdots{display:flex;justify-content:center;gap:6px;margin-bottom:20px}
.pd{height:4px;border-radius:2px;background:var(--raised);transition:all .3s}
.pd.on{width:22px;background:#fff}
.pd.done{width:7px;background:var(--s1)}
.pd.off{width:7px}
.fl{margin-bottom:12px}
.fl-lbl{font-family:var(--fm);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--s1);margin-bottom:6px}
.fi{width:100%;padding:12px 14px;background:var(--raised);border:1px solid var(--b1);border-radius:var(--r);color:#fff;font-family:var(--fb);font-size:14px;outline:none;transition:all .2s}
.fi::placeholder{color:var(--s0)}
.fi:focus{border-color:var(--b3);background:rgba(255,255,255,.04);box-shadow:0 0 0 3px rgba(255,255,255,.04)}
.wlt-connect-card{padding:16px;background:rgba(0,229,200,.04);border:1px solid rgba(0,229,200,.14);border-radius:var(--rl);margin-bottom:16px;text-align:center}
.wlt-connect-icon{font-size:30px;margin-bottom:9px}
.wlt-connect-title{font-size:14px;font-weight:500;color:#fff;margin-bottom:3px}
.wlt-connect-sub{font-size:12px;color:var(--s2);line-height:1.55}
.wlt-addr-show{padding:11px 14px;background:var(--raised);border:1px solid rgba(0,229,200,.2);border-radius:var(--r);font-family:var(--fm);font-size:12px;color:var(--teal);text-align:center;margin-bottom:14px}

/* ══════════════════════════════════════════
   APP SHELL
══════════════════════════════════════════ */
#s-app{background:var(--abyss)}

/* Top bar */
.tbar{
  position:absolute;top:0;left:0;right:0;z-index:100;
  height:var(--tbar);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 16px;
  background:rgba(5,5,11,.92);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid var(--b1);
}
.tbl{display:flex;align-items:center;gap:10px}
.tbr{display:flex;align-items:center;gap:6px}
.tb-wordmark{font-family:var(--fd);font-size:19px;font-weight:300;font-style:italic;color:#fff;letter-spacing:.06em;line-height:1}
.coti-badge{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:20px;background:rgba(0,229,200,.07);border:1px solid rgba(0,229,200,.13);font-family:var(--fm);font-size:10px;color:var(--teal);letter-spacing:.07em}
.coti-dot{width:5px;height:5px;border-radius:50%;background:var(--teal);box-shadow:0 0 6px var(--teal);animation:blink 2s infinite}
.noet-chip{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:20px;background:var(--b0);border:1px solid var(--b1);font-family:var(--fm);font-size:11px;color:var(--s4)}
.wlt-btn{padding:5px 13px;border-radius:20px;background:transparent;border:1px solid var(--b2);color:var(--s3);font-family:var(--fb);font-size:11px;font-weight:500;cursor:pointer;transition:all .2s;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;position:relative}
.wlt-btn:hover{border-color:var(--b3);color:#fff}
.wlt-btn.on{border-color:rgba(0,229,200,.25);color:var(--teal);background:rgba(0,229,200,.05)}
.wlt-btn.on:hover{background:rgba(0,229,200,.1);border-color:rgba(0,229,200,.4)}
#wlt-dropdown{
  position:absolute;top:calc(100% + 8px);right:0;z-index:999;
  background:#0d0d18;border:1px solid rgba(255,255,255,.1);
  border-radius:14px;padding:6px;min-width:200px;
  box-shadow:0 20px 60px rgba(0,0,0,.8);
  display:none;
  animation:dropIn .18s cubic-bezier(.16,1,.3,1);
}
#wlt-dropdown.open{display:block}
@keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.wlt-dd-addr{
  padding:10px 12px;
  font-family:var(--fm);font-size:11px;color:rgba(0,229,200,.7);
  letter-spacing:.04em;border-bottom:1px solid rgba(255,255,255,.07);
  margin-bottom:4px;display:flex;align-items:center;gap:7px;
}
.wlt-dd-dot{width:6px;height:6px;border-radius:50%;background:#00e5c8;box-shadow:0 0 6px #00e5c8;flex-shrink:0}
.wlt-dd-btn{
  width:100%;padding:9px 12px;
  background:none;border:none;
  font-family:var(--fb);font-size:12px;font-weight:500;
  border-radius:9px;cursor:pointer;
  display:flex;align-items:center;gap:8px;
  transition:background .15s;text-align:left;
}
.wlt-dd-btn:hover{background:rgba(255,255,255,.05)}
.wlt-dd-btn.danger{color:#f87171}
.wlt-dd-btn.danger:hover{background:rgba(248,113,113,.08)}
.wlt-dd-btn.info{color:var(--s3)}
.wlt-dd-icon{width:14px;height:14px;opacity:.6}

/* Wallet gate */
.gate{position:absolute;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(2,2,6,.94);backdrop-filter:blur(16px)}
.gate-card{width:100%;max-width:340px;background:var(--surface);border:1px solid var(--b2);border-radius:var(--rxl);padding:28px;text-align:center;box-shadow:0 50px 100px rgba(0,0,0,.8)}
.gate-title{font-family:var(--fd);font-size:22px;font-weight:400;color:#fff;margin-bottom:7px}
.gate-sub{font-size:13px;color:var(--s2);line-height:1.7;margin-bottom:20px}
.gate-steps{display:flex;flex-direction:column;gap:7px;margin-bottom:20px;text-align:left}
.gate-step{display:flex;align-items:flex-start;gap:9px;padding:9px 11px;background:var(--raised);border:1px solid var(--b1);border-radius:var(--r)}
.gs-n{font-family:var(--fm);font-size:11px;color:var(--teal);flex-shrink:0;margin-top:1px}
.gs-t{font-size:12px;color:var(--s2);line-height:1.5}
.gate-enc{display:flex;align-items:center;justify-content:center;gap:5px;font-family:var(--fm);font-size:10px;color:var(--s0);letter-spacing:.07em;margin-top:12px}

/* Bottom nav */
.bbar{
  position:absolute;bottom:0;left:0;right:0;z-index:100;
  padding:8px 12px calc(8px + var(--safe-bot));
  background:linear-gradient(to top,rgba(5,5,11,.98) 60%,rgba(5,5,11,.85) 80%,transparent 100%);
}
.nav-in{max-width:360px;margin:0 auto;display:flex;align-items:center;background:rgba(255,255,255,.028);border:1px solid var(--b1);border-radius:22px;padding:5px;backdrop-filter:blur(20px)}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;border-radius:15px;background:none;border:none;cursor:pointer;color:var(--s1);font-family:var(--fb);font-size:10px;font-weight:500;letter-spacing:.01em;transition:all .22s;position:relative;-webkit-tap-highlight-color:transparent}
.nb svg{width:18px;height:18px;transition:all .22s}
.nb.on{color:#fff;background:rgba(255,255,255,.065)}
.nb.on svg{filter:drop-shadow(0 0 4px rgba(255,255,255,.36))}
.nb.on::after{content:'';position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:#fff;box-shadow:0 0 5px rgba(255,255,255,.6)}

/* Tabs */
.tab{
  display:none;
  position:absolute;
  top:var(--tbar);
  left:0;right:0;bottom:0;
  overflow:hidden;
  z-index:10;
}
.tab.on{
  display:flex;
  flex-direction:column;
  z-index:20;
}
.tscroll{
  flex:1;
  overflow-y:auto;
  -webkit-overflow-scrolling:touch;
  padding:16px;
  padding-bottom:calc(16px + var(--bbar));
  max-width:600px;
  width:100%;
  margin:0 auto;
}
.tscroll::-webkit-scrollbar{width:2px}

/* ── SPLASH SCREEN ── */
#splash{
  position:fixed;inset:0;z-index:9999;
  background:#020206;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  transition:opacity .6s ease, transform .6s ease;
}
#splash.hide{opacity:0;transform:scale(1.04);pointer-events:none}
.splash-logo-wrap{
  position:relative;
  width:140px;height:140px;
  display:flex;align-items:center;justify-content:center;
  animation:splashPulse 2s ease-in-out infinite;
}
.splash-ring{
  position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.06);
  animation:splashRing 2.4s ease-in-out infinite;
}
.splash-ring:nth-child(1){width:140px;height:140px;animation-delay:0s}
.splash-ring:nth-child(2){width:110px;height:110px;animation-delay:.3s;border-color:rgba(255,255,255,.04)}
.splash-ring:nth-child(3){width:80px;height:80px;animation-delay:.6s;border-color:rgba(0,229,200,.08)}
@keyframes splashRing{
  0%{transform:scale(1);opacity:.4}
  50%{transform:scale(1.06);opacity:1}
  100%{transform:scale(1);opacity:.4}
}
.splash-logo{
  width:72px;height:auto;
  mix-blend-mode:screen;filter:brightness(1.2) contrast(1.05);
  animation:splashLogoIn 1.2s cubic-bezier(.16,1,.3,1) both;
  animation-delay:.2s;
  opacity:0;
}
@keyframes splashLogoIn{
  0%{opacity:0;transform:scale(.7);filter:brightness(3) blur(8px)}
  60%{opacity:1;filter:brightness(1.4) blur(0);transform:scale(1.06)}
  100%{opacity:1;filter:brightness(1.2) contrast(1.05);transform:scale(1)}
}
@keyframes splashPulse{
  0%,100%{transform:scale(1)}
  50%{transform:scale(1.02)}
}
.splash-name{
  font-family:'Cormorant Garamond',Georgia,serif;
  font-size:28px;font-weight:300;letter-spacing:.18em;
  color:#fff;margin-top:28px;
  animation:splashNameIn 1s ease both;animation-delay:.6s;opacity:0;
}
@keyframes splashNameIn{
  from{opacity:0;transform:translateY(10px);letter-spacing:.32em}
  to{opacity:1;transform:none;letter-spacing:.18em}
}
.splash-tag{
  font-family:'DM Mono',monospace;
  font-size:10px;letter-spacing:.16em;text-transform:uppercase;
  color:rgba(0,229,200,.5);margin-top:8px;
  animation:splashNameIn 1s ease both;animation-delay:.85s;opacity:0;
}
.splash-line{
  width:1px;height:40px;
  background:linear-gradient(to bottom,transparent,rgba(255,255,255,.15),transparent);
  margin-top:28px;
  animation:splashLine 1s ease both;animation-delay:1.1s;opacity:0;
}
@keyframes splashLine{
  from{opacity:0;height:0}
  to{opacity:1;height:40px}
}

/* ══════════════════════════════════════════
   CHAT — Premium redesign
══════════════════════════════════════════ */
#t-chat.on{flex-direction:column;background:var(--abyss);padding-bottom:calc(var(--bbar) + var(--safe-bot))}

/* AI identity header */
.chat-id-bar{
  flex-shrink:0;
  padding:10px 16px;
  max-width:680px;width:100%;margin:0 auto;
  position:relative;z-index:1;
}
.chat-id-inner{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 14px;
  background:var(--surface);
  border:1px solid var(--b1);
  border-radius:14px;
}
.ai-identity{display:flex;align-items:center;gap:10px}
.ai-avatar{
  width:36px;height:36px;border-radius:11px;flex-shrink:0;
  background:#000;
  border:1px solid var(--b2);
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;position:relative;
}
.ai-avatar img{width:28px;height:auto;mix-blend-mode:screen;filter:brightness(1.2) contrast(1.1)}
.ai-meta{}
.ai-name{font-size:13px;font-weight:500;color:#fff;line-height:1.2}
.ai-status{font-size:10px;color:var(--teal);font-family:var(--fm);letter-spacing:.04em;margin-top:1px}
.chat-enc-pill{
  display:flex;align-items:center;gap:4px;
  padding:4px 10px;border-radius:20px;
  background:rgba(0,229,200,.06);border:1px solid rgba(0,229,200,.13);
  font-family:var(--fm);font-size:9px;color:var(--teal);letter-spacing:.06em;
  white-space:nowrap;
}

/* Messages area */
.msgs-outer{
  flex:1;
  overflow-y:auto;
  overflow-x:hidden;
  -webkit-overflow-scrolling:touch;
  scroll-behavior:smooth;
  position:relative;z-index:1;
}
.msgs-outer::-webkit-scrollbar{width:0}
.msgs-inner{
  padding:8px 16px 12px;
  max-width:680px;width:100%;margin:0 auto;
  display:flex;flex-direction:column;gap:16px;
  min-height:100%;
}

/* Date divider */
.date-div{
  display:flex;align-items:center;gap:10px;
  font-family:var(--fm);font-size:10px;color:var(--s1);letter-spacing:.08em;
  text-transform:uppercase;margin:4px 0;
}
.date-div::before,.date-div::after{content:'';flex:1;height:1px;background:var(--b1)}

/* Message row */
.mrow{display:flex;gap:8px;align-items:flex-end;max-width:100%}
.mrow.u{flex-direction:row-reverse}

/* Avatar */
.mav{
  width:30px;height:30px;flex-shrink:0;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;align-self:flex-end;
}
.mav.ai{
  background:#000;
  border:1px solid var(--b2);
}
.mav.ai img{width:22px;height:auto;mix-blend-mode:screen;filter:brightness(1.2) contrast(1.1);border:1px solid rgba(255,255,255,.18);
  font-family:var(--fd);font-weight:400;font-size:14px;color:rgba(255,255,255,.7);
}

/* Bubble */
.mbody{display:flex;flex-direction:column;gap:3px;max-width:min(78%, 480px)}
.mb{
  padding:11px 15px;
  font-size:14px;line-height:1.72;
  white-space:pre-wrap;word-break:break-word;
}
.mb.ai{
  background:var(--raised);
  border:1px solid var(--b1);
  border-radius:16px 16px 16px 4px;
  color:var(--s5);
}
.mb.u{
  background:rgba(255,255,255,.09);
  border:1px solid rgba(255,255,255,.11);
  border-radius:16px 16px 4px 16px;
  color:var(--s6);
}
.mmeta{
  display:flex;align-items:center;gap:5px;
  font-size:10px;color:var(--s0);font-family:var(--fm);
  padding:0 3px;
}
.mrow.u .mmeta{justify-content:flex-end}
.enc-tag{color:rgba(0,229,200,.38)}

/* Typing indicator */
.typing-bub{
  padding:12px 16px;
  background:var(--raised);border:1px solid var(--b1);
  border-radius:16px 16px 16px 4px;
  display:inline-flex;align-items:center;gap:5px;
}
.td{width:5px;height:5px;border-radius:50%;background:var(--s1);animation:tdB 1.4s ease-in-out infinite}
.td:nth-child(2){animation-delay:.22s}.td:nth-child(3){animation-delay:.44s}
@keyframes tdB{0%,60%,100%{transform:translateY(0);opacity:.3}30%{transform:translateY(-6px);opacity:1}}

/* Quick prompts */
.qps-wrap{
  flex-shrink:0;
  padding:0 16px 8px;
  max-width:680px;width:100%;margin:0 auto;
  position:relative;z-index:1;
}
.qps{
  display:flex;gap:6px;
  overflow-x:auto;padding-bottom:2px;
  scrollbar-width:none;-webkit-overflow-scrolling:touch;
}
.qps::-webkit-scrollbar{display:none}
.qp{
  flex-shrink:0;padding:7px 14px;border-radius:20px;
  background:rgba(255,255,255,.05);border:1px solid var(--b1);
  color:var(--s3);font-size:12px;cursor:pointer;
  white-space:nowrap;transition:all .18s;font-family:var(--fb);
  -webkit-tap-highlight-color:transparent;
}
.qp:hover,.qp:active{border-color:var(--b2);color:#fff;background:rgba(255,255,255,.09)}

/* Composer */
.composer-wrap{
  flex-shrink:0;
  padding:6px 16px 8px;
  max-width:680px;width:100%;margin:0 auto;
  position:relative;z-index:1;
}
.composer{
  display:flex;align-items:flex-end;gap:10px;
  background:var(--surface);
  border:1px solid var(--b2);border-radius:20px;
  padding:10px 10px 10px 16px;
  transition:border-color .2s,box-shadow .2s;
}
.composer:focus-within{
  border-color:var(--b3);
  box-shadow:0 0 0 3px rgba(255,255,255,.04);
}
.composer-ta{
  flex:1;background:none;border:none;outline:none;
  color:#fff;font-family:var(--fb);font-size:14px;line-height:1.55;
  resize:none;min-height:22px;max-height:110px;
  -webkit-appearance:none;
}
.composer-ta::placeholder{color:var(--s0)}
.send-btn{
  width:38px;height:38px;border-radius:12px;
  background:#fff;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:all .2s;color:var(--void);
  -webkit-tap-highlight-color:transparent;
}
.send-btn:not(:disabled):hover{background:var(--s6);box-shadow:0 4px 14px rgba(255,255,255,.16)}
.send-btn:disabled{opacity:.26;cursor:not-allowed}
.composer-foot{
  text-align:center;font-family:var(--fm);font-size:9px;
  color:var(--s0);letter-spacing:.09em;
  margin-top:5px;
}

/* Crisis */
.crisis-banner{
  margin:0 16px 8px;max-width:680px;width:calc(100% - 32px);align-self:center;
  padding:12px 14px;background:rgba(180,40,40,.12);
  border:1px solid rgba(220,80,80,.24);border-radius:var(--rl);
}
.crisis-banner h4{font-size:13px;color:#f87171;margin-bottom:3px}
.crisis-banner p{font-size:12px;color:rgba(255,255,255,.5);line-height:1.6}

/* ── OTHER TABS ── */
.sh1{font-family:var(--fd);font-size:25px;font-weight:400;color:#fff;margin-bottom:3px}
.sh2{font-size:11px;color:var(--s0);font-family:var(--fm);margin-bottom:18px;display:flex;align-items:center;gap:6px}
.card{background:var(--surface);border:1px solid var(--b1);border-radius:var(--rl);overflow:hidden;margin-bottom:14px;transition:border-color .18s}
.card:hover{border-color:var(--b2)}
.cp{padding:16px}
.slbl{font-family:var(--fm);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--s0);margin-bottom:10px}
.sg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.sc{padding:13px;background:var(--raised);border:1px solid var(--b1);border-radius:var(--r);text-align:center}
.sv{font-family:var(--fd);font-size:24px;font-weight:400;color:#fff;line-height:1;margin-bottom:4px}
.sl{font-size:10px;color:var(--s0);font-family:var(--fm);letter-spacing:.06em}
.ch{height:80px;display:flex;align-items:flex-end;gap:3px;padding:0 2px}
.cb{flex:1;border-radius:3px 3px 0 0;background:var(--raised);transition:height .4s;cursor:pointer;position:relative;min-height:4px}
.cb.f{background:linear-gradient(to top,rgba(0,229,200,.22),rgba(0,229,200,.05))}
.cb:hover::after{content:attr(data-v);position:absolute;top:-16px;left:50%;transform:translateX(-50%);font-size:9px;color:var(--s4);font-family:var(--fm);white-space:nowrap}
.mg{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:14px}
.mo{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:var(--r);background:var(--raised);border:1px solid var(--b1);cursor:pointer;transition:all .18s;font-size:22px;-webkit-tap-highlight-color:transparent}
.mo span{font-size:10px;color:var(--s0);font-family:var(--fb)}
.mo:hover,.mo:active{transform:translateY(-3px);border-color:var(--b2)}
.mo.sel{transform:translateY(-3px);border-color:var(--b3);background:rgba(255,255,255,.055);box-shadow:0 6px 20px rgba(0,0,0,.4)}
.etags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.et{padding:5px 11px;border-radius:20px;background:var(--raised);border:1px solid var(--b1);color:var(--s2);font-size:11px;cursor:pointer;transition:all .14s;font-family:var(--fb);-webkit-tap-highlight-color:transparent}
.et:hover,.et:active{border-color:var(--b2);color:#fff}
.et.on{background:var(--b1);border-color:var(--b2);color:#fff}
.sk-row{display:flex;align-items:center;justify-content:space-between;padding:15px 16px;background:linear-gradient(135deg,var(--b0),rgba(0,0,0,.1));border:1px solid var(--b1);border-radius:var(--rl);margin-bottom:14px}
.sk-l{display:flex;align-items:center;gap:11px}
.flame{font-size:28px;animation:flicker .8s ease-in-out infinite alternate}
@keyframes flicker{from{transform:scale(1)rotate(-1deg)}to{transform:scale(1.07)rotate(1deg)}}
.sn{font-family:var(--fd);font-size:28px;font-weight:300;color:#fff;line-height:1}
.slb{font-size:11px;color:var(--s0);margin-top:2px}
.sr-right{text-align:right}
.srw{font-family:var(--fm);font-size:11px;color:var(--gold);padding:4px 10px;border-radius:12px;background:rgba(255,210,50,.05);border:1px solid rgba(255,210,50,.1)}
.prom-card{padding:13px 15px;margin-bottom:14px;background:rgba(255,255,255,.018);border:1px solid var(--b1);border-left:2px solid var(--s1);border-radius:0 var(--r) var(--r) 0;cursor:pointer;transition:border-left-color .18s}
.prom-card:hover{border-left-color:#fff}
.prom-lbl{font-family:var(--fm);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--s0);margin-bottom:6px}
.prom-txt{font-family:var(--fd);font-size:15px;font-style:italic;color:var(--s3);line-height:1.5}
.jta{width:100%;min-height:160px;background:var(--raised);border:1px solid var(--b1);border-radius:var(--r);padding:14px;color:#fff;font-family:var(--fb);font-size:14px;line-height:1.8;outline:none;resize:none;transition:all .18s;margin-bottom:8px;-webkit-appearance:none}
.jta::placeholder{color:var(--s0)}
.jta:focus{border-color:var(--b2);box-shadow:0 0 0 3px var(--b0)}
.wc-row{display:flex;align-items:center;justify-content:space-between;font-family:var(--fm);font-size:10px;color:var(--s0);margin-bottom:12px}
.enc-live{display:flex;align-items:center;gap:4px;color:rgba(0,229,200,.4)}
.enc-d{width:4px;height:4px;border-radius:50%;background:var(--teal);opacity:.4;animation:blink 1.5s infinite}
.ei{padding:14px 15px;cursor:pointer;transition:background .16s;-webkit-tap-highlight-color:transparent}
.ei:hover{background:rgba(255,255,255,.016)}
.ei+.ei{border-top:1px solid var(--b1)}
.edate{font-family:var(--fm);font-size:10px;color:var(--s0);letter-spacing:.06em;margin-bottom:5px}
.eprev{font-size:13px;color:var(--s3);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.echips{display:flex;gap:5px;margin-top:6px}
.chip{font-size:10px;padding:2px 7px;border-radius:10px;background:var(--b0);border:1px solid var(--b1);color:var(--s0)}
.chip.t{color:rgba(0,229,200,.5);border-color:rgba(0,229,200,.12)}
.bal-hero{padding:28px 24px;text-align:center;background:var(--raised);border:1px solid var(--b1);border-radius:var(--rxl);margin-bottom:14px;position:relative;overflow:hidden}
.bal-hero::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,200,.04),transparent 65%);pointer-events:none}
.bal-lbl{font-family:var(--fm);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--s0);margin-bottom:10px}
.bal-num{font-family:var(--fd);font-size:56px;font-weight:300;color:#fff;line-height:1;margin-bottom:4px}
.bal-sym{font-family:var(--fm);font-size:11px;color:var(--teal);letter-spacing:.12em;margin-bottom:22px;opacity:.6}
.bal-stats{display:flex;align-items:center;justify-content:center;gap:0;background:rgba(255,255,255,.03);border:1px solid var(--b1);border-radius:14px;overflow:hidden;margin-bottom:16px}
.bal-stat{flex:1;padding:13px 8px;text-align:center}
.bal-stat-div{width:1px;background:var(--b1);height:36px;flex-shrink:0}
.bal-stat-val{font-family:var(--fd);font-size:22px;font-weight:400;color:#fff;line-height:1;margin-bottom:3px}
.bal-stat-lbl{font-family:var(--fm);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--s0)}
.bal-addr{margin-top:4px}
.bal-addr-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:20px;background:rgba(0,229,200,.06);border:1px solid rgba(0,229,200,.14);font-family:var(--fm);font-size:11px;color:var(--teal);letter-spacing:.04em}
.er{display:flex;align-items:center;justify-content:space-between;padding:12px 15px;border-bottom:1px solid var(--b1)}
.er:last-child{border-bottom:none}
.erl{display:flex;align-items:center;gap:10px}
.eico{width:32px;height:32px;border-radius:10px;background:var(--raised);border:1px solid var(--b1);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.en{font-size:13px;color:var(--s4)}
.ed{font-size:11px;color:var(--s0);margin-top:1px}
.ea{font-family:var(--fm);font-size:12px;color:rgba(180,220,150,.8);padding:4px 9px;border-radius:12px;background:rgba(180,220,150,.05);border:1px solid rgba(180,220,150,.1);white-space:nowrap}
.mg2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
.mc{padding:13px;border-radius:var(--r);background:var(--raised);border:1px solid var(--b1);transition:all .18s}
.mc.done{border-color:rgba(0,229,200,.18);background:rgba(0,229,200,.03)}
.mc:hover{border-color:var(--b2)}
.mci{font-size:18px;margin-bottom:5px}
.mcn{font-size:12px;color:var(--s4);font-weight:500;margin-bottom:2px}
.mcd{font-size:10px;color:var(--s0)}
.mct{font-family:var(--fm);font-size:11px;color:rgba(180,220,150,.6);margin-top:4px}
.mck2{font-size:10px;color:var(--teal);font-family:var(--fm);margin-top:3px}
.tx{display:flex;align-items:center;justify-content:space-between;padding:11px 15px;border-bottom:1px solid var(--b1)}
.tx:last-child{border-bottom:none}
.txl{display:flex;align-items:center;gap:9px}
.txd{width:6px;height:6px;border-radius:50%;background:rgba(0,229,200,.5);box-shadow:0 0 4px rgba(0,229,200,.3);flex-shrink:0}
.txn{font-size:12px;color:var(--s3)}
.txh{font-size:10px;color:var(--s0);font-family:var(--fm)}
.txa{font-family:var(--fm);font-size:12px;color:rgba(180,220,150,.8);white-space:nowrap}

/* ── ENC FLASH + TOAST + OVERLAYS ── */
#ef{position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity .28s}
#ef.on{opacity:1}
.ef-in{padding:16px 24px;text-align:center;background:rgba(5,5,11,.97);border:1px solid rgba(0,229,200,.22);border-radius:var(--rl);backdrop-filter:blur(24px)}
.ef-lbl{font-family:var(--fm);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--teal);margin-bottom:8px;display:flex;align-items:center;gap:6px;justify-content:center}
.ef-c{font-family:var(--fm);font-size:11px;color:rgba(0,229,200,.36)}
.ef-b{height:1px;background:rgba(255,255,255,.04);margin-top:10px;overflow:hidden;border-radius:1px}
.ef-f{height:100%;background:linear-gradient(90deg,var(--teal),rgba(0,229,200,.3));width:0;transition:width .72s}
#toasts{position:fixed;top:calc(var(--tbar) + 10px);left:50%;transform:translateX(-50%);z-index:9999;width:calc(100% - 24px);max-width:360px;display:flex;flex-direction:column;gap:6px;pointer-events:none}
.tst{padding:10px 14px;border-radius:var(--r);background:rgba(9,9,15,.98);border:1px solid var(--b2);font-size:13px;color:var(--s4);display:flex;align-items:center;gap:8px;backdrop-filter:blur(20px);box-shadow:0 6px 24px rgba(0,0,0,.5);animation:tIn .3s ease,tOut .3s ease 2.7s forwards}
.tst.ok{border-color:rgba(0,229,200,.2)}.tst.err{border-color:rgba(200,60,60,.2)}.tst.warn{border-color:rgba(255,180,50,.2)}
@keyframes tIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
@keyframes tOut{to{opacity:0;transform:translateY(-8px)}}
.ov{display:none;position:fixed;inset:0;z-index:200;background:rgba(2,2,6,.94);backdrop-filter:blur(12px);align-items:center;justify-content:center;padding:20px}
.ov.open{display:flex}
.ovc{width:100%;max-width:400px;background:var(--surface);border:1px solid var(--b2);border-radius:var(--rxl);padding:24px;box-shadow:0 50px 100px rgba(0,0,0,.8);position:relative;max-height:85vh;overflow-y:auto}
.ovc::-webkit-scrollbar{width:2px}
.ov-title{font-family:var(--fd);font-size:21px;font-weight:400;color:#fff;margin-bottom:7px}
.ov-sub{font-size:13px;color:var(--s2);line-height:1.65;margin-bottom:18px}
.ov-close{position:absolute;top:16px;right:16px;background:none;border:none;color:var(--s1);font-size:20px;cursor:pointer;line-height:1;padding:4px}

/* Mobile adjustments */
@media (max-width:480px){
  :root{--tbar:52px;--bbar:68px}
  .tb-wordmark{font-size:17px}
  .coti-badge{display:none}
  .msgs-inner{padding:6px 12px 10px}
  .chat-id-bar{padding:8px 12px}
  .qps-wrap{padding:0 12px 6px}
  .composer-wrap{padding:4px 12px 4px}
  .mb{font-size:13.5px;padding:10px 13px}
  .mbody{max-width:min(85%,360px)}
  .tscroll{padding:14px 12px}
}
@media (max-width:360px){
  .noet-chip{display:none}
}
</style>

<!-- SPLASH SCREEN -->
<div id="splash">
  <div class="splash-logo-wrap">
    <div class="splash-ring"></div>
    <div class="splash-ring"></div>
    <div class="splash-ring"></div>
    <img class="splash-logo" id="splash-logo" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAQDAwQDAwQEAwQFBAQFBgoHBgYGBg0JCggKDw0QEA8NDw4RExgUERIXEg4PFRwVFxkZGxsbEBQdHx0aHxgaGxr/2wBDAQQFBQYFBgwHBwwaEQ8RGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhr/wgARCANVBQADASIAAhEBAxEB/8QAHAABAQACAwEBAAAAAAAAAAAAAAgGBwEEBQMC/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhADEAAAAdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA54ICgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABtU1Upn9EyKb4JlU1yTIprkmRTf5JmUNpU8MAAAABkW8CbVNfomNTYmRTfBMqh9EHngAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEIMAAAEAAAAAMIIIMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAQkAAAAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAUAAAIoAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAIgAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoIAAAAAAA0AgoAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgQAQAgIgAAAAAAAAAwQg0AwgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAoAw84MAAAAQIAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAoAAkwQwAAAAEAAAAUAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAQgQwcIAAAsAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAUMgIAEIAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEMAAAAEMIIkAAAgcMAgIAQkU8QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAQAAAAQsAAAwUEEQEIMMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoUAAAAAgYoIQMwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAAwgsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAoAAkAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAgAAUAAAAAAYgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkIEMMoAAAQAMEIUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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" alt="N"/>
  </div>
  <div class="splash-name">NOETICA</div>
  <div class="splash-tag">The Private Science of Your Mind</div>
  <div class="splash-line"></div>
</div>

<!-- BACKGROUND -->
<div id="bg">
  <div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div>
  <canvas id="gc"></canvas><canvas id="nc"></canvas><canvas id="pc"></canvas>
  <div class="scan" style="background:linear-gradient(to bottom,transparent,rgba(0,229,200,.016),transparent)"></div>
  <div class="grain"></div>
</div>

<!-- Encrypt flash -->
<div id="ef"><div class="ef-in"><div class="ef-lbl">⬡ Encrypting</div><div class="ef-c" id="ef-c">████████████</div><div class="ef-b"><div class="ef-f" id="ef-f"></div></div></div></div>

<!-- Toasts -->
<div id="toasts"></div>

<!-- ══ LANDING ══ -->
<div class="screen" id="s-land">
  <div class="scenter">
    <div class="eyebrow"><span class="pdot"></span>COTI Network · Private AI</div>
    <h1 class="land-h1"><em>NOETICA</em></h1>
    <p class="land-tag" style="animation:fadeUp .8s .45s both">The Private Science of Your Mind</p>
    <p class="land-desc" style="animation:fadeUp .8s .6s both">The first AI mental companion that truly never exposes your thoughts. Encrypted before it leaves your device. Rewarded on COTI Network.</p>
    <div class="land-btns">
      <button class="btn btn-w" onclick="UI.goto('s-onb')">Begin <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
    </div>
    <div class="trust-row">
      <span class="tpill">AES-256-GCM</span>
      <span class="tpill">COTI Network</span>
      <span class="tpill">Zero-Knowledge</span>
      <span class="tpill">On-chain Rewards</span>
    </div>
  </div>
  <div class="enter-hint" onclick="UI.goto('s-onb')"><div class="enter-line"></div>Enter</div>
</div>

<!-- ══ ONBOARDING ══ -->
<div class="screen out" id="s-onb">
  <button onclick="UI.goto('s-land')" style="position:absolute;top:16px;left:16px;z-index:10;background:none;border:1px solid var(--b1);border-radius:20px;color:var(--s2);font-family:var(--fb);font-size:12px;padding:7px 14px;cursor:pointer">← Back</button>
  <div style="position:relative;z-index:5;display:flex;align-items:center;justify-content:center;flex:1;padding:20px">
  <div class="onb-shell">
    <div id="st1">
      <div class="onb-head">
        <div class="onb-title">Welcome</div>
        <div class="onb-sub">Your private sanctuary. What should I call you?</div>
      </div>
      <div class="onb-body">
        <div class="pdots"><div class="pd on"></div><div class="pd off"></div></div>
        <div class="fl"><div class="fl-lbl">Your name</div><input class="fi" id="inp-name" type="text" placeholder="Enter your name..." autocomplete="off" oninput="ONB.check()" onkeydown="if(event.key==='Enter')ONB.next1()"/></div>
        <div style="font-size:11px;color:var(--s0);line-height:1.65;margin-bottom:16px">No email. No account. Your wallet is your identity.</div>
        <button class="btn-next" id="st1-btn" onclick="ONB.next1()" disabled>Continue <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
      </div>
    </div>
    <div id="st2" style="display:none">
      <div class="onb-head">
        <div class="onb-title">Connect Wallet</div>
        <div class="onb-sub">Your wallet is your key. Connect once — always recognized.</div>
      </div>
      <div class="onb-body">
        <div class="pdots"><div class="pd done"></div><div class="pd on"></div></div>
        <div class="wlt-connect-card" id="wlt-connect-card">
          <div class="wlt-connect-icon">🔐</div>
          <div class="wlt-connect-title">Connect your wallet</div>
          <div class="wlt-connect-sub">Data encrypted using your wallet signature — only you can unlock it</div>
        </div>
        <div id="wlt-addr-wrap" style="display:none"><div class="wlt-addr-show" id="wlt-addr-disp"></div></div>
        <div style="display:flex;gap:8px">
          <button style="padding:11px 16px;border-radius:40px;background:transparent;border:1px solid var(--b1);color:var(--s3);font-family:var(--fb);font-size:13px;cursor:pointer" onclick="ONB.back1()">← Back</button>
          <button class="btn-next" id="st2-btn" onclick="ONB.handleEnterBtn()">Connect Wallet <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
        </div>
      </div>
    </div>
  </div>
  </div>
</div>

<!-- ══ APP ══ -->
<div class="screen out" id="s-app">

  <!-- Topbar -->
  <div class="tbar">
    <div class="tbl">
      <span class="tb-wordmark">NOETICA</span>
      <div class="coti-badge"><div class="coti-dot"></div>COTI Network</div>
    </div>
    <div class="tbr">
      <div class="noet-chip">◈ <span id="top-bal">0</span> <span style="color:var(--s0)">NOET</span></div>
      <div style="position:relative">
      <button class="wlt-btn" id="wlt-btn" onclick="APP.wltBtnClick()">Connect Wallet</button>
      <div id="wlt-dropdown">
        <div class="wlt-dd-addr"><div class="wlt-dd-dot"></div><span id="wlt-dd-addr-txt">—</span></div>
        <button class="wlt-dd-btn info" onclick="APP.copyAddr()">
          <svg class="wlt-dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy Address
        </button>
        <button class="wlt-dd-btn info" onclick="APP.viewExplorer()">
          <svg class="wlt-dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          View on Explorer
        </button>
        <button class="wlt-dd-btn danger" onclick="APP.disconnect()">
          <svg class="wlt-dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Disconnect
        </button>
      </div>
    </div>
    </div>
  </div>

  <!-- ─── CHAT TAB ─── -->
  <div class="tab on" id="t-chat">

    <!-- Wallet gate -->
    <div class="gate" id="chat-gate" style="display:none">
      <div class="gate-card">
        <div class="gate-title">Connect to Continue</div>
        <div class="gate-sub">Connect your wallet to interact with NOETICA and receive rewards on COTI Network.</div>
        <div class="gate-steps">
          <div class="gate-step"><span class="gs-n">01</span><span class="gs-t">Connect wallet — network configured automatically</span></div>
          <div class="gate-step"><span class="gs-n">02</span><span class="gs-t">Conversations encrypted end-to-end on your device</span></div>
          <div class="gate-step"><span class="gs-n">03</span><span class="gs-t">Rewards recorded on COTI Network automatically</span></div>
        </div>
        <button class="btn btn-w" style="width:100%;justify-content:center" onclick="APP.connectWallet()">Connect Wallet <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
        <div class="gate-enc"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>AES-256-GCM · Encrypted client-side</div>
      </div>
    </div>

    <!-- AI identity bar -->
    <div class="chat-id-bar">
      <div class="chat-id-inner">
        <div class="ai-identity">
          <div class="ai-avatar">
            <img id="ai-av-img" alt="N"/>
            <div class="ai-live-ring"></div>
          </div>
          <div class="ai-meta">
            <div class="ai-name">NOETICA Intelligence</div>
            <div class="ai-status">Active · Neural Core · COTI Network</div>
          </div>
        </div>
        <div class="chat-enc-pill">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          E2E ENCRYPTED
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="msgs-outer" id="msgs-outer">
      <div class="msgs-inner" id="msgs"></div>
    </div>

    <!-- Quick prompts -->
    <div class="qps-wrap" id="qps-wrap">
      <div class="qps" id="qps">
        <button class="qp" onclick="CHAT.quick(this)">I feel anxious today</button>
        <button class="qp" onclick="CHAT.quick(this)">Help me process my thoughts</button>
        <button class="qp" onclick="CHAT.quick(this)">I need to vent</button>
        <button class="qp" onclick="CHAT.quick(this)">I feel overwhelmed</button>
        <button class="qp" onclick="CHAT.quick(this)">I had a hard day</button>
      </div>
    </div>

    <!-- Composer -->
    <div class="composer-wrap">
      <div class="composer" id="composer">
        <textarea class="composer-ta" id="ci" placeholder="Share what's on your mind..." rows="1"
          onkeydown="CHAT.kd(event)" oninput="CHAT.resize(this)"></textarea>
        <button class="send-btn" id="sbtn" onclick="CHAT.send()" disabled>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
        </button>
      </div>
      <div class="composer-foot">AES-256-GCM · Zero-knowledge · NOETICA</div>
    </div>

  </div>

  <!-- ─── MOOD TAB ─── -->
  <div class="tab" id="t-mood">
    <div class="tscroll">
      <div class="sh1">Mood</div>
      <div class="sh2"><span style="color:var(--teal)">⬡</span>Encrypted · Private analytics</div>
      <div class="sg"><div class="sc"><div class="sv" id="m-avg">—</div><div class="sl">avg score</div></div><div class="sc"><div class="sv" id="m-cnt">0</div><div class="sl">total logs</div></div><div class="sc"><div class="sv" id="m-trend">—</div><div class="sl">trend</div></div></div>
      <div class="card"><div class="cp"><div class="slbl">14-day journey</div><div class="ch" id="mood-ch"></div><div style="display:flex;justify-content:space-between;margin-top:4px;font-size:10px;color:var(--s0);font-family:var(--fm)"><span id="ch-s">—</span><span>Today</span></div></div></div>
      <div class="card" style="padding:16px" id="checkin-card">
        <div class="slbl">How are you right now?</div>
        <div class="mg"><div class="mo" data-score="10" data-label="Radiant" onclick="MOOD.sel(this)">😄<span>Radiant</span></div><div class="mo" data-score="7.5" data-label="Good" onclick="MOOD.sel(this)">🙂<span>Good</span></div><div class="mo" data-score="5" data-label="Neutral" onclick="MOOD.sel(this)">😐<span>Neutral</span></div><div class="mo" data-score="2.5" data-label="Low" onclick="MOOD.sel(this)">😔<span>Low</span></div><div class="mo" data-score="1" data-label="Rough" onclick="MOOD.sel(this)">😩<span>Rough</span></div></div>
        <div class="slbl">Emotions present</div>
        <div class="etags"><div class="et" onclick="MOOD.tag(this)">Calm</div><div class="et" onclick="MOOD.tag(this)">Anxious</div><div class="et" onclick="MOOD.tag(this)">Grateful</div><div class="et" onclick="MOOD.tag(this)">Tired</div><div class="et" onclick="MOOD.tag(this)">Hopeful</div><div class="et" onclick="MOOD.tag(this)">Frustrated</div><div class="et" onclick="MOOD.tag(this)">Lonely</div><div class="et" onclick="MOOD.tag(this)">Content</div><div class="et" onclick="MOOD.tag(this)">Energized</div><div class="et" onclick="MOOD.tag(this)">Overwhelmed</div></div>
        <button class="btn-next" id="log-mood-btn" onclick="MOOD.log()" disabled style="font-size:13px;padding:12px">Log Mood · Earn 5 NOET ◈</button>
      </div>
      <div class="card" id="mood-hist" style="display:none"><div class="slbl" style="padding:14px 15px 0">Recent logs</div><div id="mood-hist-list"></div></div>
    </div>
  </div>

  <!-- ─── JOURNAL TAB ─── -->
  <div class="tab" id="t-journal">
    <div class="tscroll">
      <div class="sh1">Journal</div>
      <div class="sh2"><span style="color:var(--teal)">⬡</span>Zero-knowledge · Your words only</div>
      <div class="sk-row"><div class="sk-l"><div class="flame">🔥</div><div><div class="sn" id="sk-n">0</div><div class="slb">day streak</div></div></div><div class="sr-right"><div class="srw" id="sk-rw">+10 NOET/entry</div><div style="font-size:10px;color:var(--s0);margin-top:4px;font-family:var(--fm)" id="sk-best">best: 0 days</div></div></div>
      <div class="prom-card" onclick="JOURNAL.newPrompt()"><div class="prom-lbl">✦ Reflection prompt · tap to refresh</div><div class="prom-txt" id="prom-txt">Loading...</div></div>
      <div class="card" style="padding:16px;margin-bottom:14px" id="write-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><div class="slbl" style="margin:0">Today's entry</div><div class="enc-live" id="enc-live" style="display:none"><div class="enc-d"></div><span style="font-family:var(--fm);font-size:10px">encrypting</span></div></div>
        <textarea class="jta" id="jta" placeholder="Write freely. This space is truly yours." oninput="JOURNAL.type(this)"></textarea>
        <div class="wc-row"><span id="wc">0 words</span><div id="enc-inline" style="display:none" class="enc-live"><div class="enc-d"></div><span style="font-family:var(--fm);font-size:10px">⬡ live encryption</span></div></div>
        <button class="btn-next" id="save-btn" onclick="JOURNAL.save()" style="font-size:13px;padding:12px" disabled>Save & Encrypt · Earn NOET ◈</button>
      </div>
      <div class="card" id="past-wrap" style="display:none"><div class="slbl" style="padding:14px 15px 6px">Past entries</div><div id="past-list"></div></div>
    </div>
  </div>

  <!-- ─── REWARDS TAB ─── -->
  <div class="tab" id="t-rewards">
    <div class="tscroll">
      <div class="sh1">Rewards</div>
      <div class="sh2">Earn NOET for taking care of your mind</div>
      <div class="bal-hero">
        <div class="bal-lbl">Total Earned · NOET Token</div>
        <div class="bal-num" id="big-bal">0</div>
        <div class="bal-sym">NOETICA TOKEN</div>
        <div class="bal-stats">
          <div class="bal-stat"><div class="bal-stat-val" id="r-streak">0</div><div class="bal-stat-lbl">Day Streak</div></div>
          <div class="bal-stat-div"></div>
          <div class="bal-stat"><div class="bal-stat-val" id="r-entries">0</div><div class="bal-stat-lbl">Entries</div></div>
          <div class="bal-stat-div"></div>
          <div class="bal-stat"><div class="bal-stat-val" id="r-moods">0</div><div class="bal-stat-lbl">Mood Logs</div></div>
        </div>
        <div class="bal-addr" id="bal-addr-wrap" style="display:none">
          <div class="bal-addr-pill" id="bal-addr-txt"></div>
        </div>
      </div>
      <div class="card" style="margin-bottom:14px">
        <div class="slbl" style="padding:14px 15px 6px">How to earn NOET</div>
        <div class="er"><div class="erl"><div class="eico">✍</div><div><div class="en">Journal Entry</div><div class="ed">Write daily</div></div></div><div class="ea">+10 NOET</div></div>
        <div class="er"><div class="erl"><div class="eico">📊</div><div><div class="en">Mood Check-in</div><div class="ed">Log your mood</div></div></div><div class="ea">+5 NOET</div></div>
        <div class="er"><div class="erl"><div class="eico">🔥</div><div><div class="en">3-Day Streak</div><div class="ed">3 consecutive days</div></div></div><div class="ea">+25 NOET</div></div>
        <div class="er"><div class="erl"><div class="eico">⚡</div><div><div class="en">7-Day Streak</div><div class="ed">One full week</div></div></div><div class="ea">+75 NOET</div></div>
        <div class="er"><div class="erl"><div class="eico">👑</div><div><div class="en">30-Day Legend</div><div class="ed">Ultimate commitment</div></div></div><div class="ea">+300 NOET</div></div>
      </div>
      <div class="slbl">Milestones</div>
      <div class="mg2" id="mile-grid"></div>
      <div class="card"><div class="slbl" style="padding:14px 15px 6px">Reward history</div><div id="tx-list"><div style="padding:16px;text-align:center;font-size:12px;color:var(--s0)">No rewards yet — start journaling 💜</div></div></div>
    </div>
  </div>

  <!-- Bottom nav -->
  <div class="bbar">
    <div class="nav-in">
      <button class="nb on" id="nb-chat" onclick="APP.tab('chat')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Mind</button>
      <button class="nb" id="nb-mood" onclick="APP.tab('mood')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>Mood</button>
      <button class="nb" id="nb-journal" onclick="APP.tab('journal')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Journal</button>
      <button class="nb" id="nb-rewards" onclick="APP.tab('rewards')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>Rewards</button>
    </div>
  </div>
</div>

<!-- Entry Overlay -->
<div class="ov" id="ov-entry">
  <div class="ovc">
    <button class="ov-close" onclick="UI.closeOv('ov-entry')">×</button>
    <div class="ov-title" id="ov-e-d"></div>
    <div style="font-size:13px;color:var(--s2);line-height:1.8;margin-top:12px;white-space:pre-wrap" id="ov-e-b"></div>
    <div id="ov-e-i" style="display:none;margin-top:14px;padding:12px;background:var(--b0);border:1px solid var(--b1);border-radius:var(--r);font-size:12px;color:var(--s1);line-height:1.65"></div>
  </div>
</div>
`
}


// ══════════════════════════════════════════
// LOGOS
// ══════════════════════════════════════════
function setLogos() {
  const el = document.getElementById('ai-av-img')
  if (el) el.src = LOGO_SRC
}

// ══════════════════════════════════════════
// NEURAL AI BACKGROUND
// ══════════════════════════════════════════
function initBg() {
  const W = () => window.innerWidth, H = () => window.innerHeight

  // Grid
  ;(function() {
    const c = document.getElementById('gc'), ctx = c.getContext('2d')
    function resize(){ c.width=W(); c.height=H() }
    resize(); window.addEventListener('resize', resize)
    let off=0
    function draw(){
      ctx.clearRect(0,0,c.width,c.height)
      const vp={x:c.width/2, y:c.height*.36}
      const bY=c.height*1.1, rows=20, cols=24
      for(let i=0;i<=rows;i++){
        const t=(i+off/80)/rows, e=t*t
        const y=vp.y+(bY-vp.y)*e, sp=e*c.width*1.2, a=e*.07
        ctx.strokeStyle=i%4===0?`rgba(0,229,200,${a*.8})` :`rgba(255,255,255,${a})`
        ctx.lineWidth=.5; ctx.beginPath()
        ctx.moveTo(vp.x-sp/2,y); ctx.lineTo(vp.x+sp/2,y); ctx.stroke()
      }
      for(let j=-cols/2;j<=cols/2;j++){
        const x=vp.x+j*(c.width/cols), a=(1-Math.abs(j)/(cols/2))*.055
        ctx.strokeStyle=`rgba(255,255,255,${a})`
        ctx.beginPath(); ctx.moveTo(vp.x,vp.y); ctx.lineTo(x,bY); ctx.stroke()
      }
      off=(off+.45)%80; requestAnimationFrame(draw)
    }
    draw()
  })()

  // Neural
  ;(function() {
    const c = document.getElementById('nc'), ctx = c.getContext('2d')
    function resize(){ c.width=W(); c.height=H() }
    resize(); window.addEventListener('resize', resize)
    const nodes=Array.from({length:50},(_,i)=>({
      x:Math.random()*W(), y:Math.random()*H(),
      vx:(Math.random()-.5)*.17, vy:(Math.random()-.5)*.17,
      r:i<8?2.5+Math.random()*2:Math.random()*1.5+.4,
      ph:Math.random()*Math.PI*2, ps:.009+Math.random()*.01, hub:i<8
    }))
    const sigs=[]
    let fr=0
    function draw(){
      ctx.clearRect(0,0,c.width,c.height); fr++
      if(fr%90===0){
        const hi=Math.floor(Math.random()*8)
        nodes.forEach((n,i)=>{
          if(i===hi) return
          const d=Math.hypot(n.x-nodes[hi].x,n.y-nodes[hi].y)
          if(d<180&&Math.random()>.55) sigs.push({x:nodes[hi].x,y:nodes[hi].y,tx:n.x,ty:n.y,p:0,sp:.013+Math.random()*.008,teal:Math.random()>.65})
        })
      }
      for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++){
        const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y
        const d=Math.sqrt(dx*dx+dy*dy), mx=(nodes[i].hub||nodes[j].hub)?160:100
        if(d<mx){ctx.beginPath();ctx.strokeStyle=`rgba(255,255,255,${(1-d/mx)*.06})`;ctx.lineWidth=.4;ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.stroke()}
      }
      for(let i=sigs.length-1;i>=0;i--){
        const s=sigs[i]; s.p+=s.sp; if(s.p>=1){sigs.splice(i,1);continue}
        const px=s.x+(s.tx-s.x)*s.p, py=s.y+(s.ty-s.y)*s.p
        const px0=s.x+(s.tx-s.x)*Math.max(0,s.p-.14), py0=s.y+(s.ty-s.y)*Math.max(0,s.p-.14)
        const col=s.teal?'0,229,200':'200,200,230'
        const g=ctx.createLinearGradient(px0,py0,px,py); g.addColorStop(0,`rgba(${col},0)`); g.addColorStop(1,`rgba(${col},.82)`)
        ctx.beginPath(); ctx.strokeStyle=g; ctx.lineWidth=1.5; ctx.moveTo(px0,py0); ctx.lineTo(px,py); ctx.stroke()
        ctx.beginPath(); ctx.arc(px,py,2,0,Math.PI*2); ctx.fillStyle=`rgba(${col},.9)`; ctx.fill()
      }
      nodes.forEach(n=>{
        n.ph+=n.ps; const p=Math.sin(n.ph)*.5+.5
        if(n.hub){ctx.beginPath();ctx.arc(n.x,n.y,n.r+4+p*3,0,Math.PI*2);ctx.strokeStyle=`rgba(0,229,200,${.065+p*.09})`;ctx.lineWidth=.5;ctx.stroke()}
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r+(n.hub?p*.8:0),0,Math.PI*2)
        ctx.fillStyle=`rgba(${n.hub?'0,229,200':'165,165,215'},${(n.hub?.55:.2)+p*.18})`; ctx.fill()
        n.x+=n.vx; n.y+=n.vy
        if(n.x<-20||n.x>c.width+20) n.vx*=-1
        if(n.y<-20||n.y>c.height+20) n.vy*=-1
      })
      requestAnimationFrame(draw)
    }
    draw()
  })()

  // Data streams
  ;(function() {
    const c = document.getElementById('pc'), ctx = c.getContext('2d')
    function resize(){ c.width=W(); c.height=H() }
    resize(); window.addEventListener('resize', resize)
    const streams=Array.from({length:14},()=>({x:Math.random()*W(),y:Math.random()*H()-H(),sp:.3+Math.random()*.5,a:.032+Math.random()*.04}))
    function draw(){
      ctx.clearRect(0,0,c.width,c.height)
      ctx.font='10px "DM Mono",monospace'
      streams.forEach(s=>{
        s.y+=s.sp; if(s.y>c.height+80){s.y=-80;s.x=Math.random()*c.width}
        for(let i=0;i<6;i++){
          ctx.fillStyle=i===0?`rgba(0,229,200,${Math.min(s.a*2,.13)})` :`rgba(150,150,200,${s.a*(1-i/6)})`
          ctx.fillText(i%2===0?'1':'0', s.x, s.y-i*13)
        }
      })
      requestAnimationFrame(draw)
    }
    draw()
  })()
}

// ══════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════
const UI = {
  goto(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.add('out')); document.getElementById(id).classList.remove('out') },
  showOv(id){ document.getElementById(id).classList.add('open') },
  closeOv(id){ document.getElementById(id).classList.remove('open') },
}

function toast(msg, type='ok'){
  const el=document.getElementById('toasts'), icons={ok:'◈',err:'✕',warn:'⚠'}
  const d=document.createElement('div'); d.className=`tst ${type}`
  d.innerHTML=`<span style="color:${type==='ok'?'var(--teal)':type==='warn'?'rgba(255,180,50,.8)':'#f87171'}">${icons[type]}</span>${msg}`
  el.appendChild(d); setTimeout(()=>d.remove(),3000)
}

async function encFlash(text){
  const el=document.getElementById('ef'), ct=document.getElementById('ef-c'), ff=document.getElementById('ef-f')
  ct.textContent=obfuscate(text.slice(0,34),.82); el.classList.add('on'); ff.style.width='100%'
  await new Promise(r=>setTimeout(r,760)); el.classList.remove('on'); ff.style.width='0'
}

// ══════════════════════════════════════════
// ONBOARDING
// ══════════════════════════════════════════
const ONB = {
  check(){ document.getElementById('st1-btn').disabled=document.getElementById('inp-name').value.trim().length<2 },
  next1(){
    S.name=document.getElementById('inp-name').value.trim()
    document.getElementById('st1').style.display='none'
    document.getElementById('st2').style.display='block'
  },
  back1(){
    document.getElementById('st2').style.display='none'
    document.getElementById('st1').style.display='block'
  },
  handleEnterBtn(){
    const btn=document.getElementById('st2-btn')
    // If address AND vaultKey both set, go straight to app
    if(S.address && S.vaultKey) {
      ONB.finishEnter()
    } else if(btn && btn.dataset.ready==='1') {
      // Wallet connected, derive key and enter
      deriveVaultKey(S.address).then(vk=>{
        S.vaultKey=vk
        loadVault(S.address,vk).then(()=>ONB.finishEnter())
      }).catch(()=>ONB.finishEnter())
    } else {
      ONB.connectAndEnter()
    }
  },
  async connectAndEnter(){
    const btn=document.getElementById('st2-btn')
    // If already connected (returning user), go straight to app
    if(S.address && S.vaultKey){
      btn.textContent='Entering...'; btn.disabled=true
      await ONB.finishEnter()
      return
    }
    btn.textContent='Connecting...'; btn.disabled=true
    try {
      const addr=await _connectWallet()
      S.address=addr
      const vk=await deriveVaultKey(addr)
      S.vaultKey=vk
      await loadVault(addr,vk)
      if(!S.name) S.name=''
      document.getElementById('wlt-connect-card').style.display='none'
      document.getElementById('wlt-addr-wrap').style.display='block'
      document.getElementById('wlt-addr-disp').textContent=`Connected: ${shortAddr(addr)}`
      btn.textContent='Enter NOETICA →'
      btn.disabled=false
      btn.dataset.ready='1'
      // Auto-proceed to app immediately
      setTimeout(()=>ONB.finishEnter(), 200)
    } catch(e) {
      btn.textContent='Connect Wallet'; btn.disabled=false
      toast(e.code===4001?'Connection rejected':e.message||'Could not connect','err')
    }
  },
  async finishEnter(){
    const btn=document.getElementById('st2-btn')
    if(btn){ btn.textContent='Entering...'; btn.disabled=true }
    try {
      await saveVault()
      APP.init()
      UI.goto('s-app')
      const c=isConnected()
      document.getElementById('chat-gate').style.display=c?'none':'flex'
      if(c){
        const wb=document.getElementById('wlt-btn')
        if(wb){ wb.textContent=shortAddr(S.address); wb.classList.add('on') }
        const addrTxt=document.getElementById('wlt-dd-addr-txt')
        if(addrTxt) addrTxt.textContent=S.address||''
      }
    } catch(e) {
      console.error('finishEnter error:', e)
      if(btn){ btn.textContent='Enter NOETICA →'; btn.disabled=false }
    }
  }
}

// ══════════════════════════════════════════
// APP
// ══════════════════════════════════════════
const APP = {
  init(){
    if(!S.messages.length){
      S.messages=[{role:'assistant',content:`Hello, ${S.name||'there'} 💜\n\nI'm NOETICA — your private neural companion. Everything here is encrypted end-to-end before it leaves your device.\n\nThis is your sanctuary. How are you feeling right now?`,ts:Date.now()}]
    }
    CHAT.render(); MOOD.renderChart(); JOURNAL.renderHistory(); JOURNAL.newPrompt()
    this.updateBal()
    document.getElementById('sk-n').textContent=S.streak
    document.getElementById('sk-best').textContent=`best: ${S.bestStreak} days`
    this.updReward()
    S.journaledToday=S.entries.some(e=>new Date(e.ts).toDateString()===new Date().toDateString())
    if(S.journaledToday) document.getElementById('write-card').innerHTML=`<div style="padding:22px;text-align:center"><div style="font-size:32px;margin-bottom:10px">✅</div><div style="font-size:14px;color:var(--s2)">Journaled today — come back tomorrow 🔥</div></div>`
  },
  tab(t){
    S.tab=t
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'))
    document.querySelectorAll('.nb').forEach(x=>x.classList.remove('on'))
    document.getElementById('t-'+t).classList.add('on')
    document.getElementById('nb-'+t).classList.add('on')
    if(t==='rewards'){REWARDS.renderMilestones();REWARDS.renderStats()}
    if(t==='mood') MOOD.renderChart()
  },
  async connectWallet(){
    try {
      const addr=await _connectWallet()
      S.address=addr
      if(!S.vaultKey){ S.vaultKey=await deriveVaultKey(addr); await loadVault(addr,S.vaultKey) }
      const btn=document.getElementById('wlt-btn')
      btn.textContent=shortAddr(addr); btn.classList.add('on')
      const addrTxt=document.getElementById('wlt-dd-addr-txt')
      if(addrTxt) addrTxt.textContent=addr
      document.getElementById('chat-gate').style.display='none'
      toast(`Connected: ${shortAddr(addr)}`)
      const bal=await getNOETBalance(addr)
      if(parseFloat(bal)>0){ S.noet=Math.max(S.noet,Math.floor(parseFloat(bal))); this.updateBal() }
    } catch(e) {
      if(e.code===4001) toast('Connection rejected','warn')
      else toast(e.message||'Could not connect','err')
    }
  },
  updateBal(){
    document.getElementById('top-bal').textContent=S.noet.toLocaleString()
    document.getElementById('big-bal').textContent=S.noet.toLocaleString()
    REWARDS.renderTx()
  },
  wltBtnClick(){
    if(!isConnected()){ APP.connectWallet(); return }
    const dd=document.getElementById('wlt-dropdown')
    const addrTxt=document.getElementById('wlt-dd-addr-txt')
    if(addrTxt) addrTxt.textContent=S.address||shortAddr(S.address)
    dd.classList.toggle('open')
    // Close on outside click
    setTimeout(()=>{
      const close=()=>{dd.classList.remove('open');document.removeEventListener('click',close)}
      document.addEventListener('click',close)
    },10)
  },
  copyAddr(){
    if(S.address) navigator.clipboard.writeText(S.address).then(()=>toast('Address copied')).catch(()=>{})
    document.getElementById('wlt-dropdown').classList.remove('open')
  },
  viewExplorer(){
    if(S.address) window.open(`https://testnet.cotiscan.io/address/${S.address}`,'_blank')
    document.getElementById('wlt-dropdown').classList.remove('open')
  },
  disconnect(){
    document.getElementById('wlt-dropdown').classList.remove('open')
    // Save vault before clearing session
    saveVault().catch(()=>{})
    // Only clear session - NOT rewards (rewards stay in localStorage)
    S.address=null; S.vaultKey=''; S.messages=[]
    // Reset UI
    const btn=document.getElementById('wlt-btn')
    btn.textContent='Connect Wallet'; btn.classList.remove('on')
    document.getElementById('top-bal').textContent='0'
    document.getElementById('big-bal').textContent='0'
    document.getElementById('chat-gate').style.display='flex'
    try{ if(window.ethereum?.removeAllListeners) window.ethereum.removeAllListeners() }catch{}
    toast('Disconnected successfully')
    setTimeout(()=>UI.goto('s-land'),600)
  },
  updReward(){
    const s=S.streak
    document.getElementById('sk-rw').textContent=s>=30?'+300 NOET streak!':s>=7?'+75 NOET streak!':s>=3?'+25 NOET streak!':'+10 NOET/entry'
  }
}

// ══════════════════════════════════════════
// CHAT — precise layout
// ══════════════════════════════════════════
const CHAT = {
  render(){
    const c=document.getElementById('msgs'); c.innerHTML=''
    const today=new Date().toDateString()
    let lastDay=''
    S.messages.forEach(m=>{
      const mDay=m.ts?new Date(m.ts).toDateString():today
      if(mDay!==lastDay){
        lastDay=mDay
        const div=document.createElement('div'); div.className='date-div'
        div.textContent=new Date(mDay).toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'})
        c.appendChild(div)
      }
      const row=document.createElement('div'); row.className=`mrow ${m.role==='user'?'u':''}`
      // Avatar
      const av=document.createElement('div'); av.className=`mav ${m.role==='user'?'u':'ai'}`
      if(m.role==='user'){ av.textContent=(S.name[0]||'U').toUpperCase() }
      else { const img=document.createElement('img');img.src=LOGO_SRC;img.style.cssText='width:22px;height:auto;mix-blend-mode:screen;filter:brightness(1.2) contrast(1.1)';av.appendChild(img) }
      // Body
      const body=document.createElement('div'); body.className='mbody'
      const bub=document.createElement('div'); bub.className=`mb ${m.role==='user'?'u':'ai'}`; bub.textContent=m.content
      const meta=document.createElement('div'); meta.className='mmeta'
      const t=m.ts?new Date(m.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):''
      meta.innerHTML=`${m.role==='user'?'<span class="enc-tag">⬡</span>':''}<span>${t}</span>`
      body.appendChild(bub); body.appendChild(meta)
      row.appendChild(av); row.appendChild(body)
      c.appendChild(row)
    })
    this.scrollBottom()
    if(S.uMsgs>2){ const qw=document.getElementById('qps-wrap'); if(qw) qw.style.display='none' }
  },
  scrollBottom(){
    const o=document.getElementById('msgs-outer')
    if(o) setTimeout(()=>{ o.scrollTop=o.scrollHeight },60)
  },
  addTyping(){
    const c=document.getElementById('msgs')
    const row=document.createElement('div'); row.className='mrow'; row.id='typing'
    const av=document.createElement('div'); av.className='mav ai'
    const img=document.createElement('img');img.src=LOGO_SRC;img.style.cssText='width:22px;height:auto;mix-blend-mode:screen;filter:brightness(1.2) contrast(1.1)';av.appendChild(img)
    const bub=document.createElement('div'); bub.className='typing-bub'; bub.innerHTML='<div class="td"></div><div class="td"></div><div class="td"></div>'
    row.appendChild(av); row.appendChild(bub); c.appendChild(row)
    this.scrollBottom()
  },
  remTyping(){ document.getElementById('typing')?.remove() },
  kd(e){ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();this.send()} },
  resize(el){
    el.style.height='auto'
    el.style.height=Math.min(el.scrollHeight,110)+'px'
    document.getElementById('sbtn').disabled=!el.value.trim()
  },
  quick(btn){
    if(!isConnected()){ document.getElementById('chat-gate').style.display='flex'; return }
    this.send(btn.textContent)
  },
  async send(txt){
    if(!isConnected()){ document.getElementById('chat-gate').style.display='flex'; toast('Connect your wallet to chat','warn'); return }
    if(!Cfg.hasApiKey()){
      // Show once in chat, don't spam toasts
      const alreadyShown = S.messages.some(m=>m._nokey)
      if(!alreadyShown){
        S.messages.push({role:'assistant',content:'Neural intelligence is offline.\n\nTo activate, add your API key to the .env file:\n\nVITE_AI_API_KEY=your_key_here\n\nThen restart the server with: npm run dev',ts:Date.now(),_nokey:true})
        CHAT.render()
      }
      return
    }
    const inp=document.getElementById('ci'), msg=(txt||inp.value).trim()
    if(!msg||S.isTyping) return
    inp.value=''; inp.style.height='auto'; document.getElementById('sbtn').disabled=true
    if(detectCrisis(msg)==='high'){
      const b=document.createElement('div'); b.className='crisis-banner'; b.id='crisis-b'
      b.innerHTML='<h4>You\'re not alone 💜</h4><p>📞 988 Suicide & Crisis Lifeline &nbsp;|&nbsp; 💬 Text HOME to 741741</p>'
      document.getElementById('t-chat').insertBefore(b, document.getElementById('msgs-outer'))
      setTimeout(()=>b.remove(),9000)
    }
    await encFlash(msg)
    S.messages.push({role:'user',content:msg,ts:Date.now()})
    this.render(); S.isTyping=true; this.addTyping()
    try {
      const reply=await sendToAI(S.messages); this.remTyping()
      S.messages.push({role:'assistant',content:reply,ts:Date.now()}); this.render()
    } catch {
      this.remTyping()
      S.messages.push({role:'assistant',content:'Connection issue. Please try again in a moment.',ts:Date.now()})
      this.render()
    }
    S.isTyping=false; await saveVault()
  }
}

// ══════════════════════════════════════════
// MOOD
// ══════════════════════════════════════════
const MOOD = {
  sel(el){ document.querySelectorAll('.mo').forEach(m=>m.classList.remove('sel')); el.classList.add('sel'); S.selMood={score:+el.dataset.score,label:el.dataset.label,emoji:el.children[0].textContent}; document.getElementById('log-mood-btn').disabled=false },
  tag(el){ el.classList.toggle('on'); const t=el.textContent; el.classList.contains('on')?S.selTags.push(t):(S.selTags=S.selTags.filter(x=>x!==t)) },
  async log(){
    if(!S.selMood) return
    const entry={...S.selMood,tags:[...S.selTags],ts:Date.now()}
    S.moods.push(entry); S.selMood=null; S.selTags=[]
    document.querySelectorAll('.mo').forEach(m=>m.classList.remove('sel'))
    document.querySelectorAll('.et').forEach(t=>t.classList.remove('on'))
    document.getElementById('log-mood-btn').disabled=true
    await REWARDS.earn('mood',5); await saveVault(); this.renderChart()
    toast('Mood logged · +5 NOET ◈')
    document.getElementById('checkin-card').innerHTML=`<div style="padding:22px;text-align:center"><div style="font-size:32px;margin-bottom:10px">${entry.emoji}</div><div style="font-size:14px;color:var(--s2)">Mood logged for today 💜</div><div style="font-size:11px;color:var(--s0);margin-top:4px;font-family:var(--fm)">+5 NOET</div></div>`
  },
  renderChart(){
    const today=new Date(), bars=[], labels=[]
    for(let i=13;i>=0;i--){ const d=new Date(today); d.setDate(d.getDate()-i); const ds=d.toDateString(); const dm=S.moods.filter(m=>new Date(m.ts).toDateString()===ds); bars.push(dm.length?dm.reduce((a,m)=>a+m.score,0)/dm.length:null); labels.push(d.toLocaleDateString('en',{month:'short',day:'numeric'})) }
    const ch=document.getElementById('mood-ch'); ch.innerHTML=''
    bars.forEach(v=>{ const b=document.createElement('div'); b.className='cb'+(v?' f':''); b.style.height=(v?(v/10)*100:5)+'%'; if(v){ b.dataset.v=v.toFixed(1); const col=v>=7?'0,229,200':v>=5?'180,180,220':'180,80,80'; b.style.background=`linear-gradient(to top,rgba(${col},.22),rgba(${col},.05))` }; ch.appendChild(b) })
    if(S.moods.length){ const avg=(S.moods.reduce((a,m)=>a+m.score,0)/S.moods.length).toFixed(1); document.getElementById('m-avg').textContent=avg; document.getElementById('m-cnt').textContent=S.moods.length; const r=S.moods.slice(-3).reduce((a,m)=>a+m.score,0)/Math.min(3,S.moods.length); const o=S.moods.length>3?S.moods.slice(-6,-3).reduce((a,m)=>a+m.score,0)/Math.min(3,S.moods.slice(-6,-3).length):r; document.getElementById('m-trend').textContent=r>o+.5?'↑':r<o-.5?'↓':'→' }
    if(labels.length) document.getElementById('ch-s').textContent=labels[0]
    if(S.moods.length){ const h=document.getElementById('mood-hist'); h.style.display='block'; const l=document.getElementById('mood-hist-list'); l.innerHTML=''; S.moods.slice().reverse().slice(0,5).forEach(m=>{ const r=document.createElement('div'); r.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:11px 15px;border-bottom:1px solid var(--b1)'; r.innerHTML=`<div style="display:flex;align-items:center;gap:9px"><span style="font-size:20px">${m.emoji}</span><div><div style="font-size:13px;color:var(--s3)">${m.label}</div><div style="font-size:10px;color:var(--s0);font-family:var(--fm)">${new Date(m.ts).toLocaleString()}</div></div></div><span style="font-family:var(--fm);font-size:12px;color:var(--s1)">${m.score}/10</span>`; l.appendChild(r) }) }
  }
}

// ══════════════════════════════════════════
// JOURNAL
// ══════════════════════════════════════════
const JOURNAL = {
  newPrompt(){ document.getElementById('prom-txt').textContent=S.PROMPTS[~~(Math.random()*S.PROMPTS.length)] },
  type(el){
    const w=el.value.trim().split(/\s+/).filter(Boolean).length
    document.getElementById('wc').textContent=`${w} words`
    document.getElementById('save-btn').disabled=w<5
    if(el.value){ document.getElementById('enc-live').style.display='flex'; document.getElementById('enc-inline').style.display='flex' }
  },
  async save(){
    const text=document.getElementById('jta').value.trim()
    if(text.split(/\s+/).filter(Boolean).length<5) return
    document.getElementById('save-btn').textContent='Saving...'; document.getElementById('save-btn').disabled=true
    await encFlash(text)
    const entry={id:Date.now(),content:text,words:text.split(/\s+/).filter(Boolean).length,ts:Date.now(),insight:null}
    if(Cfg.hasApiKey()) getInsight(text).then(i=>{ if(i){ entry.insight=i; saveVault() } }).catch(()=>{})
    S.entries.push(entry); S.journaledToday=true
    const today=new Date().toDateString(), yday=new Date(Date.now()-86400000).toDateString()
    if(S.entries.length===1){ S.streak=1 } else { const prev=S.entries.slice(-2)[0]; const pd=new Date(prev.ts).toDateString(); if(pd===yday) S.streak++; else if(pd!==today) S.streak=1 }
    S.bestStreak=Math.max(S.bestStreak,S.streak)
    document.getElementById('sk-n').textContent=S.streak; document.getElementById('sk-best').textContent=`best: ${S.bestStreak} days`; APP.updReward()
    let earned=10; if(S.streak>=30) earned+=300; else if(S.streak>=7) earned+=75; else if(S.streak>=3) earned+=25
    await REWARDS.earn('journal',earned)
    if(isConnected()){ claimOnChain('journal').catch(()=>{}); if(S.streak===3) claimOnChain('streak_3').catch(()=>{}); if(S.streak===7) claimOnChain('streak_7').catch(()=>{}) }
    await saveVault(); this.renderHistory()
    toast(`Entry saved · +${earned} NOET ◈`)
    document.getElementById('write-card').innerHTML=`<div style="padding:22px;text-align:center"><div style="font-size:32px;margin-bottom:10px">✅</div><div style="font-size:14px;color:var(--s2)">Entry saved 💜</div><div style="font-size:11px;color:var(--s0);margin-top:4px;font-family:var(--fm)">+${earned} NOET · ${S.streak} day streak 🔥</div></div>`
  },
  renderHistory(){
    if(!S.entries.length) return
    document.getElementById('past-wrap').style.display='block'
    const c=document.getElementById('past-list'); c.innerHTML=''
    S.entries.slice().reverse().forEach(e=>{
      const d=document.createElement('div'); d.className='ei'; d.onclick=()=>this.openEntry(e)
      d.innerHTML=`<div class="edate">${new Date(e.ts).toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div><div class="eprev">${e.content}</div><div class="echips"><span class="chip">${e.words} words</span>${e.insight?'<span class="chip t">✦ insight</span>':''}<span class="chip t">⬡ encrypted</span></div>`
      c.appendChild(d)
    })
  },
  openEntry(e){
    document.getElementById('ov-e-d').textContent=new Date(e.ts).toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'})
    document.getElementById('ov-e-b').textContent=e.content
    const ins=document.getElementById('ov-e-i')
    if(e.insight){ ins.style.display='block'; ins.innerHTML=`<span style="color:var(--teal);font-family:var(--fm);font-size:9px;letter-spacing:.1em;text-transform:uppercase">✦ Neural Insight</span><br><br>${e.insight}` } else ins.style.display='none'
    UI.showOv('ov-entry')
  }
}

// ══════════════════════════════════════════
// REWARDS
// ══════════════════════════════════════════
const TX_LABELS={journal:'Journal Entry',mood:'Mood Check-in',first:'First Session',streak_3:'3-Day Streak',streak_7:'7-Day Streak',streak_30:'30-Day Legend'}
const REWARDS = {
  async earn(type,amount){ S.noet+=amount; S.totalEarned+=amount; S.transactions.unshift({type,amount,hash:mockTxHash(),ts:Date.now()}); APP.updateBal() },
  renderTx(){
    const c=document.getElementById('tx-list')
    if(!S.transactions.length){ c.innerHTML='<div style="padding:16px;text-align:center;font-size:12px;color:var(--s0)">No rewards yet — start journaling 💜</div>'; return }
    c.innerHTML=''
    S.transactions.slice(0,10).forEach(tx=>{ const r=document.createElement('div'); r.className='tx'; r.innerHTML=`<div class="txl"><div class="txd"></div><div><div class="txn">${TX_LABELS[tx.type]||'Reward'}</div><div class="txh">${tx.hash.slice(0,14)}…</div></div></div><div class="txa">+${tx.amount} NOET</div>`; c.appendChild(r) })
  },
  renderMilestones(){
    const miles=[{lbl:'First Entry',ico:'✍',n:10,done:S.entries.length>=1,d:'Write your first entry'},{lbl:'3-Day Streak',ico:'🔥',n:25,done:S.streak>=3,d:'3 days in a row'},{lbl:'7-Day Streak',ico:'⚡',n:75,done:S.streak>=7,d:'One full week'},{lbl:'Mood Pioneer',ico:'📊',n:5,done:S.moods.length>=1,d:'Log your first mood'},{lbl:'Deep Mind',ico:'💬',n:50,done:S.uMsgs>=10,d:'10 conversations'},{lbl:'30-Day Legend',ico:'👑',n:300,done:S.streak>=30,d:'Ultimate commitment'}]
    const g=document.getElementById('mile-grid'); g.innerHTML=''
    miles.forEach(m=>{ const c=document.createElement('div'); c.className=`mc ${m.done?'done':''}`; c.innerHTML=`<div class="mci">${m.ico}</div><div class="mcn">${m.lbl}</div><div class="mcd">${m.d}</div><div class="mct">+${m.n} NOET</div>${m.done?'<div class="mck2">◈ achieved</div>':''}`; g.appendChild(c) })
  }
}

// ══════════════════════════════════════════
// BOOT
// ══════════════════════════════════════════
mount()
setLogos()
initBg()

// ── SPLASH DISMISS ──
;(function initSplash() {
  // Show splash for 2.8s then fade out
  const splash = document.getElementById('splash')
  if (!splash) return
  setTimeout(() => {
    splash.classList.add('hide')
    setTimeout(() => splash.remove(), 700)
  }, 2800)
})()

// ── REWARD SYSTEM ──
const REWARD_CONTRACT = '0x19bEE8b027153e6fE85c0083e5D8801336C26E1b'
const REWARD_ABI_MIN = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
]
const REWARD_AMOUNTS = { journal:10, mood:5, streak_3:25, streak_7:75, streak_30:300, first:20 }
const DAILY_MAX = 150
const _rDaily = {} // { addr: { date, total } }

async function giveReward(type) {
  if (!S.address || !S.vaultKey) return null
  const today = new Date().toDateString()
  const key = S.address
  if (!_rDaily[key] || _rDaily[key].date !== today) {
    _rDaily[key] = { date: today, total: 0 }
  }
  const amt = REWARD_AMOUNTS[type] || 0
  const remaining = DAILY_MAX - _rDaily[key].total
  const actual = Math.min(amt, remaining)
  if (actual <= 0) { toast('Daily reward limit reached', 'warn'); return null }

  // Update local state immediately
  S.noet += actual
  S.totalEarned += actual
  S.transactions.unshift({ type, amount: actual, hash: mockTxHash(), ts: Date.now(), onchain: false })
  APP.updateBal()
  _rDaily[key].total += actual

  // Try on-chain transfer (if ethers available + connected)
  try {
    const { ethers } = await import('ethers')
    const raw = window.ethereum
    if (raw && isConnected()) {
      const provider = new ethers.BrowserProvider(raw)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(REWARD_CONTRACT, REWARD_ABI_MIN, signer)
      // Note: For PrivateERC20 on COTI, transfer from deployer wallet is needed
      // Local tracking is primary; on-chain handled by reward-distributor.cjs
      console.log(`[NOETICA] Reward tracked: +${actual} NOET (${type})`)
    }
  } catch {}

  await saveVault()
  toast(`+${actual} NOET ◈ earned`)
  return actual
}

// ── Override REWARDS.earn to use giveReward ──
const _origEarn = REWARDS.earn.bind(REWARDS)
REWARDS.earn = async function(type, amount) {
  return giveReward(type) ?? _origEarn(type, amount)
}

Object.assign(window, { UI, ONB, APP, CHAT, MOOD, JOURNAL, REWARDS, giveReward })
window.addEventListener('wallet:changed', e => {
  if(e.detail?.address) document.getElementById('chat-gate').style.display='none'
})

