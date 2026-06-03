const { ethers } = require("hardhat");

const VAULT_ADDRESS = "0x589178934112DbBa96C17384079206a21B4F20DA";
const CORE_ADDRESS = "0xC644c18E5F018696D97F407B0c8937D8c5a30424";
const NEW_OWNER = "0x51DD8C24633a2C5ca794A6405590d9246a8721eF";

async function main() {
  console.log("====================================================");
  console.log("🗝️ INITIATING TWO-STEP OWNERSHIP TRANSFER");
  console.log(`Target Address (New Owner): ${NEW_OWNER}`);
  console.log("====================================================\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Current Owner executing transaction: ${deployer.address}\n`);

  const vault = await ethers.getContractAt("BrokexVault", VAULT_ADDRESS);
  const core = await ethers.getContractAt("BrokexCore", CORE_ADDRESS);

  // 1. Initiate transfer on BrokexVault
  console.log("1. Initiating ownership transfer on BrokexVault...");
  const txVault = await vault.transferOwnership(NEW_OWNER);
  console.log(`Transaction hash: ${txVault.hash}`);
  await txVault.wait();
  console.log(`✅ Ownership transfer initiated on Vault. Pending owner is now: ${NEW_OWNER}\n`);

  // 2. Initiate transfer on BrokexCore
  console.log("2. Initiating ownership transfer on BrokexCore...");
  const txCore = await core.transferOwnership(NEW_OWNER);
  console.log(`Transaction hash: ${txCore.hash}`);
  await txCore.wait();
  console.log(`✅ Ownership transfer initiated on Core. Pending owner is now: ${NEW_OWNER}\n`);

  console.log("====================================================");
  console.log("🎉 FIRST STEP COMPLETED!");
  console.log("----------------------------------------------------");
  console.log(`To finalize the transfer, you must connect your Ledger wallet (${NEW_OWNER})`);
  console.log("and call acceptOwnership() on both contracts.");
  console.log("====================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
