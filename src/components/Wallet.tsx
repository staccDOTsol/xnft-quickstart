import {
  ConnectionProvider,
  WalletProvider,
} from "wallet-adapter-react-xnft";

import React from "react";
declare global {
  interface Window {
    xnft: any;
  }
}
export const DEFAULT_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_URL || "https://rpc.helius.xyz/?api-key=6b1ccd35-ba2d-472a-8f54-9ac2c3c40b8b";

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

export const Wallet: any = ({ children } : any) => {
return (
    <ConnectionProvider endpoint={DEFAULT_ENDPOINT}>
      <WalletProvider wallets={window.xnft?.solana} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
