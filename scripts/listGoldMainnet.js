const { ethers } = require("hardhat");

const CORE_ADDRESS = "0xC644c18E5F018696D97F407B0c8937D8c5a30424";

async function main() {
  console.log("====================================================");
  console.log("🟡 PREPARING TO LIST GOLD (ID 5500) ON PHAROS MAINNET");
  console.log("====================================================\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Executing transaction with account: ${deployer.address}`);

  const core = await ethers.getContractAt("BrokexCore", CORE_ADDRESS);

  const goldConfig = {
    minLeverage: 2,                        // 2x
    maxLeverage: 50,                       // 50x
    minTradeSize: 10000000,                // 10 USDC (10 * 1e6)
    commissionBps: 700,                    // 0.07% (0.0007 * 1e6)
    borrowRateHourly: 22,                  // 0.0022% per hour (0.000022 * 1e6)
    profitCap: 100000,                     // 10% profit cap (0.10 * 1e6)
    executionTolerance: 500,               // 0.05% tolerance (0.0005 * 1e6)
    maxProofAge: 60,                       // 60 seconds
    maxTraderOI: 5000000000,               // 5k USDC (5,000 * 1e6)
    maxGlobalOI: 200000000000,             // 200k USDC (200,000 * 1e6)
    lockedCapitalBps: 50000,               // 5% locked LP capital (0.05 * 1e6)
    liqThresholdBps: 950000,               // 95% liquidation threshold (0.95 * 1e6)
    guaranteedSLFeeBps: 3000,              // 0.3% fee (0.003 * 1e6)
    listed: true,
    frozen: false
  };

  console.log("Listing configuration for Gold (ID 5500):", goldConfig);
  console.log("\nSending transaction...");
  const tx = await core.listAsset(5500, goldConfig);
  console.log(`Transaction hash: ${tx.hash}`);
  
  console.log("Waiting for confirmation...");
  await tx.wait();
  console.log("🎉 SUCCESS: Gold (ID 5500) has been listed on BrokexCore!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
