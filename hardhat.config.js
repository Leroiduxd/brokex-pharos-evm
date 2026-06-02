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
      accounts: ["2d0d2e6bc5d4f0ca8566b964cb575dfc819df31542d3d9bd66657d014794f0f9"],
    },
  },
};
