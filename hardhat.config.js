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
  },
};
