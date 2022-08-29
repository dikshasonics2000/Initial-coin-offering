const {ethers} = require("hardhat");
require("dotenv").config({path: ".env"});
const {CRYPTO_DEVS_NFT_CONTRACT_ADDRESS} = require("../constants"); // importing the nft collection contract address

async function main() {
  const cryptoDevsNFTContract = CRYPTO_DEVS_NFT_CONTRACT_ADDRESS;
  const cryptoDevTokensContract = await ethers.getContractFactory("CryptoDevToken"); //this is the contract that we are providing it some factory libraries to use. In other words it promises us to give it to us
  const deployCryptoDevsToken = await cryptoDevTokensContract.deploy(cryptoDevsNFTContract); // this promises in return to deploy the contract and promises the contract to smoothly run the contract functions like mint and claim

  console.log("Crypto devs token address", deployCryptoDevsToken.address); // this shows the address of the contract crypto devs
}

main()
.then(() => process.exit(0)) //if contract runs properly then exit with zero
.catch((error) => {
  console.error(error); // else if catch an error then throw the error 
  process.exit(1); // exit with process 1
}
);
