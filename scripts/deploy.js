const { ethers } = require('hardhat')
const fs = require('fs')

async function main() {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║    NOETICA — Smart Contract Deployment       ║')
  console.log('║    COTI Testnet (Chain ID: 7082400)          ║')
  console.log('╚══════════════════════════════════════════════╝\n')

  const [deployer] = await ethers.getSigners()
  console.log('Deployer :', deployer.address)

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log('Balance  :', ethers.formatEther(balance), 'COTI\n')

  if (balance < ethers.parseEther('0.01')) {
    console.error('⚠ Insufficient balance!')
    console.error('  Get testnet COTI at: https://faucet.coti.io\n')
    process.exit(1)
  }

  // ── Deploy NOETToken ───────────────────────────────────
  console.log('Deploying NOETToken...')
  const Token = await ethers.getContractFactory('NOETToken')
  const token = await Token.deploy(deployer.address)
  await token.waitForDeployment()
  const tokenAddr = await token.getAddress()
  console.log('✓ NOETToken deployed :', tokenAddr)

  // ── Deploy NOETRewards ─────────────────────────────────
  console.log('Deploying NOETRewards...')
  const Rewards = await ethers.getContractFactory('NOETRewards')
  const rewards = await Rewards.deploy(tokenAddr, deployer.address)
  await rewards.waitForDeployment()
  const rewardsAddr = await rewards.getAddress()
  console.log('✓ NOETRewards deployed:', rewardsAddr)

  // ── Authorize NOETRewards to mint ──────────────────────
  console.log('\nAuthorizing NOETRewards as minter...')
  const tx = await token.setMinter(rewardsAddr, true)
  await tx.wait()
  console.log('✓ Minter authorized')

  // ── Print stats ────────────────────────────────────────
  console.log('\n── Token Stats ───────────────────────────────')
  console.log('Name          :', await token.name())
  console.log('Symbol        :', await token.symbol())
  console.log('Max Supply    :', ethers.formatEther(await token.MAX_SUPPLY()), 'NOET')
  console.log('Reward Pool   :', ethers.formatEther(await token.REWARD_POOL_CAP()), 'NOET')
  console.log('Deployer Bal  :', ethers.formatEther(await token.balanceOf(deployer.address)), 'NOET')

  // ── Save deployment info ───────────────────────────────
  const info = {
    network:     'COTI Testnet',
    chainId:     7082400,
    deployer:    deployer.address,
    deployedAt:  new Date().toISOString(),
    contracts: {
      NOETToken:   tokenAddr,
      NOETRewards: rewardsAddr,
    },
    explorer: {
      token:   `https://testnet.cotiscan.io/address/${tokenAddr}`,
      rewards: `https://testnet.cotiscan.io/address/${rewardsAddr}`,
    }
  }

  fs.writeFileSync('deployment.json', JSON.stringify(info, null, 2))
  console.log('\n✓ Saved to deployment.json')

  // ── Instructions ───────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║  Update your .env with these values:         ║')
  console.log('╠══════════════════════════════════════════════╣')
  console.log(`║  VITE_NOET_TOKEN_ADDRESS=${tokenAddr.slice(0,20)}...`)
  console.log(`║  VITE_NOET_REWARDS_ADDRESS=${rewardsAddr.slice(0,18)}...`)
  console.log('╚══════════════════════════════════════════════╝\n')
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
