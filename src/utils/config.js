/**
 * NOETICA — Config
 * All values from .env — never hardcoded in source
 */
export const Cfg = {
  ai: {
    key:      import.meta.env.VITE_AI_API_KEY      || '',
    model:    import.meta.env.VITE_AI_MODEL        || 'Hermes-4-70B',
    endpoint: import.meta.env.VITE_AI_ENDPOINT     || 'https://inference-api.nousresearch.com/v1/chat/completions',
    tokens:   Number(import.meta.env.VITE_AI_MAX_TOKENS)    || 512,
    temp:     Number(import.meta.env.VITE_AI_TEMPERATURE)   || 0.8,
  },
  coti: {
    chainId:  Number(import.meta.env.VITE_COTI_CHAIN_ID)    || 7082400,
    chainHex: '0x6C0360',
    rpc:      import.meta.env.VITE_COTI_RPC_URL    || 'https://testnet.coti.io/rpc',
    explorer: import.meta.env.VITE_COTI_EXPLORER   || 'https://testnet.cotiscan.io',
    faucet:   import.meta.env.VITE_COTI_FAUCET     || 'https://faucet.coti.io',
  },
  contract: {
    token:   import.meta.env.VITE_NOET_TOKEN_ADDRESS   || '',
    rewards: import.meta.env.VITE_NOET_REWARDS_ADDRESS || '',
  },
  hasApiKey() { return Boolean(this.ai.key && !this.ai.key.includes('your_')) },
  hasContracts() { return Boolean(this.contract.token && this.contract.token !== '0x0000000000000000000000000000000000000000') },
}
