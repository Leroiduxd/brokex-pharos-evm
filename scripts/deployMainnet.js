const { ethers } = require("hardhat");

// --- CONFIGURATION ---
const USDC_ADDRESS = "0xc879c018db60520f4355c26ed1a6d572cdac1815";
const SUPRA_ORACLE_ADDRESS = "0x16f70cAD28dd621b0072B5A8a8c392970E87C3dD";

// Set your production AWS KMS signer address here
const KMS_SIGNER_ADDRESS = "0x51DD8C24633a2C5ca794A6405590d9246a8721eF"; 

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("====================================================");
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);
  console.log("====================================================\n");

  if (KMS_SIGNER_ADDRESS === "0xYourKmsSignerAddressHere") {
    console.error("❌ ERROR: Please replace KMS_SIGNER_ADDRESS with your actual signer address in the script before deploying!");
    process.exit(1);
  }

  // 1. Use already deployed BrokexVault
  const vaultAddress = "0x589178934112DbBa96C17384079206a21B4F20DA";
  console.log(`1. Using already deployed BrokexVault at: ${vaultAddress}`);
  const vault = await ethers.getContractAt("BrokexVault", vaultAddress);

  // 2. Deploy BrokexCore
  console.log("\n2. Deploying BrokexCore...");
  const BrokexCore = await ethers.getContractFactory("BrokexCore");
  const core = await BrokexCore.deploy(
    USDC_ADDRESS,
    SUPRA_ORACLE_ADDRESS,
    vaultAddress,
    KMS_SIGNER_ADDRESS
  );
  await core.waitForDeployment();
  const coreAddress = await core.getAddress();
  console.log(`✅ BrokexCore deployed at: ${coreAddress}`);

  // 3. Set primary Core on Vault
  console.log("\n3. Setting primary Core address on BrokexVault...");
  const setCoreTx = await vault.setPrimaryCore(coreAddress);
  await setCoreTx.wait();
  console.log("✅ Core linked to Vault successfully!");

  // 4. Deploy BrokexLens
  console.log("\n4. Deploying BrokexLens...");
  const BrokexLens = await ethers.getContractFactory("BrokexLens");
  const lens = await BrokexLens.deploy(coreAddress, vaultAddress);
  await lens.waitForDeployment();
  const lensAddress = await lens.getAddress();
  console.log(`✅ BrokexLens deployed at: ${lensAddress}`);

  console.log("\n====================================================");
  console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("----------------------------------------------------");
  console.log(`BrokexVault: ${vaultAddress}`);
  console.log(`BrokexCore:  ${coreAddress}`);
  console.log(`BrokexLens:  ${lensAddress}`);
  console.log("====================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
