import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';
import Web3Modal from "web3modal"
import {BigNumber, Contract, utils, providers} from "ethers";
import {NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS} from "../constants";

export default function Home() {

const zero = BigNumber.from(0);

const web3ModalRef = useRef(); // it returns a reference and its instance will live for the full time the page is working... so we like its good that user is connected all the while it is working or using the project
const [walletConnected, setWalletConnected] = useState(false);
const [tokensMinted, setTokensMinted] = useState(zero);
const [balanceOfCryptoTokens, setBalanceOfCryptoToken] = useState(zero);
const [tokenAmount, setTokenAmount] = useState(zero);
const [loading, setloading] = useState(false);
const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);

const getProviderOrSigner = async(needSigner = false) => { // web3modal does evrything thats working inside this function
const provider = await web3ModalRef.current.connect(); //reads value like metamask is a provider . Connects with the current value of web3modal and wraps around the web3provider 
const web3Provider = new providers.Web3Provider(provider);
//web3Provider is a class of providers that tells which provider to connect to and it wraps the provider in it and assigns it




    const {chainId} = await  web3Provider.getNetwork();

    if(chainId !== 4) {
      window.alert("Change the network to rinkeby");
      throw new Error("Change the network to rinkeby");
    }

    if(needSigner == true) { // if you need the signer
      const signer = web3Provider.getSigner(); // use getSigner() to get it
      return signer; // and return it
    }



    return web3Provider;  // if you dont need the signer then get only the signer

};

const getTokensToBeClaimed = async() => {
  try {
    
    const provider = await getProviderOrSigner();
 const nftContract = new Contract (
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
  provider 
 );
 const tokenContract = new Contract (
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  provider 
 );

 const signer = await getProviderOrSigner(true);
 const address = await signer.getAddress();
 const balance = await nftContract.balanceOf(address);

 if(balance === zero) {
  setTokensToBeClaimed(zero);
 }
 else {
  var amount = 0;
   for(var i = 0; i < balance; i++) {
    const tokenId = await nftContract.tokenOfOwnerByIndex(address, i); // take the tokenid of the nft holder to claim
    const claimed = await tokenContract.tokenIdsClaimed(tokenId); // claim the token for this tokenId
    if(!claimed) {
      amount++;
    }
   }

   setTokensToBeClaimed(BigNumber.from(amount));
 }

  } catch (error) {
    console.error(error);
    setTokensToBeClaimed(zero);
  }
}


const getBalanceOfCryptoDevTokens  = async() => {
  try {
    const provider = await getProviderOrSigner();
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    );

    const signer = await getProviderOrSigner(true); // we want to change state and require a personal thing that is address and thus it needs a signer
    const address = await signer.getAddress(); // we are getting the address from the signer
    const balance = await tokenContract.balanceOf(address); //balance of the nft holder that is no. of oken of the nft holder which can be get by the nft collection contract interface and it takes input  as the holders address to return its balance
    setBalanceOfCryptoToken(balance); // then we set the balance like using the given function
  } catch (error) {
    console.error(error);
    
  }
};


const getTotalTokenMinted = async() => {
  try {

    const provider = await getProviderOrSigner();
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    );

    const _tokensMinted = await tokenContract.totalSupply(); // to get total number of tokens already minted out of 10000..... total supply returns the total tokens present
    setTokensMinted(_tokensMinted);

  } catch (error) {
    console.error(error);
    
  }
}
const mintCryptoDevToken = async (amount) => {
  try {
    const signer = await getProviderOrSigner(true)
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer
    );

    const value = 0.001*amount;

    const txn = await tokenContract.mint(amount, { //utils simply changes the big number to normal
      value: utils.parseEther(value.toString()),   // we are providing the transaction to happen that will mint the nft token that will be 10 into the gas 0.001
    });

    setloading(true); // 
    await txn.wait();
    setloading(false);
    window.alert("Succesfully minted the crypto dev");
    await getBalanceOfCryptoDevTokens();
    await getTotalTokenMinted();
    await getTokensToBeClaimed();


  } catch (error) {
    console.error(error);
    
  }
}

const claimCryptoDevTokens = async() => {
  try {

    const signer = await getProviderOrSigner(true);
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer
    );
   
    const tx = await tokenContract.claim();
    setloading(true);
    // wait for the transaction to get mined
    await tx.wait();
    setloading(false);
    window.alert("Sucessfully claimed Crypto Dev Tokens");
    await getBalanceOfCryptoDevTokens();
    await getTotalTokensMinted();
    await getTokensToBeClaimed();
    
  } catch (error) {
    console.error(error);
    
  }
}

const renderButton = () => {

  if(loading) {
    return (
      <div>
        <button className={styles.button}> Loading... </button>
      </div>
    );
  }

  if(tokensToBeClaimed > 0) { // no of the tokens the user can claim(amount)
    return(
      <div>
        <div className={styles.description}>
          {tokensToBeClaimed} / 10 Tokens to be claimed!
        </div>
        <button className={styles.button} onClick={claimCryptoDevTokens}>
          Claim Tokens
        </button>


      </div>
    )
  }
  return (
    <div style={{display: "flex-col"}}> 
    <div>
      <input type="number" placeholder="amount of tokens" onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
       />
       <button className={styles.button} 
       disabled={!(tokenAmount > 0)}
       onClick={() => mintCryptoDevToken(tokenAmount)}>
        Mint Tokens
       </button>
    </div>

    </div>

  )
}
const connectWallet = async () => {
  try {
    await getProviderOrSigner();
    setWalletConnected(true);
  }
  catch(err) {
    console.error(err);
  }
}
useEffect(() => {   //prompt the metamask itself to connect wallet
if(!walletConnected) {  // we connect it using web3 modal so we create its instance and we keep track of that instance modal
web3ModalRef.current = new Web3Modal({
  network: "rinkeby",
  providerOptions: {},             // This is actually called when the wallet is not connected.
  disableInjectedProvider: false,
});
connectWallet();
 getBalanceOfCryptoDevTokens();
getTotalTokenMinted();
 getTokensToBeClaimed();
}
}, [walletConnected]);

  return (
   <div>
    
      <title> Crypt0 Dev ICO</title>
      <meta name="description" content="ICO-dapp" />
      <link rel ="icon" href="./favicon.ico" />
    
    <div className={styles.main}>
    <div>
    <h1 className={styles.title}>Welcome to Crypto Devs ICO</h1>
    <div className={styles.description}>
      You can claim or mint Crypto Dev tokens here
    </div>
    {
      walletConnected ? (
      <div>
        <div className={styles.description}>
        You have minted {utils.formatEther(balanceOfCryptoTokens)} Crypto Dev tokens
          </div>
        <div className={styles.description}>
          Overall {utils.formatEther(tokensMinted)} / 10000 have been minted 
          </div>
          {renderButton()}
      </div>
      ) : (<button onClick={connectWallet} className={styles.button}>
        Connect your wallet
      </button>
      )}
      <div>
        <img className={styles.image} src="./0.svg" />
      </div>
      <div>
        <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
        </footer>
      </div>

    
   </div>
   </div>
   </div>
  );
}
// takes big number and converts it into string..... the utils does