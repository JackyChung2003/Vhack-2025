require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    holesky: {
      url: process.env.HOLESKY_RPC_URL || "https://ethereum-holesky.publicnode.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 17000
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
