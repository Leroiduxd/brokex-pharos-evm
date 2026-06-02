require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ledger");

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
        "0x51DD8C24633a2C5ca794A6405590d9246a8721eF" 
      ],
    },
  },
};
