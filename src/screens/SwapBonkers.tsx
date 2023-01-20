import { useWallet } from 'wallet-adapter-react-xnft';
import { PublicKey } from '@solana/web3.js';
import { Swap, useStrataSdks } from "strata-foundation-react-xnft/src";
import React from 'react';


const Home: any = ({ children }: any) => {
const { tokenBondingSdk } = useStrataSdks() 
const wallet = useWallet()
  return (
    <div style={{padding: "0 2rem"}}>
      

      <main style={ {
  minHeight: "100vh",
  padding: "4rem 0",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center"
}}>
        
          <div style={{ width: "400px" }}>
            { wallet && wallet.publicKey && tokenBondingSdk && <Swap  id={new PublicKey("4Vyh36V9dYQdqUtxWc2nEzvezLjKn5qW5rPWACo8wddF")} />}
          </div>
          
      </main>
    </div>
  );
};

export default Home;
