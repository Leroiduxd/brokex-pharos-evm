require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    pharos: {
      url: "https://atlantic.dplabs-internal.com",
      accounts: ["0xe12f9b03327a875c2d5bf9b40a75cd2effeed46ea508ee595c6bc708c386da8c"],
    },
    pharosMainnet: {
      url: "https://rpc.pharos.xyz",
      // Add your Ledger physical wallet address here (e.g., "0xAbCd...")
      // Hardhat will prompt you on your device to sign the transaction when you run the deploy script.
      ledgerAccounts: [
        "0xYourLedgerAddressHere" 
      ],
    },
  },
};
