require("@nomiclabs/hardhat-waffle");
require("@nomicfoundation/hardhat-toolbox");


require("dotenv").config({path: ".env"})

const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL; //alchemy key gives you access to the rinkeby network
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.10",
  networks: {
    rinkeby: {
      url: ALCHEMY_API_KEY_URL,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
  },
};