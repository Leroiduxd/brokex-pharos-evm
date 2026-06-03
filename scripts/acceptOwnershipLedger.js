const { ethers } = require("hardhat");

const VAULT_ADDRESS = "0x589178934112DbBa96C17384079206a21B4F20DA";
const CORE_ADDRESS = "0xC644c18E5F018696D97F407B0c8937D8c5a30424";
const LEDGER_ADDRESS = "0x51DD8C24633a2C5ca794A6405590d9246a8721eF";

async function main() {
  console.log("====================================================");
  console.log("🗝️ FINALIZING TWO-STEP OWNERSHIP TRANSFER");
  console.log(`Accepting ownership with Ledger wallet: ${LEDGER_ADDRESS}`);
  console.log("====================================================\n");

  // Fetch the ledger signer
  const signer = await ethers.getSigner(LEDGER_ADDRESS);

  const vault = await ethers.getContractAt("BrokexVault", VAULT_ADDRESS, signer);
  const core = await ethers.getContractAt("BrokexCore", CORE_ADDRESS, signer);

  // 1. Accept ownership on BrokexVault
  console.log("1. Calling acceptOwnership() on BrokexVault...");
  const txVault = await vault.acceptOwnership();
  console.log(`Transaction hash: ${txVault.hash}`);
  console.log("Please confirm the transaction on your Ledger device...");
  await txVault.wait();
  console.log("✅ Ownership successfully accepted on BrokexVault!\n");

  // 2. Accept ownership on BrokexCore
  console.log("2. Calling acceptOwnership() on BrokexCore...");
  const txCore = await core.acceptOwnership();
  console.log(`Transaction hash: ${txCore.hash}`);
  console.log("Please confirm the transaction on your Ledger device...");
  await txCore.wait();
  console.log("✅ Ownership successfully accepted on BrokexCore!\n");

  console.log("====================================================");
  console.log("🏆 OWNERSHIP TRANSFER COMPLETE!");
  console.log(`Your Ledger wallet (${LEDGER_ADDRESS}) is now the official owner of both contracts!`);
  console.log("====================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
