/**
 * NOETICA — Neural Intelligence
 * API key loaded from .env via Cfg — never in UI
 */
import { Cfg } from './config.js'

const SYSTEM = `You are NOETICA, an empathetic AI mental wellness companion on COTI Network.
All conversations are AES-256-GCM encrypted end-to-end.

Core approach:
- Warm, non-judgmental, deeply present
- CBT · ACT · Somatic awareness · Mindfulness
- Validate feelings before offering perspective
- One thoughtful question per turn, never multiple
- Concise: 2-3 sentences for check-ins, richer for processing
- Celebrate wins: streaks, mood improvements, insights
- Crisis signs → gently share: 988 Lifeline | Text HOME to 741741
- Never diagnose. You are a companion, not a therapist replacement.
- Privacy reminder: "Your thoughts are encrypted — this space is truly yours."
- Refer to yourself only as NOETICA. Never mention any AI model or provider.
- Users must connect their COTI wallet to interact. Acknowledge this when relevant.`

export async function sendToAI(messages) {
  if (!Cfg.hasApiKey()) throw new Error('NO_API_KEY')

  const res = await fetch(Cfg.ai.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${Cfg.ai.key}`,
    },
    body: JSON.stringify({
      model:       Cfg.ai.model,
      messages:    [{ role: 'system', content: SYSTEM }, ...messages.slice(-14)],
      max_tokens:  Cfg.ai.tokens,
      temperature: Cfg.ai.temp,
      top_p:       0.9,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API_${res.status}: ${body}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'I am here with you.'
}

export async function getInsight(text) {
  if (!Cfg.hasApiKey()) return null
  try {
    return await sendToAI([{
      role: 'user',
      content: `One compassionate sentence (under 20 words) as an insight for this journal entry: "${text.slice(0, 300)}"`
    }])
  } catch { return null }
}

export function detectCrisis(text) {
  const hi = ['suicide','kill myself','end my life',"don't want to live",'self-harm']
  const lo = ['hopeless','worthless',"can't go on",'give up','nobody cares']
  const t  = text.toLowerCase()
  if (hi.some(w => t.includes(w))) return 'high'
  if (lo.some(w => t.includes(w))) return 'moderate'
  return 'none'
}
