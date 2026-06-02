const { ethers } = require("hardhat");

const EXPECTED_USDC = "0xc879c018db60520f4355c26ed1a6d572cdac1815";
const EXPECTED_ORACLE = "0x16f70cAD28dd621b0072B5A8a8c392970E87C3dD";

const VAULT_ADDRESS = "0x589178934112DbBa96C17384079206a21B4F20DA";
const CORE_ADDRESS = "0xC644c18E5F018696D97F407B0c8937D8c5a30424";
const LENS_ADDRESS = "0x8A602984E3750cBA7770F680ea6493e2567FD65e";

async function main() {
  console.log("====================================================");
  console.log("🔍 STARTING DEPLOYMENT AUDIT & VERIFICATION");
  console.log("====================================================\n");

  let errors = 0;

  // 1. Check BrokexVault configuration
  console.log("--- 1. Auditing BrokexVault ---");
  const vault = await ethers.getContractAt("BrokexVault", VAULT_ADDRESS);
  
  try {
    const vaultUsdc = await vault.USDC();
    if (vaultUsdc.toLowerCase() === EXPECTED_USDC.toLowerCase()) {
      console.log(`✅ Vault USDC is correct: ${vaultUsdc}`);
    } else {
      console.error(`❌ ERROR: Vault USDC address is mismatch! Found: ${vaultUsdc}, Expected: ${EXPECTED_USDC}`);
      errors++;
    }
  } catch (err) {
    console.error(`❌ ERROR: Failed to call USDC() on Vault:`, err.message);
    errors++;
  }

  try {
    const vaultCore = await vault.primaryCore();
    if (vaultCore.toLowerCase() === CORE_ADDRESS.toLowerCase()) {
      console.log(`✅ Vault primaryCore link is correct: ${vaultCore}`);
    } else {
      console.error(`❌ ERROR: Vault primaryCore is mismatch! Found: ${vaultCore}, Expected: ${CORE_ADDRESS}`);
      errors++;
    }
  } catch (err) {
    console.error(`❌ ERROR: Failed to call primaryCore() on Vault:`, err.message);
    errors++;
  }

  // 2. Check BrokexCore configuration
  console.log("\n--- 2. Auditing BrokexCore ---");
  const core = await ethers.getContractAt("BrokexCore", CORE_ADDRESS);

  try {
    const coreUsdc = await core.USDC();
    if (coreUsdc.toLowerCase() === EXPECTED_USDC.toLowerCase()) {
      console.log(`✅ Core USDC is correct: ${coreUsdc}`);
    } else {
      console.error(`❌ ERROR: Core USDC address is mismatch! Found: ${coreUsdc}, Expected: ${EXPECTED_USDC}`);
      errors++;
    }
  } catch (err) {
    console.error(`❌ ERROR: Failed to call USDC() on Core:`, err.message);
    errors++;
  }

  try {
    const coreOracle = await core.oracle();
    if (coreOracle.toLowerCase() === EXPECTED_ORACLE.toLowerCase()) {
      console.log(`✅ Core Oracle is correct: ${coreOracle}`);
    } else {
      console.error(`❌ ERROR: Core Oracle address is mismatch! Found: ${coreOracle}, Expected: ${EXPECTED_ORACLE}`);
      errors++;
    }
  } catch (err) {
    console.error(`❌ ERROR: Failed to call oracle() on Core:`, err.message);
    errors++;
  }

  try {
    const coreVault = await core.vault();
    if (coreVault.toLowerCase() === VAULT_ADDRESS.toLowerCase()) {
      console.log(`✅ Core Vault link is correct: ${coreVault}`);
    } else {
      console.error(`❌ ERROR: Core Vault is mismatch! Found: ${coreVault}, Expected: ${VAULT_ADDRESS}`);
      errors++;
    }
  } catch (err) {
    console.error(`❌ ERROR: Failed to call vault() on Core:`, err.message);
    errors++;
  }

  // 3. Check BrokexLens configuration
  console.log("\n--- 3. Auditing BrokexLens ---");
  const lens = await ethers.getContractAt("BrokexLens", LENS_ADDRESS);

  try {
    const lensCore = await lens.core();
    if (lensCore.toLowerCase() === CORE_ADDRESS.toLowerCase()) {
      console.log(`✅ Lens Core link is correct: ${lensCore}`);
    } else {
      console.error(`❌ ERROR: Lens Core is mismatch! Found: ${lensCore}, Expected: ${CORE_ADDRESS}`);
      errors++;
    }
  } catch (err) {
    console.error(`❌ ERROR: Failed to call core() on Lens:`, err.message);
    errors++;
  }

  try {
    const lensVault = await lens.vault();
    if (lensVault.toLowerCase() === VAULT_ADDRESS.toLowerCase()) {
      console.log(`✅ Lens Vault link is correct: ${lensVault}`);
    } else {
      console.error(`❌ ERROR: Lens Vault is mismatch! Found: ${lensVault}, Expected: ${VAULT_ADDRESS}`);
      errors++;
    }
  } catch (err) {
    console.error(`❌ ERROR: Failed to call vault() on Lens:`, err.message);
    errors++;
  }

  console.log("\n====================================================");
  if (errors === 0) {
    console.log("🏆 SUCCESS: All contracts are perfectly verified, linked, and active!");
  } else {
    console.error(`⚠️ FAILED: Found ${errors} inconsistency/inconsistencies during validation.`);
  }
  console.log("====================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
