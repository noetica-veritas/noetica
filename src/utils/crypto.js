export async function encrypt(text, pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv   = crypto.getRandomValues(new Uint8Array(12))
  const key  = await _key(pw, salt)
  const ct   = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, new TextEncoder().encode(text))
  const out  = new Uint8Array(28 + ct.byteLength)
  out.set(salt,0); out.set(iv,16); out.set(new Uint8Array(ct),28)
  return btoa(String.fromCharCode(...out))
}

export async function decrypt(b64, pw) {
  const raw = new Uint8Array(atob(b64).split('').map(c=>c.charCodeAt(0)))
  const key = await _key(pw, raw.slice(0,16))
  const pt  = await crypto.subtle.decrypt({ name:'AES-GCM', iv:raw.slice(16,28) }, key, raw.slice(28))
  return new TextDecoder().decode(pt)
}

async function _key(pw, salt) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), {name:'PBKDF2'}, false, ['deriveKey'])
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'}, k, {name:'AES-GCM',length:256}, false, ['encrypt','decrypt'])
}

export function genVaultKey() {
  const a = new Uint8Array(24); crypto.getRandomValues(a)
  return Array.from(a).map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,32)
}

export function obfuscate(text, r=0.78) {
  const g = '█▓▒░◈⬡◆▲△◇╳'
  return text.split('').map(c=>c===' '?' ':Math.random()<r?g[~~(Math.random()*g.length)]:c).join('')
}
