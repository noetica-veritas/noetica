const { ethers } = require('ethers')
require('dotenv').config()

const TOKEN = '0x19bEE8b027153e6fE85c0083e5D8801336C26E1b'
const ABI = ['function transfer(address to, uint256 amount) returns (bool)']

async function reward(userAddress, amount) {
  const provider = new ethers.JsonRpcProvider('https://testnet.coti.io/rpc')
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider)
  const token = new ethers.Contract(TOKEN, ABI, wallet)
  
  // amount in 6 decimals (e.g. 10 NOET = 10_000000)
  const tx = await token.transfer(userAddress, ethers.parseUnits(amount.toString(), 6))
  await tx.wait()
  console.log(`Sent ${amount} NOET to ${userAddress}`)
}

// Test: reward(process.argv[2], parseInt(process.argv[3]))
module.exports = { reward }
